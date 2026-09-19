import { Router } from 'express';
import { BoardController } from '../controllers/board.controller';

const router = Router();
const boardController = new BoardController();

/**
 * Board Routes (GIVE / NEED 게시판)
 *
 * POST /api/boards       - 게시글 등록 (GIVE 또는 NEED)
 * GET  /api/boards       - 게시글 목록 조회 (직무·분야 필터링)
 * GET  /api/boards/:id   - 게시글 상세 조회
 */
router.post('/', (req, res) => boardController.createBoard(req, res));
router.get('/', (req, res) => boardController.getBoards(req, res));
router.get('/:id', (req, res) => boardController.getBoardById(req, res));

export default router;
