// ============================================================================
// TASKIFY - Board Routes
// Rute za Kanban board-ove
// ============================================================================

import { Router } from 'express';
import {
  listBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/board.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sve rute zahtevaju autentifikaciju
router.use(requireAuth);

/**
 * @swagger
 * /api/projects/{projectId}/boards:
 *   get:
 *     tags: [Boards]
 *     summary: Lista board-ova za projekat
 *     description: Vraća sve board-ove unutar projekta. Korisnik mora biti član projekta ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *     responses:
 *       200:
 *         description: Lista board-ova
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       403:
 *         description: Nema pristup projektu
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/projects/:projectId/boards', listBoards);

/**
 * @swagger
 * /api/projects/{projectId}/boards:
 *   post:
 *     tags: [Boards]
 *     summary: Kreiranje novog board-a
 *     description: Kreira novi Kanban board unutar projekta. Opciono kreira podrazumevane kolone (To Do, In Progress, Done). Samo OWNER/MANAGER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
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
 *                 example: Sprint 1
 *               createDefaultColumns:
 *                 type: boolean
 *                 default: true
 *                 description: Da li kreirati podrazumevane kolone (To Do, In Progress, Done)
 *     responses:
 *       201:
 *         description: Board uspešno kreiran
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Board'
 *                 - type: object
 *                   properties:
 *                     columns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Column'
 *       400:
 *         description: Nedostaje naziv board-a
 *       403:
 *         description: Nema privilegiju za kreiranje
 *       401:
 *         description: Nije autentifikovan
 */
router.post('/projects/:projectId/boards', createBoard);

/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     tags: [Boards]
 *     summary: Detalji board-a
 *     description: Vraća board sa svim kolonama, taskovima i informacijama o projektu.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID board-a
 *     responses:
 *       200:
 *         description: Detalji board-a sa kolonama i taskovima
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Board'
 *                 - type: object
 *                   properties:
 *                     columns:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Column'
 *                           - type: object
 *                             properties:
 *                               tasks:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/Task'
 *                     project:
 *                       $ref: '#/components/schemas/Project'
 *       403:
 *         description: Nema pristup
 *       404:
 *         description: Board nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/boards/:id', getBoard);

/**
 * @swagger
 * /api/boards/{id}:
 *   put:
 *     tags: [Boards]
 *     summary: Ažuriranje board-a
 *     description: Ažurira naziv board-a. Samo OWNER/MANAGER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sprint 2
 *     responses:
 *       200:
 *         description: Board uspešno ažuriran
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       403:
 *         description: Nema privilegiju za izmenu
 *       404:
 *         description: Board nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.put('/boards/:id', updateBoard);

/**
 * @swagger
 * /api/boards/{id}:
 *   delete:
 *     tags: [Boards]
 *     summary: Brisanje board-a
 *     description: Briše board i sve kolone/taskove (kaskadno). Samo OWNER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID board-a
 *     responses:
 *       200:
 *         description: Board uspešno obrisan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Board deleted
 *       403:
 *         description: Nema privilegiju za brisanje
 *       404:
 *         description: Board nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.delete('/boards/:id', deleteBoard);

export default router;
