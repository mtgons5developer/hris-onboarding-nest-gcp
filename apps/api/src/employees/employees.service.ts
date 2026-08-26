import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuditService } from '../audit/audit.service';
import { User } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.employee.findMany({
      orderBy: { employeeNumber: 'asc' },
      include: { user: { select: { id: true, role: true, email: true } } },
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
    const emp = await this.prisma.employee.create({ data: dto });
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
    const emp = await this.prisma.employee.update({ where: { id }, data: dto });
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
