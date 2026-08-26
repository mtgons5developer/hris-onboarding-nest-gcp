import { Module } from '@nestjs/common';
import { ConsoleNotificationService } from './console-notification.service';
import { NOTIFICATION_PORT } from './notification.port';

@Module({
  providers: [{ provide: NOTIFICATION_PORT, useClass: ConsoleNotificationService }],
  exports: [NOTIFICATION_PORT],
})
export class NotificationsModule {}
