import { Router } from 'express';
import multer from 'multer';
import { AiController } from '../controllers/ai.controller';

const router = Router();
const aiController = new AiController();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  },
});

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI 맞춤 추천, 텍스트 분석 및 모델 연동 API
 */

/**
 * @swagger
 * /api/ai/recommend:
 *   get:
 *     summary: AI 기반 GIVE/NEED 맞춤형 사용자 추천 (스켈레톤)
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 추천 대상 사용자 ID (기본값 anonymous)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: 추천 결과 개수
 *     responses:
 *       200:
 *         description: 맞춤 추천 사용자 목록 반환 성공 (현재 더미 데이터)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: dummy-user-1
 *                       nickname:
 *                         type: string
 *                         example: 더미유저1
 *                       jobField:
 *                         type: string
 *                         example: Frontend
 *                       matchScore:
 *                         type: number
 *                         example: 0.95
 *                       reason:
 *                         type: string
 *                         example: '[TODO] AI 추천 이유'
 */
router.get('/recommend', (req, res) => aiController.recommend(req, res));

/**
 * @swagger
 * /api/ai/analyze:
 *   post:
 *     summary: 링크·사진을 교차 분석해 포스팅 초안 생성
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           multipart/form-data:
 *             schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: 'https://example.com/contest'
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: AI 포스팅 초안 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'AI 웹서비스 공모전'
 *                     summary:
 *                       type: string
 *                       example: 'AI 기반 웹서비스 개발 공모전입니다.'
 *                     needs:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['React', 'UI/UX']
 */
router.post('/analyze', upload.single('image'), (req, res) => aiController.analyze(req, res));

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI 직접 채팅 요청
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: '안녕하세요, GUHAM 서비스에 대해 소개해 주세요.'
 *               model:
 *                 type: string
 *                 example: 'gpt-4o-mini'
 *     responses:
 *       200:
 *         description: AI 채팅 응답 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                       example: '안녕하세요! GUHAM은 청년 인재 매칭 플랫폼입니다.'
 *                     model:
 *                       type: string
 *                       example: 'gpt-4o-mini'
 *                     usage:
 *                       type: object
 */
router.post('/chat', (req, res) => aiController.chat(req, res));

/**
 * @swagger
 * /api/ai/models:
 *   get:
 *     summary: 사용 가능한 AI 모델 목록 조회
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: 모델 목록 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ['gpt-4o', 'gpt-4o-mini']
 */
router.get('/models', (req, res) => aiController.listModels(req, res));

export default router;
