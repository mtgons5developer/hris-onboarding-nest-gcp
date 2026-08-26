import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuditService } from '../audit/audit.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(actor: User) {
    const where =
      actor.role === UserRole.manager && actor.employeeId
        ? { managerEmployeeId: actor.employeeId }
        : {};
    return this.prisma.employee.findMany({
      where,
      orderBy: { employeeNumber: 'asc' },
      include: {
        user: { select: { id: true, role: true, email: true, idpSub: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async get(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: { cases: true, offers: true, user: true, manager: true },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async create(dto: CreateEmployeeDto, actor: User) {
    const emp = await this.prisma.employee.create({
      data: {
        employeeNumber: dto.employeeNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        workEmail: dto.workEmail,
        department: dto.department,
        managerEmployeeId: dto.managerEmployeeId,
        status: dto.status,
        hiredAt: dto.hiredAt ? new Date(dto.hiredAt) : undefined,
      },
    });
    await this.audit.append({
      actorUserId: actor.id,
      action: 'EMPLOYEE_CREATED',
      entityType: 'employee',
      entityId: emp.id,
      afterJson: emp as object,
    });
    return emp;
  }

  async update(id: string, dto: UpdateEmployeeDto, actor: User) {
    const before = await this.get(id);
    const { hiredAt, ...rest } = dto;
    const emp = await this.prisma.employee.update({
      where: { id },
      data: {
        ...rest,
        ...(hiredAt ? { hiredAt: new Date(hiredAt) } : {}),
      },
    });
    await this.audit.append({
      actorUserId: actor.id,
      action: 'EMPLOYEE_UPDATED',
      entityType: 'employee',
      entityId: emp.id,
      beforeJson: { status: before.status },
      afterJson: { status: emp.status },
    });
    return emp;
  }
}
