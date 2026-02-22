// ============================================================================
// TASKIFY - Label Routes
// Rute za labele/kategorije taskova
// ============================================================================

import { Router } from 'express';
import {
  listLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from '../controllers/label.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sve rute zahtevaju autentifikaciju
router.use(requireAuth);

/**
 * @swagger
 * /api/labels:
 *   get:
 *     tags: [Labels]
 *     summary: Lista labela za projekat
 *     description: Vraća listu labela za zadati projekat. Korisnik mora biti član projekta.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *     responses:
 *       200:
 *         description: Lista labela
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Label'
 *       400:
 *         description: Nedostaje projectId
 *       403:
 *         description: Nema pristup projektu
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/', listLabels);

/**
 * @swagger
 * /api/labels:
 *   post:
 *     tags: [Labels]
 *     summary: Kreiranje labele
 *     description: Kreira novu labelu za projekat. Korisnik mora biti član projekta.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, projectId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bug
 *               color:
 *                 type: string
 *                 example: "#ef4444"
 *                 default: "#6b7280"
 *               projectId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Labela uspešno kreirana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Label'
 *       400:
 *         description: Nedostaju obavezna polja (name, projectId)
 *       403:
 *         description: Nema pristup projektu
 *       409:
 *         description: Labela sa tim imenom već postoji u projektu
 *       401:
 *         description: Nije autentifikovan
 */
router.post('/', createLabel);

/**
 * @swagger
 * /api/labels/{id}:
 *   put:
 *     tags: [Labels]
 *     summary: Ažuriranje labele
 *     description: Ažurira naziv i/ili boju labele. Korisnik mora biti član projekta kome labela pripada.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID labele
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Labela uspešno ažurirana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Label'
 *       403:
 *         description: Nema pristup projektu
 *       404:
 *         description: Labela nije pronađena
 *       409:
 *         description: Labela sa tim imenom već postoji u projektu
 *       401:
 *         description: Nije autentifikovan
 */
router.put('/:id', updateLabel);

/**
 * @swagger
 * /api/labels/{id}:
 *   delete:
 *     tags: [Labels]
 *     summary: Brisanje labele
 *     description: Briše labelu po ID-ju. Korisnik mora biti član projekta kome labela pripada. Brisanje labele automatski uklanja vezu sa taskovima (kaskadno).
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID labele
 *     responses:
 *       200:
 *         description: Labela uspešno obrisana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Label deleted
 *       403:
 *         description: Nema pristup projektu
 *       404:
 *         description: Labela nije pronađena
 *       401:
 *         description: Nije autentifikovan
 */
router.delete('/:id', deleteLabel);

export default router;
