import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
const router = Router(); const controller = new AuthController();

/** @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 이메일·비밀번호 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200: { description: 로그인 성공, content: { application/json: { schema: { $ref: '#/components/schemas/LoginResponse' } } } }
 *       401: { description: 인증 실패 }
 */
router.post('/login', (req, res) => controller.login(req, res));
/** @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Supabase 회원가입 후 로그인 이동 정보 반환
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *     responses:
 *       201: { description: 회원가입 성공 및 로그인 화면 이동 지시, content: { application/json: { schema: { $ref: '#/components/schemas/RegisterResponse' } } } }
 *       400: { description: 입력값 오류, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       409: { description: 이미 가입된 이메일, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.post('/register', (req, res) => controller.register(req, res));
/** @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Access Token 재발급
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, required: [refreshToken], properties: { refreshToken: { type: string } } } } }
 *     responses: { 200: { description: 토큰 재발급 성공 }, 401: { description: 유효하지 않은 refresh token } }
 */
router.post('/refresh', (req, res) => controller.refresh(req, res));
/** @swagger
 * /api/auth/check-nickname:
 *   get:
 *     tags: [Auth]
 *     summary: 닉네임 중복 확인
 *     parameters: [{ in: query, name: nickname, required: true, schema: { type: string } }]
 *     responses:
 *       200:
 *         description: 사용 가능 여부 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAvailable: { type: boolean }
 *                 message: { type: string }
 */
router.get('/check-nickname', (req, res) => controller.checkNickname(req, res));
/** @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 로그아웃 및 토큰 무효화
 *     security: [{ bearerAuth: [] }]
 *     responses: { 204: { description: 로그아웃 성공 } }
 */
router.post('/logout', (req, res) => controller.logout(req, res));
export default router;
