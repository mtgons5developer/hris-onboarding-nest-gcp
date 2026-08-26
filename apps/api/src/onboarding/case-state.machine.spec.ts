import { CaseStatus } from '@prisma/client';
import { assertCaseTransition, CASE_TRANSITIONS } from './case-state.machine';

describe('case state machine', () => {
  it('allows the happy path', () => {
    expect(() => assertCaseTransition(CaseStatus.invited, CaseStatus.in_progress)).not.toThrow();
    expect(() => assertCaseTransition(CaseStatus.in_progress, CaseStatus.pending_hr)).not.toThrow();
    expect(() => assertCaseTransition(CaseStatus.pending_hr, CaseStatus.completed)).not.toThrow();
  });

  it('rejects completed → invited', () => {
    expect(() => assertCaseTransition(CaseStatus.completed, CaseStatus.invited)).toThrow(
      /Illegal case transition/,
    );
  });

  it('allows cancel from active states', () => {
    expect(CASE_TRANSITIONS.invited).toContain(CaseStatus.cancelled);
    expect(CASE_TRANSITIONS.in_progress).toContain(CaseStatus.cancelled);
    expect(CASE_TRANSITIONS.pending_hr).toContain(CaseStatus.cancelled);
    expect(CASE_TRANSITIONS.completed).toEqual([]);
  });
});
