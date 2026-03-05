// ============================================================================
// TASKIFY - Notification Routes
// Rute za obaveštenja korisnika
// ============================================================================

import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sve rute zahtevaju autentifikaciju
router.use(requireAuth);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Lista obaveštenja
 *     description: Vraća paginiranu listu obaveštenja za trenutnog korisnika, sortirano po datumu kreiranja (najnovije prvo). Uključuje broj nepročitanih.
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
 *     responses:
 *       200:
 *         description: Paginirana lista obaveštenja
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 unreadCount:
 *                   type: integer
 *                   description: Ukupan broj nepročitanih obaveštenja
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/', listNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Označi sva obaveštenja kao pročitana
 *     description: Označava sva nepročitana obaveštenja trenutnog korisnika kao pročitana.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sva obaveštenja označena kao pročitana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *       401:
 *         description: Nije autentifikovan
 */
router.patch('/read-all', markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Označi obaveštenje kao pročitano
 *     description: Označava jedno obaveštenje kao pročitano. Korisnik može označiti samo sopstvena obaveštenja.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID obaveštenja
 *     responses:
 *       200:
 *         description: Obaveštenje označeno kao pročitano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       403:
 *         description: Nema pristup obaveštenju
 *       404:
 *         description: Obaveštenje nije pronađeno
 *       401:
 *         description: Nije autentifikovan
 */
router.patch('/:id/read', markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Brisanje obaveštenja
 *     description: Briše obaveštenje po ID-ju. Korisnik može obrisati samo sopstvena obaveštenja.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID obaveštenja
 *     responses:
 *       200:
 *         description: Obaveštenje uspešno obrisano
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification deleted
 *       403:
 *         description: Nema pristup obaveštenju
 *       404:
 *         description: Obaveštenje nije pronađeno
 *       401:
 *         description: Nije autentifikovan
 */
router.delete('/:id', deleteNotification);

export default router;
