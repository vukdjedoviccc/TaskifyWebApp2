// ============================================================================
// TASKIFY - Column Routes
// Rute za kolone na Kanban tabli
// ============================================================================

import { Router } from 'express';
import {
  listColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from '../controllers/column.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sve rute zahtevaju autentifikaciju
router.use(requireAuth);

/**
 * @swagger
 * /api/boards/{boardId}/columns:
 *   get:
 *     tags: [Columns]
 *     summary: Lista kolona za board
 *     description: Vraća sve kolone na board-u, sortirane po poziciji, sa brojem taskova.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID board-a
 *     responses:
 *       200:
 *         description: Lista kolona
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Column'
 *                   - type: object
 *                     properties:
 *                       _count:
 *                         type: object
 *                         properties:
 *                           tasks:
 *                             type: integer
 *       403:
 *         description: Nema pristup board-u
 *       404:
 *         description: Board nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/boards/:boardId/columns', listColumns);

/**
 * @swagger
 * /api/boards/{boardId}/columns:
 *   post:
 *     tags: [Columns]
 *     summary: Kreiranje nove kolone
 *     description: Kreira novu kolonu na board-u. Kolona se dodaje na poslednju poziciju. Samo OWNER/MANAGER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID board-a
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: In Review
 *               color:
 *                 type: string
 *                 default: "#6b7280"
 *                 example: "#f59e0b"
 *     responses:
 *       201:
 *         description: Kolona uspešno kreirana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       400:
 *         description: Nedostaje naziv kolone
 *       403:
 *         description: Nema privilegiju za kreiranje
 *       404:
 *         description: Board nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.post('/boards/:boardId/columns', createColumn);

/**
 * @swagger
 * /api/boards/{boardId}/columns/reorder:
 *   patch:
 *     tags: [Columns]
 *     summary: Promena redosleda kolona
 *     description: Preuređuje kolone na board-u po zadatom nizu ID-jeva. Samo OWNER/MANAGER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID board-a
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [columnIds]
 *             properties:
 *               columnIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3, 1, 2]
 *                 description: Niz ID-jeva kolona u novom redosledu
 *     responses:
 *       200:
 *         description: Kolone uspešno preuređene
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Column'
 *       400:
 *         description: Nedostaje columnIds niz
 *       403:
 *         description: Nema privilegiju
 *       404:
 *         description: Board nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.patch('/boards/:boardId/columns/reorder', reorderColumns);

/**
 * @swagger
 * /api/columns/{id}:
 *   put:
 *     tags: [Columns]
 *     summary: Ažuriranje kolone
 *     description: Ažurira naziv i/ili boju kolone. Samo OWNER/MANAGER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kolone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Done
 *               color:
 *                 type: string
 *                 example: "#10b981"
 *     responses:
 *       200:
 *         description: Kolona uspešno ažurirana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       403:
 *         description: Nema privilegiju za izmenu
 *       404:
 *         description: Kolona nije pronađena
 *       401:
 *         description: Nije autentifikovan
 */
router.put('/columns/:id', updateColumn);

/**
 * @swagger
 * /api/columns/{id}:
 *   delete:
 *     tags: [Columns]
 *     summary: Brisanje kolone
 *     description: Briše kolonu i sve njene taskove (kaskadno). Samo OWNER/MANAGER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kolone
 *     responses:
 *       200:
 *         description: Kolona uspešno obrisana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Column deleted
 *       403:
 *         description: Nema privilegiju za brisanje
 *       404:
 *         description: Kolona nije pronađena
 *       401:
 *         description: Nije autentifikovan
 */
router.delete('/columns/:id', deleteColumn);

export default router;
