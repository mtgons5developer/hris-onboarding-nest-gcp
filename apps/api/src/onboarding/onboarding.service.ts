import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CaseStatus,
  Prisma,
  TaskAssigneeRole,
  TaskStatus,
  User,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { FirebaseAdminService } from '../identity/firebase-admin.service';
import { NOTIFICATION_PORT, NotificationPort } from '../notifications/notification.port';
import { assertCaseTransition } from './case-state.machine';
import { CreateCaseDto } from './dto/create-case.dto';

const DEFAULT_TASKS: Prisma.OnboardingTaskCreateWithoutCaseInput[] = [
  { code: 'PROFILE', title: 'Complete personal profile', assigneeRole: TaskAssigneeRole.employee, sortOrder: 1 },
  { code: 'HANDBOOK', title: 'Acknowledge employee handbook', assigneeRole: TaskAssigneeRole.employee, sortOrder: 2 },
  { code: 'ID_DOC', title: 'Upload government-issued ID', assigneeRole: TaskAssigneeRole.employee, sortOrder: 3 },
  { code: 'TAX_STUB', title: 'Submit tax information stub', assigneeRole: TaskAssigneeRole.employee, sortOrder: 4 },
  { code: 'MANAGER_INTRO', title: 'Manager welcome / first-week plan', assigneeRole: TaskAssigneeRole.manager, sortOrder: 5 },
];

