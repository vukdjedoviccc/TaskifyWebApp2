// ============================================================================
// TASKIFY - Task Controller
// CRUD operacije za taskove sa Kanban move logikom
// Pojednostavljeno: 1 label po tasku (direktna relacija)
// ============================================================================

import { PrismaClient } from '../../generated/prisma/index.js';
import { createNotification } from './notification.controller.js';
import { sendTaskAssignedEmail } from '../config/email.js';

const prisma = new PrismaClient();

// ============================================================================
// HELPER - Proveri pristup tasku preko kolone/board-a
// ============================================================================
async function checkTaskAccess(taskId, userId, userRole) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      column: {
        include: {
          board: {
            include: {
              project: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return { error: 'Task not found', status: 404 };
  }

  const project = task.column.board.project;

  // ADMIN i MODERATOR imaju pristup svim projektima
  // USER ima pristup samo svojim projektima
  if (userRole === 'ADMIN' || userRole === 'MODERATOR' || project.ownerId === userId) {
    return { task };
  }

  return { error: 'Access denied', status: 403 };
}

// ============================================================================
// LIST TASKS
// ============================================================================
export async function listTasks(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    const { q, priority, columnId, boardId, projectId, dueDate } = req.query;

    // Build where clause based on role
    const projectAccess =
      userRole === 'ADMIN' || userRole === 'MODERATOR'
        ? {} // Admin/Moderator vidi sve
        : { column: { board: { project: { ownerId: userId } } } }; // User vidi samo svoje

    const where = {
      ...projectAccess,
      ...(q
        ? {
            OR: [{ title: { contains: q } }, { description: { contains: q } }],
          }
        : {}),
      ...(priority ? { priority } : {}),
      ...(columnId ? { columnId: Number(columnId) } : {}),
      ...(boardId ? { column: { boardId: Number(boardId) } } : {}),
      ...(projectId ? { column: { board: { projectId: Number(projectId) } } } : {}),
      ...(dueDate === 'overdue' ? { dueDate: { lt: new Date() } } : {}),
      ...(dueDate === 'today'
        ? {
            dueDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          }
        : {}),
      ...(dueDate === 'week'
        ? {
            dueDate: {
              gte: new Date(),
              lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          column: {
            select: { id: true, name: true, color: true, boardId: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
          assignee: {
            select: { id: true, name: true },
          },
          label: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    return res.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// GET TASK BY ID
// ============================================================================
export async function getTask(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const access = await checkTaskAccess(id, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: { id: true, name: true, color: true },
                },
              },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
        label: true,
      },
    });

    return res.json(task);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// CREATE TASK
// ============================================================================
export async function createTask(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const {
      title,
      description,
      columnId,
      priority = 'MEDIUM',
      dueDate,
      assigneeId,
      labelId,
    } = req.body;

    if (!title || !columnId) {
      return res.status(400).json({ message: 'Title and columnId are required' });
    }

    // Proveri pristup koloni
    const column = await prisma.column.findUnique({
      where: { id: Number(columnId) },
      include: {
        board: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const project = column.board.project;

    // Proveri pristup projektu
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR' && project.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Odredi poziciju (na vrhu kolone)
    const position = 0;

    // Pomeri sve postojeće taskove za jedno mesto dole
    await prisma.task.updateMany({
      where: { columnId: Number(columnId) },
      data: { position: { increment: 1 } },
    });

    // Kreiraj task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        columnId: Number(columnId),
        position,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: userId,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        labelId: labelId ? Number(labelId) : null,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        label: true,
      },
    });

    // Notifikacija i email za assignee-a
    if (assigneeId && Number(assigneeId) !== userId) {
      const assigneeUser = await prisma.user.findUnique({
        where: { id: Number(assigneeId) },
        select: { id: true, name: true, email: true },
      });

      if (assigneeUser) {
        const projectName = project.name;

        await createNotification({
          userId: assigneeUser.id,
          type: 'TASK_ASSIGNED',
          title: 'Novi zadatak dodeljen',
          message: `Dodeljen vam je zadatak "${task.title}" na projektu ${projectName}`,
          link: `/boards/${column.board.id}`,
        });

        await sendTaskAssignedEmail({
          to: assigneeUser.email,
          assigneeName: assigneeUser.name,
          taskTitle: task.title,
          projectName,
          assignedByName: req.user.name,
        });
      }
    }

    return res.status(201).json(task);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// UPDATE TASK
// ============================================================================
export async function updateTask(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { title, description, priority, dueDate, assigneeId, labelId } = req.body;

    const access = await checkTaskAccess(id, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const oldAssigneeId = access.task?.assigneeId;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(assigneeId !== undefined ? { assigneeId: assigneeId ? Number(assigneeId) : null } : {}),
        ...(labelId !== undefined ? { labelId: labelId ? Number(labelId) : null } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        label: true,
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    // Notifikacija i email ako se assignee promenio
    const newAssigneeId = assigneeId !== undefined ? (assigneeId ? Number(assigneeId) : null) : oldAssigneeId;
    if (newAssigneeId && newAssigneeId !== oldAssigneeId && newAssigneeId !== userId) {
      const assigneeUser = await prisma.user.findUnique({
        where: { id: newAssigneeId },
        select: { id: true, name: true, email: true },
      });

      if (assigneeUser) {
        const projectName = task.column.board.project.name;

        await createNotification({
          userId: assigneeUser.id,
          type: 'TASK_ASSIGNED',
          title: 'Novi zadatak dodeljen',
          message: `Dodeljen vam je zadatak "${task.title}" na projektu ${projectName}`,
          link: `/boards/${task.column.board.id}`,
        });

        await sendTaskAssignedEmail({
          to: assigneeUser.email,
          assigneeName: assigneeUser.name,
          taskTitle: task.title,
          projectName,
          assignedByName: req.user.name,
        });
      }
    }

    // Ukloni column iz odgovora
    const { column: _column, ...taskWithoutColumn } = task;
    return res.json(taskWithoutColumn);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// DELETE TASK
// ============================================================================
export async function deleteTask(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const access = await checkTaskAccess(id, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const task = access.task;

    await prisma.task.delete({ where: { id } });

    // Ažuriraj pozicije
    await prisma.task.updateMany({
      where: { columnId: task.columnId, position: { gt: task.position } },
      data: { position: { decrement: 1 } },
    });

    return res.json({ message: 'Task deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// MOVE TASK (Kanban drag & drop)
// ============================================================================
export async function moveTask(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { columnId, position } = req.body;

    if (columnId === undefined || position === undefined) {
      return res.status(400).json({ message: 'columnId and position are required' });
    }

    const access = await checkTaskAccess(id, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const task = access.task;
    const oldColumnId = task.columnId;
    const oldPosition = task.position;
    const newColumnId = Number(columnId);
    const newPosition = Number(position);

    // Transakcija za atomsku operaciju
    await prisma.$transaction(async (tx) => {
      if (oldColumnId === newColumnId) {
        // Premještanje unutar iste kolone
        if (oldPosition < newPosition) {
          // Pomicanje prema dole
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              position: { gt: oldPosition, lte: newPosition },
            },
            data: { position: { decrement: 1 } },
          });
        } else if (oldPosition > newPosition) {
          // Pomicanje prema gore
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              position: { gte: newPosition, lt: oldPosition },
            },
            data: { position: { increment: 1 } },
          });
        }
      } else {
        // Premještanje u drugu kolonu
        // 1. Zatvori rupu u staroj koloni
        await tx.task.updateMany({
          where: {
            columnId: oldColumnId,
            position: { gt: oldPosition },
          },
          data: { position: { decrement: 1 } },
        });

        // 2. Napravi prostor u novoj koloni
        await tx.task.updateMany({
          where: {
            columnId: newColumnId,
            position: { gte: newPosition },
          },
          data: { position: { increment: 1 } },
        });
      }

      // 3. Premjesti task
      await tx.task.update({
        where: { id },
        data: {
          columnId: newColumnId,
          position: newPosition,
        },
      });
    });

    const updatedTask = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        label: true,
      },
    });

    return res.json(updatedTask);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
