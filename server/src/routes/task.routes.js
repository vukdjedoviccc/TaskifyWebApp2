// ============================================================================
// TASKIFY - Task Routes
// Rute za taskove sa Kanban podrškom
// ============================================================================

import { Router } from 'express';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sve rute zahtevaju autentifikaciju
router.use(requireAuth);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Lista taskova
 *     description: Vraća paginiranu listu taskova sa filterima. Korisnik vidi samo taskove iz projekata u kojima je član.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Broj stranice
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Broj stavki po stranici
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Pretraga po naslovu i opisu
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filter po prioritetu
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: integer
 *         description: Filter po koloni
 *       - in: query
 *         name: boardId
 *         schema:
 *           type: integer
 *         description: Filter po board-u
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *         description: Filter po projektu
 *       - in: query
 *         name: dueDate
 *         schema:
 *           type: string
 *           enum: [overdue, today, week]
 *         description: Filter po roku (overdue, today, week)
 *     responses:
 *       200:
 *         description: Paginirana lista taskova
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/', listTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Kreiranje novog taska
 *     description: Kreira novi task u zadatoj koloni. Task se dodaje na poziciju 0 (vrh kolone).
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, columnId]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Implementirati login formu
 *               description:
 *                 type: string
 *                 example: Kreirati komponentu sa email i password poljima
 *               columnId:
 *                 type: integer
 *                 example: 1
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-01T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Task uspešno kreiran
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Nedostaju obavezna polja (title, columnId)
 *       403:
 *         description: Nema pristup projektu
 *       404:
 *         description: Kolona nije pronađena
 *       401:
 *         description: Nije autentifikovan
 */
router.post('/', createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Detalji taska
 *     description: Vraća kompletan task sa informacijama o koloni, board-u, projektu i kreatoru.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID taska
 *     responses:
 *       200:
 *         description: Detalji taska
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Task'
 *                 - type: object
 *                   properties:
 *                     column:
 *                       $ref: '#/components/schemas/Column'
 *                     createdBy:
 *                       $ref: '#/components/schemas/User'
 *       403:
 *         description: Nema pristup
 *       404:
 *         description: Task nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/:id', getTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Ažuriranje taska
 *     description: Ažurira podatke taska (naslov, opis, prioritet, rok, status završenosti).
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID taska
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Task uspešno ažuriran
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       403:
 *         description: Nema pristup
 *       404:
 *         description: Task nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.put('/:id', updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Brisanje taska
 *     description: Briše task i ažurira pozicije ostalih taskova u koloni.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID taska
 *     responses:
 *       200:
 *         description: Task uspešno obrisan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task deleted
 *       403:
 *         description: Nema pristup
 *       404:
 *         description: Task nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.delete('/:id', deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/move:
 *   patch:
 *     tags: [Tasks]
 *     summary: Pomeranje taska (Kanban drag & drop)
 *     description: Premešta task u drugu kolonu i/ili menja poziciju. Koristi transakciju za atomičnu promenu pozicija svih pogođenih taskova.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID taska
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [columnId, position]
 *             properties:
 *               columnId:
 *                 type: integer
 *                 example: 2
 *                 description: ID odredišne kolone
 *               position:
 *                 type: integer
 *                 example: 0
 *                 description: Nova pozicija u koloni
 *     responses:
 *       200:
 *         description: Task uspešno premešten
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Nedostaju columnId i position
 *       403:
 *         description: Nema pristup
 *       404:
 *         description: Task nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.patch('/:id/move', moveTask);

export default router;
