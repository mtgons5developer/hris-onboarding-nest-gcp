import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { RolesGuard } from '../identity/roles.guard';
import { Roles } from '../identity/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.hr_admin, UserRole.system_admin)
@Controller('api/v1/audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.audit.list({ entityType, entityId });
  }
}
