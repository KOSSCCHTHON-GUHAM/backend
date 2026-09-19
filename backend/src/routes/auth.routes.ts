import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 사용자 인증 및 계정 관리 API
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 사용자 로그인 및 토큰 발급
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123!
 *     responses:
 *       200:
 *         description: 로그인 성공 및 토큰 반환
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
 *                   example: '[TODO] 로그인 로직 미구현'
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: dummy-jwt-token
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: user-id-placeholder
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         nickname:
 *                           type: string
 *                           example: placeholder
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입 및 프로필 초기 설정
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *               - jobField
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123!
 *               nickname:
 *                 type: string
 *                 example: 홍길동
 *               jobField:
 *                 type: string
 *                 example: Frontend
 *     responses:
 *       201:
 *         description: 회원가입 성공 및 초기 프로필 생성
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
 *                   example: '[TODO] 회원가입 로직 미구현'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: new-user-id-placeholder
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         nickname:
 *                           type: string
 *                           example: 홍길동
 *                         jobField:
 *                           type: string
 *                           example: Frontend
 */
router.post('/register', (req, res) => authController.register(req, res));

export default router;
