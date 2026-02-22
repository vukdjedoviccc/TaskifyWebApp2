// ============================================================================
// TASKIFY - Label Controller
// CRUD operacije za labele/kategorije taskova
// Pristup baziran na ownerId i sistemskoj roli (bez ProjectMember)
// ============================================================================

import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// ============================================================================
// HELPER - Proveri pristup projektu
// ============================================================================
async function checkProjectAccess(projectId, userId, userRole) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return { error: 'Project not found', status: 404 };
  }

  if (userRole === 'ADMIN' || userRole === 'MODERATOR' || project.ownerId === userId) {
    return { project };
  }

  return { error: 'Access denied', status: 403 };
}

// ============================================================================
// LIST LABELS (za projekat)
// ============================================================================
export async function listLabels(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const projectId = Number(req.query.projectId);

    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    const access = await checkProjectAccess(projectId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const labels = await prisma.label.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.json(labels);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// CREATE LABEL
// ============================================================================
export async function createLabel(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, color, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ message: 'Name and projectId are required' });
    }

    const access = await checkProjectAccess(Number(projectId), userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const label = await prisma.label.create({
      data: {
        name,
        color: color || '#6b7280',
        projectId: Number(projectId),
      },
    });

    return res.status(201).json(label);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ message: 'Label with this name already exists in this project' });
    }
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// UPDATE LABEL
// ============================================================================
export async function updateLabel(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, color } = req.body;

    const label = await prisma.label.findUnique({ where: { id } });

    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }

    const access = await checkProjectAccess(label.projectId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const updated = await prisma.label.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(color !== undefined ? { color } : {}),
      },
    });

    return res.json(updated);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ message: 'Label with this name already exists in this project' });
    }
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// DELETE LABEL
// ============================================================================
export async function deleteLabel(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const force = req.query.force === 'true';

    const label = await prisma.label.findUnique({
      where: { id },
      include: { _count: { select: { tasks: true } } },
    });

    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }

    const access = await checkProjectAccess(label.projectId, userId, userRole);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    // Ako se koristi i nije force, vrati upozorenje
    const taskCount = label._count.tasks;
    if (taskCount > 0 && !force) {
      return res.status(409).json({
        message: `Kategorija se koristi na ${taskCount} ${taskCount === 1 ? 'zadatku' : 'zadataka'}. Da li ste sigurni?`,
        taskCount,
        requiresConfirmation: true,
      });
    }

    // Pre brisanja, postavi labelId na null za sve taskove koji koriste ovaj label
    await prisma.task.updateMany({
      where: { labelId: id },
      data: { labelId: null },
    });

    await prisma.label.delete({ where: { id } });

    return res.json({ message: 'Label deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
