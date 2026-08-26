import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';
import { OnboardingService } from './onboarding.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { PatchTaskDto } from './dto/patch-task.dto';
import { FirebaseAuthGuard } from '../identity/firebase-auth.guard';
import { RolesGuard } from '../identity/roles.guard';
import { Roles } from '../identity/roles.decorator';
import { CurrentUser } from '../identity/current-user.decorator';

@ApiTags('onboarding')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('api/v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get('cases')
  list(@CurrentUser() user: User) {
    return this.onboarding.listCases(user);
  }

  @Post('cases')
  @Roles(UserRole.hr_admin)
  create(@Body() dto: CreateCaseDto, @CurrentUser() user: User) {
    return this.onboarding.createCase(dto, user);
  }

  @Get('cases/:id')
  get(@Param('id') id: string, @CurrentUser() user: User) {
    return this.onboarding.getCase(id, user);
  }

  @Post('cases/:id/invite')
  @Roles(UserRole.hr_admin)
  invite(@Param('id') id: string, @CurrentUser() user: User) {
    return this.onboarding.invite(id, user);
  }

  @Post('cases/:id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: User) {
    return this.onboarding.accept(id, user);
  }

  @Post('cases/:id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: User) {
    return this.onboarding.submit(id, user);
  }

  @Post('cases/:id/approve')
  @Roles(UserRole.hr_admin)
  approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.onboarding.approve(id, user);
  }

  @Post('cases/:id/return')
  @Roles(UserRole.hr_admin)
  returnToProgress(@Param('id') id: string, @CurrentUser() user: User) {
    return this.onboarding.rejectToInProgress(id, user);
  }

  @Patch('tasks/:id')
  patchTask(@Param('id') id: string, @Body() dto: PatchTaskDto, @CurrentUser() user: User) {
    return this.onboarding.patchTask(id, dto.status, user);
  }
}
