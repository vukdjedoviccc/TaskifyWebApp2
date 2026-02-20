// ============================================================================
// TASKIFY - Project Controller
// CRUD operacije za projekte (bez ProjectMember tabele)
// Pristup baziran na ownerId i sistemskoj roli (ADMIN, MODERATOR, USER)
// ============================================================================

import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// ============================================================================
// LIST PROJECTS
// ============================================================================
export async function listProjects(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 12));
    const q = req.query.q || '';

    // ADMIN i MODERATOR vide sve projekte, USER vidi samo svoje
    const where = {
      ...(userRole === 'ADMIN' || userRole === 'MODERATOR' ? {} : { ownerId: userId }),
      ...(q ? { name: { contains: q } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { boards: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
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
// GET PROJECT BY ID
// ============================================================================
export async function getProject(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        boards: {
          orderBy: { createdAt: 'desc' },
        },
        labels: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Proveri pristup: ADMIN/MODERATOR ili vlasnik
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR' && project.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// CREATE PROJECT
// ============================================================================
export async function createProject(req, res) {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        color: color || '#6366f1',
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// UPDATE PROJECT
// ============================================================================
export async function updateProject(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, description, color } = req.body;

    // Dohvati projekat
    const existing = await prisma.project.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Proveri pristup: ADMIN, MODERATOR ili vlasnik
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR' && existing.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(color !== undefined ? { color } : {}),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { boards: true },
        },
      },
    });

    return res.json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// DELETE PROJECT
// ============================================================================
export async function deleteProject(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    // Dohvati projekat
    const existing = await prisma.project.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Proveri pristup: ADMIN ili vlasnik (MODERATOR ne može brisati)
    if (userRole !== 'ADMIN' && existing.ownerId !== userId) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await prisma.project.delete({ where: { id } });

    return res.json({ message: 'Project deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
