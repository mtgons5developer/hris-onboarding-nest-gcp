import { PrismaClient, UserRole, EmployeeStatus, OfferStatus, CaseStatus, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TASKS = [
  { code: 'PROFILE', title: 'Complete personal profile', assigneeRole: 'employee' as const, sortOrder: 1 },
  { code: 'HANDBOOK', title: 'Acknowledge employee handbook', assigneeRole: 'employee' as const, sortOrder: 2 },
  { code: 'ID_DOC', title: 'Upload government-issued ID', assigneeRole: 'employee' as const, sortOrder: 3 },
  { code: 'TAX_STUB', title: 'Submit tax information stub', assigneeRole: 'employee' as const, sortOrder: 4 },
  { code: 'MANAGER_INTRO', title: 'Manager welcome / first-week plan', assigneeRole: 'manager' as const, sortOrder: 5 },
];

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.documentMeta.deleteMany();
  await prisma.onboardingTask.deleteMany();
  await prisma.onboardingCase.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  const managerEmp = await prisma.employee.create({
    data: {
      employeeNumber: 'EMP-100',
      firstName: 'Maya',
      lastName: 'Santos',
      workEmail: 'maya.santos@lab.local',
      department: 'Engineering',
      status: EmployeeStatus.active,
      hiredAt: new Date('2022-03-01'),
    },
  });

  const newHire = await prisma.employee.create({
    data: {
      employeeNumber: 'EMP-201',
      firstName: 'Luis',
      lastName: 'Reyes',
      workEmail: 'luis.reyes@lab.local',
      department: 'Engineering',
      status: EmployeeStatus.candidate,
      managerEmployeeId: managerEmp.id,
      hiredAt: new Date('2026-09-01'),
    },
  });

  const invitedHire = await prisma.employee.create({
    data: {
      employeeNumber: 'EMP-202',
      firstName: 'Aria',
      lastName: 'Cruz',
      workEmail: 'aria.cruz@lab.local',
      department: 'People Ops',
      status: EmployeeStatus.candidate,
      managerEmployeeId: managerEmp.id,
    },
  });

  const hr = await prisma.user.create({
    data: {
      idpSub: 'dev-hr-admin',
      email: 'hr@lab.local',
      displayName: 'Harper Reyes (HR)',
      role: UserRole.hr_admin,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      idpSub: 'dev-manager',
      email: 'maya.santos@lab.local',
      displayName: 'Maya Santos',
      role: UserRole.manager,
      employeeId: managerEmp.id,
    },
  });

  const employeeUser = await prisma.user.create({
    data: {
      idpSub: 'dev-employee',
      email: 'luis.reyes@lab.local',
      displayName: 'Luis Reyes',
      role: UserRole.employee,
      employeeId: newHire.id,
    },
  });

  await prisma.user.create({
    data: {
      idpSub: 'dev-system-admin',
      email: 'sysadmin@lab.local',
      displayName: 'System Admin',
      role: UserRole.system_admin,
    },
  });

  const offer = await prisma.offer.create({
    data: {
      employeeId: newHire.id,
      title: 'Software Engineer I',
      startDate: new Date('2026-09-01'),
      status: OfferStatus.accepted,
      createdByUserId: hr.id,
    },
  });

  const inProgressCase = await prisma.onboardingCase.create({
    data: {
      employeeId: newHire.id,
      offerId: offer.id,
      status: CaseStatus.in_progress,
      invitedAt: new Date(),
      tasks: {
        create: DEFAULT_TASKS.map((t) => ({
          ...t,
          status: t.code === 'PROFILE' ? TaskStatus.done : TaskStatus.pending,
          completedAt: t.code === 'PROFILE' ? new Date() : null,
        })),
      },
    },
    include: { tasks: true },
  });

  const invitedCase = await prisma.onboardingCase.create({
    data: {
      employeeId: invitedHire.id,
      status: CaseStatus.invited,
      tasks: { create: DEFAULT_TASKS },
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: hr.id,
        action: 'CASE_CREATED',
        entityType: 'onboarding_case',
        entityId: inProgressCase.id,
        afterJson: { status: 'in_progress', employeeId: newHire.id },
      },
      {
        actorUserId: hr.id,
        action: 'CASE_CREATED',
        entityType: 'onboarding_case',
        entityId: invitedCase.id,
        afterJson: { status: 'invited', employeeId: invitedHire.id },
      },
    ],
  });

  // silence unused in seed output
  void managerUser;
  void employeeUser;

  console.log('Seeded lab users:');
  console.log('  HR admin     →  Authorization: Bearer dev:hr_admin     (hr@lab.local)');
  console.log('  Manager      →  Authorization: Bearer dev:manager      (maya.santos@lab.local)');
  console.log('  New hire     →  Authorization: Bearer dev:employee     (luis.reyes@lab.local)');
  console.log('  System admin →  Authorization: Bearer dev:system_admin');
  console.log(`  In-progress case: ${inProgressCase.id}`);
  console.log(`  Invited case:     ${invitedCase.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
