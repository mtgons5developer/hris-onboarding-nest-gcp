import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CaseStatus, TaskAssigneeRole, TaskStatus, UserRole } from '@prisma/client';
import { OnboardingService } from './onboarding.service';

const hr = {
  id: 'hr-1',
  role: UserRole.hr_admin,
  employeeId: null,
  tenantId: 1,
} as never;

const employee = {
  id: 'emp-user',
  role: UserRole.employee,
  employeeId: 'emp-1',
  tenantId: 1,
} as never;

function makeService(overrides: Record<string, unknown> = {}) {
  const prisma: any = {
    onboardingCase: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    onboardingTask: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    employee: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn(), upsert: jest.fn() },
    offer: { findUnique: jest.fn(), create: jest.fn() },
    ...overrides,
  };
  const audit = { append: jest.fn() };
  const idp = { setRoleClaim: jest.fn() };
  const notify = { sendInvite: jest.fn() };
  return {
    service: new OnboardingService(prisma, audit as never, idp as never, notify as never),
    prisma,
    audit,
    notify,
  };
}

describe('OnboardingService', () => {
  it('submits only when employee tasks are complete', async () => {
    const { service, prisma } = makeService();
    prisma.onboardingCase.findUnique.mockResolvedValue({
      id: 'c1',
      status: CaseStatus.in_progress,
      employeeId: 'emp-1',
      employee: { managerEmployeeId: null },
      tasks: [
        { assigneeRole: TaskAssigneeRole.employee, status: TaskStatus.done },
        { assigneeRole: TaskAssigneeRole.manager, status: TaskStatus.pending },
      ],
      documents: [],
    });
    prisma.onboardingCase.update.mockImplementation(({ data }: any) => ({
      id: 'c1',
      status: data.status,
      employee: { managerEmployeeId: null },
      tasks: [],
      documents: [],
    }));

    const result = await service.submit('c1', employee);
    expect(result.status).toBe(CaseStatus.pending_hr);
  });

  it('blocks submit when employee tasks remain pending', async () => {
    const { service, prisma } = makeService();
    prisma.onboardingCase.findUnique.mockResolvedValue({
      id: 'c1',
      status: CaseStatus.in_progress,
      employeeId: 'emp-1',
      employee: { managerEmployeeId: null },
      tasks: [{ assigneeRole: TaskAssigneeRole.employee, status: TaskStatus.pending }],
      documents: [],
    });
    await expect(service.submit('c1', employee)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('denies employee reading another case', async () => {
    const { service, prisma } = makeService();
    prisma.onboardingCase.findUnique.mockResolvedValue({
      id: 'c2',
      employeeId: 'someone-else',
      employee: { managerEmployeeId: null },
      tasks: [],
      documents: [],
    });
    await expect(service.getCase('c2', employee)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('approve completes the case and activates the employee (candidate → active)', async () => {
    const { service, prisma, audit } = makeService();
    prisma.onboardingCase.findUnique.mockResolvedValue({
      id: 'c1',
      status: CaseStatus.pending_hr,
      employeeId: 'emp-1',
      employee: { managerEmployeeId: null, status: 'candidate' },
      tasks: [],
      documents: [],
    });
    prisma.employee.update.mockResolvedValue({ id: 'emp-1', status: 'active' });
    prisma.onboardingCase.update.mockImplementation(({ data }: { data: { status: CaseStatus } }) => ({
      id: 'c1',
      status: data.status,
      employeeId: 'emp-1',
      employee: { managerEmployeeId: null, status: 'active' },
      tasks: [],
      documents: [],
    }));

    const result = await service.approve('c1', hr);
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: { status: 'active' },
    });
    expect(result.status).toBe(CaseStatus.completed);
    expect(audit.append).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CASE_APPROVED',
        afterJson: { status: CaseStatus.completed, employeeStatus: 'active' },
      }),
    );
  });

  it('managers only list cases for their reports', async () => {
    const manager = {
      id: 'm-user',
      role: UserRole.manager,
      employeeId: 'maya-emp',
      tenantId: 1,
    } as never;
    const { service, prisma } = makeService();
    prisma.onboardingCase.findMany.mockResolvedValue([]);
    await service.listCases(manager);
    expect(prisma.onboardingCase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { employee: { managerEmployeeId: 'maya-emp' } },
      }),
    );
  });
});
