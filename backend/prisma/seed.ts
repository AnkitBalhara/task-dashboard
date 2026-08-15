import { PrismaClient } from "@prisma/client";

// SQLite has no native enum type, so status/priority/role are plain strings
// validated by zod at the API layer, using the same values declared once in
// packages/shared-types.
const TaskStatus = { PENDING: "PENDING", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", BLOCKED: "BLOCKED" } as const;
const TaskPriority = { LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH", URGENT: "URGENT" } as const;
const UserRole = { ADMIN: "ADMIN", MEMBER: "MEMBER" } as const;
// (Kept as local literal maps rather than importing TASK_STATUSES/TASK_PRIORITIES
// arrays from @task-dashboard/shared-types, since indexing those by name here
// would be less readable than TaskStatus.PENDING-style access below.)

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main(): Promise<void> {
  // Upsert on email so re-running the seed doesn't create duplicate users
  // or blow up on the unique constraint.
  const [alice, bob, carol, david] = await Promise.all([
    prisma.user.upsert({
      where: { email: "ram.balhara@taskdash.dev" },
      update: {},
      create: { name: "Ram Balhara", email: "ram.balhara@taskdash.dev", role: UserRole.ADMIN },
    }),
    prisma.user.upsert({
      where: { email: "priya.sharma@taskdash.dev" },
      update: {},
      create: { name: "Priya Sharma", email: "priya.sharma@taskdash.dev", role: UserRole.MEMBER },
    }),
    prisma.user.upsert({
      where: { email: "ananya.iyer@taskdash.dev" },
      update: {},
      create: { name: "Ananya Iyer", email: "ananya.iyer@taskdash.dev", role: UserRole.MEMBER },
    }),
    prisma.user.upsert({
      where: { email: "vikram.mehta@taskdash.dev" },
      update: {},
      create: { name: "Vikram Mehta", email: "vikram.mehta@taskdash.dev", role: UserRole.ADMIN },
    }),
  ]);

  // Tasks (and their comments, via cascade) are reset on every seed run so
  // the demo data stays deterministic instead of accumulating duplicates.
  await prisma.task.deleteMany({});

  const taskDefs = [
    {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for lint, test, and build on every PR.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assignedTo: alice.id,
      dueDate: daysFromNow(5),
    },
    {
      title: "Fix login page layout on mobile",
      description: "Buttons overflow on small screens below 360px width.",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      assignedTo: bob.id,
      dueDate: daysFromNow(-2), // overdue
    },
    {
      title: "Migrate database to Postgres 16",
      description: null,
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.URGENT,
      assignedTo: carol.id,
      dueDate: daysFromNow(-5), // overdue
    },
    {
      title: "Write onboarding documentation",
      description: "Cover local setup, env vars, and seeding the database.",
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.LOW,
      assignedTo: david.id,
      dueDate: daysFromNow(-10), // completed, so not overdue
    },
    {
      title: "Design dashboard analytics widgets",
      description: "Stat tiles for total/overdue/assigned-to-me counts.",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      assignedTo: null,
      dueDate: daysFromNow(14),
    },
    {
      title: "Audit third-party npm dependencies",
      description: "Check for known vulnerabilities and unused packages.",
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      assignedTo: alice.id,
      dueDate: null,
    },
    {
      title: "Implement task filtering and search",
      description: "Support filtering by status, priority, assignee, and free-text search.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assignedTo: bob.id,
      dueDate: daysFromNow(3),
    },
    {
      title: "Resolve production error spike",
      description: "500 errors reported since last deploy; check logs.",
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.URGENT,
      assignedTo: carol.id,
      dueDate: daysFromNow(-1), // overdue
    },
    {
      title: "Set up automated database backups",
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      assignedTo: null,
      dueDate: daysFromNow(7),
    },
    {
      title: "Refactor comments module for reuse",
      description: "Extract shared validation logic between comments and tasks.",
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      assignedTo: david.id,
      dueDate: daysFromNow(-20), // completed, so not overdue
    },
    {
      title: "Add pagination to users list",
      description: "Currently returns all users unpaginated; fine for now but should be revisited.",
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      assignedTo: bob.id,
      dueDate: null,
    },
    {
      title: "Prepare Q3 roadmap presentation",
      description: "Summarize completed work and upcoming priorities for stakeholders.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      assignedTo: alice.id,
      dueDate: daysFromNow(10),
    },
    {
      title: "Investigate flaky integration tests",
      description: "Task-list sorting test fails intermittently in CI.",
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      assignedTo: carol.id,
      dueDate: daysFromNow(-3), // overdue
    },
  ];

  const createdTasks = [];
  for (const def of taskDefs) {
    // eslint-disable-next-line no-await-in-loop
    const task = await prisma.task.create({ data: def });
    createdTasks.push(task);
  }

  await prisma.comment.createMany({
    data: [
      {
        taskId: createdTasks[0].id,
        userId: bob.id,
        comment: "Started drafting the workflow YAML - should have a first pass up by tomorrow.",
      },
      {
        taskId: createdTasks[0].id,
        userId: alice.id,
        comment: "Great, please make sure it runs on both push and pull_request events.",
      },
      {
        taskId: createdTasks[2].id,
        userId: carol.id,
        comment: "Blocked on the infra team provisioning the new Postgres 16 instance.",
      },
      {
        taskId: createdTasks[7].id,
        userId: david.id,
        comment: "Checked the logs - looks related to connection pool exhaustion from yesterday's deploy.",
      },
    ],
  });

  console.log(`Seeded 4 users, ${createdTasks.length} tasks, and 4 comments.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