const caseInclude = {
  employee: true,
  offer: true,
  tasks: { orderBy: { sortOrder: 'asc' as const } },
  documents: true,
} satisfies Prisma.OnboardingCaseInclude;

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly firebase: FirebaseAdminService,
    @Inject(NOTIFICATION_PORT) private readonly notify: NotificationPort,
  ) {}

  async listCases(actor: User) {
    const where = await this.scopeWhere(actor);
    return this.prisma.onboardingCase.findMany({
      where,
      include: caseInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCase(id: string, actor: User) {
    const onboardingCase = await this.prisma.onboardingCase.findUnique({
      where: { id },
      include: caseInclude,
    });
    if (!onboardingCase) throw new NotFoundException('Case not found');
    this.assertCanRead(onboardingCase.employeeId, onboardingCase.employee.managerEmployeeId, actor);
    return onboardingCase;
  }

  async createCase(dto: CreateCaseDto, actor: User) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    if (dto.offerId) {
      const offer = await this.prisma.offer.findUnique({ where: { id: dto.offerId } });
      if (!offer || offer.employeeId !== dto.employeeId) {
        throw new BadRequestException('Offer does not belong to employee');
      }
    } else if (dto.title) {
      await this.prisma.offer.create({
        data: {
          employeeId: dto.employeeId,
          title: dto.title,
          startDate: new Date(),
          createdByUserId: actor.id,
        },
      });
    }

    const created = await this.prisma.onboardingCase.create({
      data: {
        employeeId: dto.employeeId,
        offerId: dto.offerId,
        status: CaseStatus.invited,
        tasks: { create: DEFAULT_TASKS },
      },
      include: caseInclude,
    });

    await this.audit.append({
      actorUserId: actor.id,
      action: 'CASE_CREATED',
      entityType: 'onboarding_case',
      entityId: created.id,
      afterJson: { status: created.status, employeeId: created.employeeId },
    });
    return created;
  }

  async invite(id: string, actor: User) {
    const onboardingCase = await this.getCase(id, actor);
    const employee = onboardingCase.employee;

    let user = await this.prisma.user.findUnique({ where: { employeeId: employee.id } });
    if (!user) {
      user = await this.prisma.user.upsert({
        where: { email: employee.workEmail },
        update: { employeeId: employee.id, role: UserRole.employee },
        create: {
          firebaseUid: `pending-${employee.id}`,
          email: employee.workEmail,
          displayName: `${employee.firstName} ${employee.lastName}`,
          role: UserRole.employee,
          employeeId: employee.id,
        },
      });
    }

    await this.firebase.setRoleClaim(user.firebaseUid, UserRole.employee);
    await this.notify.sendInvite({
      to: employee.workEmail,
      caseId: onboardingCase.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
    });

    const updated = await this.prisma.onboardingCase.update({
      where: { id },
      data: { invitedAt: new Date() },
      include: caseInclude,
    });

    await this.audit.append({
      actorUserId: actor.id,
      action: 'CASE_INVITED',
      entityType: 'onboarding_case',
      entityId: id,
      afterJson: { invitedAt: updated.invitedAt, userId: user.id },
    });
    return updated;
  }

  async accept(id: string, actor: User) {
    const onboardingCase = await this.getCase(id, actor);
    if (actor.role === UserRole.employee && actor.employeeId !== onboardingCase.employeeId) {
      throw new ForbiddenException('Not your case');
    }
    assertCaseTransition(onboardingCase.status, CaseStatus.in_progress);
    return this.transition(id, actor, CaseStatus.in_progress, 'CASE_ACCEPTED');
  }

  async patchTask(taskId: string, status: TaskStatus, actor: User) {
    const task = await this.prisma.onboardingTask.findUnique({
      where: { id: taskId },
      include: { case: { include: { employee: true } } },
    });
    if (!task) throw new NotFoundException('Task not found');
    this.assertCanRead(task.case.employeeId, task.case.employee.managerEmployeeId, actor);

    if (actor.role === UserRole.employee) {
      if (task.assigneeRole !== TaskAssigneeRole.employee) {
        throw new ForbiddenException('Employee cannot complete this task');
      }
      if (actor.employeeId !== task.case.employeeId) {
        throw new ForbiddenException('Not your task');
      }
    }
    if (actor.role === UserRole.manager && task.assigneeRole !== TaskAssigneeRole.manager) {
      throw new ForbiddenException('Manager can only complete manager tasks');
    }

    const updated = await this.prisma.onboardingTask.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === TaskStatus.done || status === TaskStatus.waived ? new Date() : null,
      },
    });
    await this.audit.append({
      actorUserId: actor.id,
      action: 'TASK_UPDATED',
      entityType: 'onboarding_task',
      entityId: taskId,
      beforeJson: { status: task.status },
      afterJson: { status: updated.status },
    });
    return updated;
  }

  async submit(id: string, actor: User) {
    const onboardingCase = await this.getCase(id, actor);
    if (actor.role === UserRole.employee && actor.employeeId !== onboardingCase.employeeId) {
      throw new ForbiddenException('Not your case');
    }
    const employeeTasks = onboardingCase.tasks.filter((t) => t.assigneeRole === TaskAssigneeRole.employee);
    const incomplete = employeeTasks.filter((t) => t.status === TaskStatus.pending || t.status === TaskStatus.rejected);
    if (incomplete.length) {
      throw new BadRequestException('Complete all employee tasks before submitting for HR review');
    }
    assertCaseTransition(onboardingCase.status, CaseStatus.pending_hr);
    return this.transition(id, actor, CaseStatus.pending_hr, 'CASE_SUBMITTED');
  }

  async approve(id: string, actor: User) {
    const onboardingCase = await this.getCase(id, actor);
    assertCaseTransition(onboardingCase.status, CaseStatus.completed);
    const updated = await this.prisma.onboardingCase.update({
      where: { id },
      data: { status: CaseStatus.completed, completedAt: new Date() },
      include: caseInclude,
    });
    await this.prisma.employee.update({
      where: { id: onboardingCase.employeeId },
      data: { status: 'active' },
    });
    await this.audit.append({
      actorUserId: actor.id,
      action: 'CASE_APPROVED',
      entityType: 'onboarding_case',
      entityId: id,
      beforeJson: { status: onboardingCase.status },
      afterJson: { status: updated.status },
    });
    return updated;
  }

  async rejectToInProgress(id: string, actor: User) {
    const onboardingCase = await this.getCase(id, actor);
    assertCaseTransition(onboardingCase.status, CaseStatus.in_progress);
    return this.transition(id, actor, CaseStatus.in_progress, 'CASE_RETURNED');
  }

  private async transition(id: string, actor: User, to: CaseStatus, action: string) {
    const before = await this.prisma.onboardingCase.findUnique({ where: { id } });
    const updated = await this.prisma.onboardingCase.update({
      where: { id },
      data: { status: to },
      include: caseInclude,
    });
    await this.audit.append({
      actorUserId: actor.id,
      action,
      entityType: 'onboarding_case',
      entityId: id,
      beforeJson: { status: before?.status },
      afterJson: { status: updated.status },
    });
    return updated;
  }

  private async scopeWhere(actor: User): Promise<Prisma.OnboardingCaseWhereInput> {
    if (actor.role === UserRole.hr_admin || actor.role === UserRole.system_admin) {
      return { tenantId: actor.tenantId };
    }
    if (actor.role === UserRole.employee) {
      return { employeeId: actor.employeeId ?? '__none__' };
    }
    if (actor.role === UserRole.manager && actor.employeeId) {
      return { employee: { managerEmployeeId: actor.employeeId } };
    }
    return { id: '__none__' };
  }

  private assertCanRead(employeeId: string, managerEmployeeId: string | null, actor: User) {
    if (actor.role === UserRole.hr_admin || actor.role === UserRole.system_admin) return;
    if (actor.role === UserRole.employee && actor.employeeId === employeeId) return;
    if (actor.role === UserRole.manager && actor.employeeId && managerEmployeeId === actor.employeeId) {
      return;
    }
    throw new ForbiddenException('Not allowed to view this case');
  }
}
