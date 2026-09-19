import { Router } from 'express';
import { MetaController } from '../controllers/meta.controller';
const router = Router(); const controller = new MetaController();
/** @swagger
 * /api/meta/options:
 *   get:
 *     tags: [Meta]
 *     summary: 직무·관심 분야·지역 선택지 조회
 *     responses: { 200: { description: 온보딩 선택 항목 } }
 */
router.get('/options', (req, res) => controller.options(req, res));
export default router;
