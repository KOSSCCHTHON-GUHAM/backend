import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: 사용자 간 1:1 채팅 API
 */

/**
 * @swagger
 * /api/chat/rooms:
 *   post:
 *     summary: 사용자 간 1:1 채팅방 생성
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 example: target-user-id-123
 *     responses:
 *       201:
 *         description: 채팅방 생성 또는 기존 방 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '[TODO] 채팅방 생성 로직 미구현'
 *                 data:
 *                   type: object
 *                   properties:
 *                     room:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: room-id-placeholder
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ['requester-id-placeholder', 'target-user-id-123']
 *                         createdAt:
 *                           type: string
 *                           example: '2026-09-19T08:00:00.000Z'
 */
router.post('/rooms', (req, res) => chatController.createRoom(req, res));

/**
 * @swagger
 * /api/chat/rooms/{roomId}:
 *   get:
 *     summary: 1:1 채팅방 메시지 내역 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: 채팅방 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 조회할 메시지 개수
 *     responses:
 *       200:
 *         description: 메시지 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '[TODO] 채팅 메시지 조회 로직 미구현'
 *                 data:
 *                   type: object
 *                   properties:
 *                     roomId:
 *                       type: string
 *                       example: room-123
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 50
 */
router.get('/rooms/:roomId', (req, res) => chatController.getRoomMessages(req, res));

export default router;
