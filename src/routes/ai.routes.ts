import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';

const router = Router();
const aiController = new AiController();

/**
 * AI API Routes
 *
 * POST /api/ai/chat    - AI 채팅 요청
 * GET  /api/ai/models  - 사용 가능한 모델 목록 조회
 */
router.post('/chat', (req, res) => aiController.chat(req, res));
router.get('/models', (req, res) => aiController.listModels(req, res));

export default router;
