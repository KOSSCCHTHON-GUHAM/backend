import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';
const router = Router(); const controller = new ChatController(); router.use(requireAuth);

/** @swagger
 * /api/chat/rooms:
 *   post:
 *     tags: [Chat]
 *     summary: 포스팅 상대와 1:1 채팅방 생성 또는 기존 방 반환
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, required: [targetUserId, boardId], properties: { targetUserId: { type: string, format: uuid }, boardId: { type: string, format: uuid } } } } }
 *     responses:
 *       200: { description: 기존 채팅방, content: { application/json: { schema: { type: object, properties: { room: { $ref: '#/components/schemas/ChatRoom' }, isNew: { type: boolean, example: false } } } } } }
 *       201: { description: 새 채팅방, content: { application/json: { schema: { type: object, properties: { room: { $ref: '#/components/schemas/ChatRoom' }, isNew: { type: boolean, example: true } } } } } }
 *   get:
 *     tags: [Chat]
 *     summary: 내 채팅방 목록·마지막 메시지·안 읽은 개수 조회
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses: { 200: { description: 채팅방·상대방·연관 포스팅·마지막 메시지·안 읽은 개수 목록 } }
 */
router.post('/rooms', (req, res) => controller.createRoom(req, res));
router.get('/rooms', (req, res) => controller.listRooms(req, res));
/** @swagger
 * /api/chat/rooms/{roomId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: cursor 기반 과거 메시지 조회 및 재연결 동기화
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: roomId, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: cursor, schema: { type: string, format: uuid } }
 *       - { in: query, name: limit, schema: { type: integer, default: 50 } }
 *     responses:
 *       200:
 *         description: 채팅방·메시지·nextCursor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room: { $ref: '#/components/schemas/ChatRoom' }
 *                 messages: { type: array, items: { $ref: '#/components/schemas/ChatMessage' } }
 *                 nextCursor: { type: string, nullable: true }
 *       403: { description: 참여자 아님 }
 */
router.get('/rooms/:roomId/messages', (req, res) => controller.getMessages(req, res));

/**
 * Socket.IO (`path: /chat`) 이벤트 명세
 * - handshake auth: `{ accessToken: string }`
 * - client -> server: `chat:join`, `message:send`, `message:read`, `chat:leave`
 * - server -> client: `chat:joined`, `message:new`, `message:read`
 * - `message:send` payload: `{ roomId, clientMessageId, content, messageType: "TEXT" | "LINK" }`
 * - `clientMessageId`는 재전송 시 중복 저장 방지 키로 사용합니다.
 */
export default router;
