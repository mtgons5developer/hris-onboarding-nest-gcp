import { Injectable, Logger } from '@nestjs/common';
import { NotificationPort } from './notification.port';

@Injectable()
export class ConsoleNotificationService implements NotificationPort {
  private readonly logger = new Logger(ConsoleNotificationService.name);

  async sendInvite(input: { to: string; caseId: string; employeeName: string }): Promise<void> {
    this.logger.log(
      `[STUB EMAIL] Invite ${input.employeeName} <${input.to}> to onboarding case ${input.caseId}`,
    );
  }
}
