import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { User } from '@prisma/client';

@ApiTags('identity')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('api/v1')
export class MeController {
  @Get('me')
  me(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      employeeId: user.employeeId,
      tenantId: user.tenantId,
    };
  }
}
