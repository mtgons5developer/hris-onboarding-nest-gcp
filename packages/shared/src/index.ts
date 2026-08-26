export const ROLES = ['hr_admin', 'manager', 'employee', 'system_admin'] as const;
export type Role = (typeof ROLES)[number];

export const CASE_STATUSES = [
  'invited',
  'in_progress',
  'pending_hr',
  'completed',
  'cancelled',
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const TASK_STATUSES = ['pending', 'done', 'waived', 'rejected'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const DEFAULT_ONBOARDING_TASKS = [
  {
    code: 'PROFILE',
    title: 'Complete personal profile',
    assigneeRole: 'employee' as const,
    sortOrder: 1,
  },
  {
    code: 'HANDBOOK',
    title: 'Acknowledge employee handbook',
    assigneeRole: 'employee' as const,
    sortOrder: 2,
  },
  {
    code: 'ID_DOC',
    title: 'Upload government-issued ID',
    assigneeRole: 'employee' as const,
    sortOrder: 3,
  },
  {
    code: 'TAX_STUB',
    title: 'Submit tax information stub',
    assigneeRole: 'employee' as const,
    sortOrder: 4,
  },
  {
    code: 'MANAGER_INTRO',
    title: 'Manager welcome / first-week plan',
    assigneeRole: 'manager' as const,
    sortOrder: 5,
  },
];
