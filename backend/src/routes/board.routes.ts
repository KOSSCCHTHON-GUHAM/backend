import { Router } from 'express';
import { BoardController } from '../controllers/board.controller';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';
import { handleUpload } from '../middleware/upload.middleware';
const router = Router(); const controller = new BoardController();

/** @swagger
 * /api/boards:
 *   post:
 *     tags: [Board]
 *     summary: 이미지와 최종 입력값으로 포스팅 등록
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [payload]
 *             properties:
 *               images: { type: array, maxItems: 10, items: { type: string, format: binary } }
 *               payload:
 *                 type: string
 *                 description: BoardCreateInput을 JSON.stringify한 문자열. images 배열 순서가 상세 갤러리 노출 순서가 됩니다.
 *                 example: '{"title":"AI 기반 탄소발자국 측정 앱","category":"IT_AI","recruitCount":4,"content":"프로젝트 소개","giveTags":["기획","AI/ML"],"needTags":["Frontend","UI/UX"],"activityRegion":"서울 / 온라인","activityMethod":"온라인 비대면","activityHours":"주 2회 / 회당 2시간","relatedLinks":["https://example.com"]}'
 *     responses:
 *       201: { description: 포스팅 생성 성공, content: { application/json: { schema: { type: object, properties: { board: { $ref: '#/components/schemas/BoardDetail' } } } } } }
 *       400: { description: JSON·입력값·파일 형식·최대 개수 오류, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *   get:
 *     tags: [Board]
 *     summary: 카테고리·검색·최신순 포스팅 조회
 *     parameters:
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: keyword, schema: { type: string } }
 *       - { in: query, name: sort, schema: { type: string, enum: [LATEST, RECOMMENDED], default: LATEST } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200:
 *         description: 포스팅 카드 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 boards: { type: array, items: { $ref: '#/components/schemas/BoardDetail' } }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 hasNext: { type: boolean }
 */
router.post('/', requireAuth, handleUpload, (req, res) => controller.createBoard(req, res));
router.get('/', (req, res) => controller.getBoards(req, res));

/** @swagger
 * /api/boards/{id}:
 *   get:
 *     tags: [Board]
 *     summary: 포스팅 상세·작성자·소유 권한 조회
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses:
 *       200:
 *         description: imageUrls는 업로드 순서대로 반환되며 비어 있으면 상세 화면에서 갤러리를 숨깁니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 board: { $ref: '#/components/schemas/BoardDetail' }
 *                 author: { type: object, nullable: true }
 *                 permissions: { type: object, properties: { isOwner: { type: boolean } } }
 *                 imageUrls: { type: array, items: { type: string, format: uri } }
 *                 relatedLinks: { type: array, items: { type: string, format: uri } }
 *       404: { description: 포스팅 없음 }
 *   patch:
 *     tags: [Board]
 *     summary: 내가 작성한 포스팅 수정
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/BoardCreateInput' } } } }
 *     responses: { 200: { description: 수정 성공 }, 403: { description: 권한 없음 }, 404: { description: 포스팅 없음 } }
 *   delete:
 *     tags: [Board]
 *     summary: 내가 작성한 포스팅 삭제
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 204: { description: 삭제 성공 }, 403: { description: 권한 없음 }, 404: { description: 포스팅 없음 } }
 */
router.get('/:id', optionalAuth, (req, res) => controller.getBoardById(req, res));
router.patch('/:id', requireAuth, (req, res) => controller.updateBoard(req, res));
router.delete('/:id', requireAuth, (req, res) => controller.deleteBoard(req, res));
export default router;
