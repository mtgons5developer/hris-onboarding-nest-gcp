import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FirebaseAuthGuard } from '../identity/firebase-auth.guard';
import { RolesGuard } from '../identity/roles.guard';
import { Roles } from '../identity/roles.decorator';
import { CurrentUser } from '../identity/current-user.decorator';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('api/v1/employees')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  @Roles(UserRole.hr_admin, UserRole.system_admin, UserRole.manager)
  list() {
    return this.employees.list();
  }

  @Get(':id')
  @Roles(UserRole.hr_admin, UserRole.system_admin, UserRole.manager)
  get(@Param('id') id: string) {
    return this.employees.get(id);
  }

  @Post()
  @Roles(UserRole.hr_admin)
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: User) {
    return this.employees.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.hr_admin)
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @CurrentUser() user: User) {
    return this.employees.update(id, dto, user);
  }
}
