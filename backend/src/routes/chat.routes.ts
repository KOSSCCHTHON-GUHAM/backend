import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

/**
 * Chat Routes (1:1 채팅)
 *
 * POST /api/chat/rooms/:roomId  - 채팅방 생성
 * GET  /api/chat/rooms/:roomId  - 채팅방 메시지 내역 조회
 */
router.post('/rooms', (req, res) => chatController.createRoom(req, res));
router.get('/rooms/:roomId', (req, res) => chatController.getRoomMessages(req, res));

export default router;
