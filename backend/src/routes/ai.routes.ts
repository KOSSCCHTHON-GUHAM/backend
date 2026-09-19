import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleUpload } from '../middleware/upload.middleware';
const router = Router(); const controller = new AiController();

/** @swagger
 * /api/ai/recommend/boards:
 *   get:
 *     tags: [AI]
 *     summary: GIVE 의미 유사도 60%·태그 20%·지역 10%·최신성 10% 포스팅 추천
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: keyword, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses: { 200: { description: matchScore와 추천 이유가 포함된 포스팅 } }
 */
router.get('/recommend/boards', requireAuth, (req, res) => controller.recommendBoards(req, res));
/** @swagger
 * /api/ai/recommend/users:
 *   get:
 *     tags: [AI]
 *     summary: 포스팅 NEED와 사용자 GIVE를 비교한 후보 추천
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: boardId, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses: { 200: { description: 순위·점수·일치 태그·추천 이유 }, 404: { description: 본인 포스팅 없음 } }
 */
router.get('/recommend/users', requireAuth, (req, res) => controller.recommendUsers(req, res));
/** @swagger
 * /api/ai/analyze:
 *   post:
 *     tags: [AI]
 *     summary: 작성 내용에서 GIVE·NEED 태그 추출
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, required: [title, category, content], properties: { title: { type: string }, category: { type: string }, content: { type: string } } } } }
 *     responses: { 200: { description: GIVE·NEED 태그와 요약 } }
 */
router.post('/analyze', requireAuth, (req, res) => controller.analyze(req, res));
/** @swagger
 * /api/ai/draft:
 *   post:
 *     tags: [AI]
 *     summary: 사진 최대 10장·링크를 분석해 포스팅 전체 초안 생성
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images: { type: array, maxItems: 10, items: { type: string, format: binary } }
 *               links: { type: string, description: URL 문자열 배열을 JSON으로 직렬화한 값, example: '["https://example.com/contest"]' }
 *     responses:
 *       200: { description: 1·2단계 전체 입력값 초안과 분석 경고, content: { application/json: { schema: { $ref: '#/components/schemas/AiDraftResponse' } } } }
 *       400: { description: 첨부 없음·URL·파일 형식 오류, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       502: { description: 외부 AI 분석 실패, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.post('/draft', requireAuth, handleUpload, (req, res) => controller.draft(req, res));
/** @swagger
 * /api/ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: AI 연결 확인용 직접 채팅
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, required: [message], properties: { message: { type: string }, model: { type: string } } } } } }
 *     responses: { 200: { description: AI 응답 } }
 */
router.post('/chat', (req, res) => controller.chat(req, res));
/** @swagger
 * /api/ai/models:
 *   get:
 *     tags: [AI]
 *     summary: 사용 가능한 AI 모델 목록 조회
 *     responses: { 200: { description: 모델 ID 목록 } }
 */
router.get('/models', (req, res) => controller.listModels(req, res));
export default router;
