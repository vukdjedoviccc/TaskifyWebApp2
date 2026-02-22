// ============================================================================
// TASKIFY - Database Seed (Minimalna verzija)
// 3 sistemske role: ADMIN, MODERATOR, USER
// 7 modela: User, Project, Board, Column, Task, Label, Notification
// ============================================================================

import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// ============================================================================
// SEED USERS (3 role: ADMIN, MODERATOR, USER)
// ============================================================================
async function seedUsers() {
  console.log('Seeding users...');

  const users = [
    {
      name: 'Admin Taskify',
      email: 'admin@taskify.test',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
    {
      name: 'Moderator Taskify',
      email: 'mod@taskify.test',
      password: await hashPassword('mod123'),
      role: 'MODERATOR',
    },
    {
      name: 'Marko Petrović',
      email: 'marko@taskify.test',
      password: await hashPassword('password'),
      role: 'USER',
    },
    {
      name: 'Ana Jovanović',
      email: 'ana@taskify.test',
      password: await hashPassword('password'),
      role: 'USER',
    },
    {
      name: 'Stefan Nikolić',
      email: 'stefan@taskify.test',
      password: await hashPassword('password'),
      role: 'USER',
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    createdUsers.push(created);
    console.log(`  ✓ User: ${created.email} (${created.role})`);
  }

  return createdUsers;
}

// ============================================================================
// SEED PROJECTS (vlasništvo preko ownerId)
// ============================================================================
async function seedProjects(users) {
  console.log('Seeding projects...');

  const [admin, mod, marko, ana, stefan] = users;

  const projectsData = [
    {
      name: 'Taskify Development',
      description: 'Razvoj Taskify aplikacije',
      color: '#6366f1',
      ownerId: marko.id,
    },
    {
      name: 'E-Commerce Platforma',
      description: 'Online prodavnica',
      color: '#22c55e',
      ownerId: ana.id,
    },
    {
      name: 'Mobile App',
      description: 'Mobilna aplikacija',
      color: '#3b82f6',
      ownerId: stefan.id,
    },
  ];

  const createdProjects = [];
  for (const project of projectsData) {
    const created = await prisma.project.create({ data: project });
    createdProjects.push(created);
    console.log(`  ✓ Project: ${created.name}`);
  }

  return createdProjects;
}

// ============================================================================
// SEED LABELS
// ============================================================================
async function seedLabels(projects) {
  console.log('Seeding labels...');

  const labelData = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Urgent', color: '#f97316' },
    { name: 'Enhancement', color: '#8b5cf6' },
  ];

  const allLabels = {};

  for (const project of projects) {
    allLabels[project.id] = [];

    for (const label of labelData) {
      const existing = await prisma.label.findUnique({
        where: { projectId_name: { projectId: project.id, name: label.name } },
      });

      if (existing) {
        allLabels[project.id].push(existing);
      } else {
        const created = await prisma.label.create({
          data: { ...label, projectId: project.id },
        });
        allLabels[project.id].push(created);
      }
    }
    console.log(`  ✓ Labels for "${project.name}": ${allLabels[project.id].length}`);
  }

  return allLabels;
}

// ============================================================================
// SEED BOARDS AND COLUMNS
// ============================================================================
async function seedBoardsAndColumns(projects) {
  console.log('Seeding boards and columns...');

  const defaultColumns = [
    { name: 'To Do', color: '#6b7280', position: 0 },
    { name: 'In Progress', color: '#3b82f6', position: 1 },
    { name: 'Done', color: '#22c55e', position: 2 },
  ];

  const allBoards = {};

  for (const project of projects) {
    const board = await prisma.board.create({
      data: {
        name: 'Main Board',
        projectId: project.id,
      },
    });

    const columns = [];
    for (const col of defaultColumns) {
      const column = await prisma.column.create({
        data: { ...col, boardId: board.id },
      });
      columns.push(column);
    }

    allBoards[project.id] = { board, columns };
    console.log(`  ✓ Board: "${board.name}" for "${project.name}"`);
  }

  return allBoards;
}

// ============================================================================
// SEED TASKS (sa direktnim labelId)
// ============================================================================
async function seedTasks(boards, users, labels) {
  console.log('Seeding tasks...');

  const [admin, mod, marko, ana, stefan] = users;

  // Taskify project (marko owner)
  const taskifyBoard = boards[1];
  const taskifyLabels = labels[1];
  const bugLabel = taskifyLabels.find((l) => l.name === 'Bug');
  const featureLabel = taskifyLabels.find((l) => l.name === 'Feature');
  const urgentLabel = taskifyLabels.find((l) => l.name === 'Urgent');

  const tasks = [
    // To Do
    {
      title: 'Implementirati Kanban Drag & Drop',
      description: 'Koristiti Angular CDK za drag & drop',
      columnId: taskifyBoard.columns[0].id,
      position: 0,
      priority: 'HIGH',
      dueDate: daysFromNow(7),
      createdById: marko.id,
      assigneeId: ana.id,
      labelId: featureLabel.id,
    },
    {
      title: 'Dodati filtriranje taskova',
      description: 'Filtriranje po prioritetu i roku',
      columnId: taskifyBoard.columns[0].id,
      position: 1,
      priority: 'MEDIUM',
      dueDate: daysFromNow(10),
      createdById: marko.id,
      assigneeId: stefan.id,
      labelId: featureLabel.id,
    },
    // In Progress
    {
      title: 'API za taskove',
      description: 'CRUD operacije za taskove',
      columnId: taskifyBoard.columns[1].id,
      position: 0,
      priority: 'HIGH',
      dueDate: daysFromNow(2),
      createdById: marko.id,
      assigneeId: marko.id,
      labelId: urgentLabel.id,
    },
    {
      title: 'Fix login bug',
      description: 'Login ne radi na Safari',
      columnId: taskifyBoard.columns[1].id,
      position: 1,
      priority: 'URGENT',
      dueDate: daysFromNow(1),
      createdById: ana.id,
      assigneeId: stefan.id,
      labelId: bugLabel.id,
    },
    // Done
    {
      title: 'Setup Prisma',
      description: 'Konfigurisati Prisma ORM',
      columnId: taskifyBoard.columns[2].id,
      position: 0,
      priority: 'HIGH',
      createdById: marko.id,
      labelId: featureLabel.id,
    },
    {
      title: 'Implementirati autentifikaciju',
      description: 'JWT sa HTTP-only cookies',
      columnId: taskifyBoard.columns[2].id,
      position: 1,
      priority: 'HIGH',
      createdById: marko.id,
      labelId: featureLabel.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  // E-Commerce project (ana owner)
  const ecomBoard = boards[2];
  const ecomLabels = labels[2];

  const ecomTasks = [
    {
      title: 'Implementirati košaricu',
      columnId: ecomBoard.columns[0].id,
      position: 0,
      priority: 'HIGH',
      dueDate: daysFromNow(5),
      createdById: ana.id,
      assigneeId: stefan.id,
      labelId: ecomLabels.find((l) => l.name === 'Feature').id,
    },
    {
      title: 'Checkout flow',
      columnId: ecomBoard.columns[1].id,
      position: 0,
      priority: 'HIGH',
      dueDate: daysFromNow(10),
      createdById: ana.id,
      assigneeId: ana.id,
      labelId: ecomLabels.find((l) => l.name === 'Feature').id,
    },
  ];

  for (const task of ecomTasks) {
    await prisma.task.create({ data: task });
  }

  // Mobile App project (stefan owner)
  const mobileBoard = boards[3];
  const mobileLabels = labels[3];

  const mobileTasks = [
    {
      title: 'Biometric authentication',
      columnId: mobileBoard.columns[0].id,
      position: 0,
      priority: 'HIGH',
      dueDate: daysFromNow(8),
      createdById: stefan.id,
      assigneeId: marko.id,
      labelId: mobileLabels.find((l) => l.name === 'Feature').id,
    },
  ];

  for (const task of mobileTasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`  ✓ Created ${tasks.length + ecomTasks.length + mobileTasks.length} tasks`);
}

// ============================================================================
// SEED NOTIFICATIONS
// ============================================================================
async function seedNotifications(users) {
  console.log('Seeding notifications...');

  const [admin, mod, marko, ana, stefan] = users;

  const notifications = [
    {
      userId: ana.id,
      type: 'TASK_ASSIGNED',
      title: 'Novi zadatak dodeljen',
      message: 'Marko vam je dodelio zadatak "Implementirati Kanban Drag & Drop"',
      link: '/boards/1',
      isRead: false,
    },
    {
      userId: stefan.id,
      type: 'TASK_ASSIGNED',
      title: 'Novi zadatak dodeljen',
      message: 'Marko vam je dodelio zadatak "Dodati filtriranje taskova"',
      link: '/boards/1',
      isRead: false,
    },
    {
      userId: marko.id,
      type: 'REMINDER',
      title: 'Zadatak uskoro ističe',
      message: 'Zadatak "API za taskove" ističe za 2 dana',
      link: '/boards/1',
      isRead: false,
    },
    {
      userId: stefan.id,
      type: 'REMINDER',
      title: 'Zadatak uskoro ističe',
      message: 'Zadatak "Fix login bug" ističe sutra!',
      link: '/boards/1',
      isRead: false,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }

  console.log(`  ✓ Created ${notifications.length} notifications`);
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('\n🌱 Starting Taskify database seed...\n');

  try {
    const users = await seedUsers();
    const projects = await seedProjects(users);
    const labels = await seedLabels(projects);
    const boards = await seedBoardsAndColumns(projects);
    await seedTasks(boards, users, labels);
    await seedNotifications(users);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Test credentials:');
    console.log('───────────────────────────────────────────────────────');
    console.log('  Admin:     admin@taskify.test / admin123');
    console.log('  Moderator: mod@taskify.test / mod123');
    console.log('  User:      marko@taskify.test / password');
    console.log('  User:      ana@taskify.test / password');
    console.log('  User:      stefan@taskify.test / password');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
