// ============================================================================
// TASKIFY - Column Controller
// CRUD operacije za kolone na Kanban tabli
// Pristup baziran na ownerId i sistemskoj roli (bez ProjectMember)
// ============================================================================

import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// ============================================================================
// HELPER - Proveri pristup board-u
// ============================================================================
async function checkBoardAccess(boardId, userId, userRole) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      project: true,
    },
  });

  if (!board) {
    return { error: 'Board not found', status: 404 };
  }

  const project = board.project;

  // ADMIN i MODERATOR imaju pristup svim projektima
  // USER ima pristup samo svojim projektima
  if (userRole === 'ADMIN' || userRole === 'MODERATOR' || project.ownerId === userId) {
    return { board };
  }

  return { error: 'Access denied', status: 403 };
}

// ============================================================================
// LIST COLUMNS (za board)
// ============================================================================
export async function listColumns(req, res) {
  try {
    const boardId = Number(req.params.boardId);
    const userId = req.user.id;
    const userRole = req.user.role;

    const access = await checkBoardAccess(boardId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const columns = await prisma.column.findMany({
      where: { boardId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { position: 'asc' },
    });

    return res.json(columns);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// CREATE COLUMN
// ============================================================================
export async function createColumn(req, res) {
  try {
    const boardId = Number(req.params.boardId);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, color = '#6b7280' } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Column name is required' });
    }

    const access = await checkBoardAccess(boardId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    // Odredi poziciju (na kraju)
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const position = lastColumn ? lastColumn.position + 1 : 0;

    const column = await prisma.column.create({
      data: {
        name,
        color,
        position,
        boardId,
      },
    });

    return res.status(201).json(column);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// UPDATE COLUMN
// ============================================================================
export async function updateColumn(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, color } = req.body;

    const column = await prisma.column.findUnique({
      where: { id },
    });

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const access = await checkBoardAccess(column.boardId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const updated = await prisma.column.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(color !== undefined ? { color } : {}),
      },
    });

    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// DELETE COLUMN
// ============================================================================
export async function deleteColumn(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const column = await prisma.column.findUnique({
      where: { id },
      include: { _count: { select: { tasks: true } } },
    });

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const access = await checkBoardAccess(column.boardId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    await prisma.column.delete({ where: { id } });

    // Ažuriraj pozicije preostalih kolona
    await prisma.column.updateMany({
      where: { boardId: column.boardId, position: { gt: column.position } },
      data: { position: { decrement: 1 } },
    });

    return res.json({ message: 'Column deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// REORDER COLUMNS
// ============================================================================
export async function reorderColumns(req, res) {
  try {
    const boardId = Number(req.params.boardId);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { columnIds } = req.body;

    if (!Array.isArray(columnIds)) {
      return res.status(400).json({ message: 'columnIds must be an array' });
    }

    const access = await checkBoardAccess(boardId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    // Ažuriraj pozicije
    await prisma.$transaction(
      columnIds.map((columnId, index) =>
        prisma.column.update({
          where: { id: columnId },
          data: { position: index },
        })
      )
    );

    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });

    return res.json(columns);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
