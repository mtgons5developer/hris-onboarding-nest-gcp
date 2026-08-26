export interface NotificationPort {
  sendInvite(input: { to: string; caseId: string; employeeName: string }): Promise<void>;
}

export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');
