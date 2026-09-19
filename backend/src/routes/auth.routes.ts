import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

/**
 * Auth Routes
 *
 * POST /api/auth/login     - 로그인 및 JWT 토큰 발급
 * POST /api/auth/register  - 회원가입 및 프로필 초기 설정
 */
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));

export default router;
