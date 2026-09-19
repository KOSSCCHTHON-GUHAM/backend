import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
const router = Router(); const controller = new UserController(); router.use(requireAuth);

/** @swagger
 * /api/users/me/onboarding:
 *   put:
 *     tags: [User]
 *     summary: 선택 태그·직접 입력·지역 저장 및 AI 태그 정규화
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/OnboardingRequest' } } }
 *     responses:
 *       200: { description: 프로필·AI 정규화 태그·onboardingCompleted 반환 }
 *       400: { description: 배열 입력 형식 오류, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.put('/me/onboarding', (req, res) => controller.onboarding(req, res));
/** @swagger
 * /api/users/me:
 *   get:
 *     tags: [User]
 *     summary: 마이페이지 프로필과 작성 글 통계 조회
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: 사용자 프로필과 total·recruiting·completed 통계 }, 404: { description: 프로필 없음 } }
 */
router.get('/me', (req, res) => controller.me(req, res));
/** @swagger
 * /api/users/me/boards:
 *   get:
 *     tags: [User]
 *     summary: 모집 상태별 내가 작성한 포스팅 조회
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [RECRUITING, COMPLETED] } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses: { 200: { description: 내 포스팅 목록 } }
 */
router.get('/me/boards', (req, res) => controller.myBoards(req, res));
export default router;
