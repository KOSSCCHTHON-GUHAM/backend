import { Router } from 'express';
import { BoardController } from '../controllers/board.controller';

const router = Router();
const boardController = new BoardController();

/**
 * @swagger
 * tags:
 *   name: Board
 *   description: GIVE / NEED 게시판 API
 */

/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: GIVE 또는 NEED 게시글 등록
 *     tags: [Board]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - content
 *               - jobField
 *               - category
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [GIVE, NEED]
 *                 example: GIVE
 *               title:
 *                 type: string
 *                 example: 'React/TypeScript 멘토링 가능합니다.'
 *               content:
 *                 type: string
 *                 example: '프론트엔드 상태관리와 Next.js 관련 고민 나누실 분 구해요!'
 *               jobField:
 *                 type: string
 *                 example: Frontend
 *               category:
 *                 type: string
 *                 example: IT/AI
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['React', 'TypeScript', 'Next.js']
 *     responses:
 *       201:
 *         description: 게시글 등록 성공
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
 *                   example: '[TODO] 게시글 생성 로직 미구현'
 *                 data:
 *                   type: object
 *                   properties:
 *                     board:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: board-id-placeholder
 *                         type:
 *                           type: string
 *                           example: GIVE
 *                         title:
 *                           type: string
 *                           example: 'React/TypeScript 멘토링 가능합니다.'
 *                         content:
 *                           type: string
 *                           example: '프론트엔드 상태관리와 Next.js 관련 고민 나누실 분 구해요!'
 *                         jobField:
 *                           type: string
 *                           example: Frontend
 *                         category:
 *                           type: string
 *                           example: IT/AI
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ['React', 'TypeScript']
 *                         authorId:
 *                           type: string
 *                           example: user-id-placeholder
 *                         createdAt:
 *                           type: string
 *                           example: '2026-09-19T08:00:00.000Z'
 */
router.post('/', (req, res) => boardController.createBoard(req, res));

/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: 직무 및 분야별 게시글 목록 조회
 *     tags: [Board]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [GIVE, NEED]
 *         description: 게시글 유형 (GIVE 또는 NEED)
 *       - in: query
 *         name: jobField
 *         schema:
 *           type: string
 *         description: '직무 필터 (예: Frontend, Backend, AI)'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: '분야 필터 (예: IT/AI, ESG)'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 게시글 목록 조회 성공
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
 *                   example: '[TODO] 게시글 목록 조회 로직 미구현'
 *                 data:
 *                   type: object
 *                   properties:
 *                     boards:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *                     total:
 *                       type: number
 *                       example: 0
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 20
 *                     filters:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: GIVE
 *                         jobField:
 *                           type: string
 *                           example: Frontend
 *                         category:
 *                           type: string
 *                           example: IT/AI
 */
router.get('/', (req, res) => boardController.getBoards(req, res));

/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     summary: 게시글 상세 내용 조회
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 상세 조회 성공
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
 *                   example: '[TODO] 게시글 상세 조회 로직 미구현'
 *                 data:
 *                   type: object
 *                   properties:
 *                     board:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: board-123
 *                         type:
 *                           type: string
 *                           example: GIVE
 *                         title:
 *                           type: string
 *                           example: 'React 멘토링'
 *                         content:
 *                           type: string
 *                           example: '멘토링 상세 내용...'
 *                         jobField:
 *                           type: string
 *                           example: Frontend
 *                         category:
 *                           type: string
 *                           example: IT/AI
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ['React']
 *                         authorId:
 *                           type: string
 *                           example: user-id-placeholder
 *                         viewCount:
 *                           type: number
 *                           example: 0
 *                         createdAt:
 *                           type: string
 *                           example: '2026-09-19T08:00:00.000Z'
 */
router.get('/:id', (req, res) => boardController.getBoardById(req, res));

export default router;
