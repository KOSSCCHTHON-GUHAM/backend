import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';

const router = Router();
const aiController = new AiController();

/**
 * AI Routes
 *
 * GET  /api/ai/recommend  - AI 기반 GIVE/NEED 맞춤형 사용자 추천
 * POST /api/ai/analyze    - GIVE/NEED 텍스트 AI 분석 및 키워드 추출
 * POST /api/ai/chat       - AI 직접 채팅 (기존 기능 유지)
 * GET  /api/ai/models     - 사용 가능한 AI 모델 목록 조회 (기존 기능 유지)
 */
router.get('/recommend', (req, res) => aiController.recommend(req, res));
router.post('/analyze', (req, res) => aiController.analyze(req, res));
router.post('/chat', (req, res) => aiController.chat(req, res));
router.get('/models', (req, res) => aiController.listModels(req, res));

export default router;
