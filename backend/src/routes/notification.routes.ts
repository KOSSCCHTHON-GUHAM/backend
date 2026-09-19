import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';
const router = Router(); const controller = new NotificationController(); router.use(requireAuth);
/** @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notification]
 *     summary: 알림 목록과 안 읽은 개수 조회
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: unreadOnly, schema: { type: boolean, default: false } }
 *     responses:
 *       200:
 *         description: 알림 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications: { type: array, items: { $ref: '#/components/schemas/Notification' } }
 *                 unreadCount: { type: integer }
 *                 hasNext: { type: boolean }
 *   patch:
 *     tags: [Notification]
 *     summary: 내 알림 전체 읽음 처리
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 전체 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedCount: { type: integer, example: 3 }
 *                 unreadCount: { type: integer, example: 0 }
 */
router.get('/', (req, res) => controller.list(req, res));
router.patch('/', (req, res) => controller.readAll(req, res));
/** @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notification]
 *     summary: 알림 읽음 처리
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: 읽음 처리 성공 }, 403: { description: 권한 없음 }, 404: { description: 알림 없음 } }
 */
router.patch('/:id/read', (req, res) => controller.read(req, res));
export default router;
