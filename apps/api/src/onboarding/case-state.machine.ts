import { CaseStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

const TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  invited: [CaseStatus.in_progress, CaseStatus.cancelled],
  in_progress: [CaseStatus.pending_hr, CaseStatus.cancelled],
  pending_hr: [CaseStatus.completed, CaseStatus.in_progress, CaseStatus.cancelled],
  completed: [],
  cancelled: [],
};

export function assertCaseTransition(from: CaseStatus, to: CaseStatus): void {
  if (!TRANSITIONS[from]?.includes(to)) {
    throw new BadRequestException(`Illegal case transition: ${from} → ${to}`);
  }
}

export { TRANSITIONS as CASE_TRANSITIONS };
