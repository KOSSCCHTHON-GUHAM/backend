import { Request, Response } from 'express';

/**
 * Board Controller
 * - GIVE/NEED 게시판 관련 요청을 처리합니다.
 */
export class BoardController {
  /**
   * POST /api/boards
   * GIVE 또는 NEED 게시글 등록
   *
   * @body {
   *   type: 'GIVE' | 'NEED',
   *   title: string,
   *   content: string,
   *   jobField: string,       // e.g. 'Frontend', 'Backend', 'AI'
   *   category: string,       // e.g. 'IT/AI', 'ESG'
   *   tags: string[],
   * }
   * @returns { success: boolean, board: BoardDto }
   */
  async createBoard(req: Request, res: Response): Promise<void> {
    const { type, title, content, jobField, category, tags } = req.body;

    // TODO: 인증 미들웨어에서 userId 추출 (req.user)
    // TODO: 입력값 유효성 검사
    // TODO: BoardService.create() 호출하여 DB 저장
    // TODO: AI 분석 서비스 연동 (태그 자동 추출 등 — 선택적)

    res.status(201).json({
      success: true,
      message: '[TODO] 게시글 생성 로직 미구현',
      data: {
        board: {
          id: 'board-id-placeholder',
          type,
          title,
          content,
          jobField,
          category,
          tags: tags ?? [],
          authorId: 'user-id-placeholder',
          createdAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * GET /api/boards
   * 직무(Frontend, Backend 등) 및 분야(IT/AI, ESG)별 게시글 목록 조회
   *
   * @query {
   *   type?: 'GIVE' | 'NEED',
   *   jobField?: string,
   *   category?: string,
   *   page?: number,
   *   limit?: number,
   * }
   * @returns { success: boolean, boards: BoardDto[], total: number, page: number }
   */
  async getBoards(req: Request, res: Response): Promise<void> {
    const { type, jobField, category, page = 1, limit = 20 } = req.query;

    // TODO: 쿼리 파라미터로 필터링 조건 구성
    // TODO: BoardService.findAll(filters, pagination) 호출
    // TODO: 페이지네이션 처리

    res.status(200).json({
      success: true,
      message: '[TODO] 게시글 목록 조회 로직 미구현',
      data: {
        boards: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
        filters: { type, jobField, category },
      },
    });
  }

  /**
   * GET /api/boards/:id
   * 게시글 상세 내용 조회
   *
   * @param id - 게시글 ID
   * @returns { success: boolean, board: BoardDto }
   */
  async getBoardById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // TODO: BoardService.findById(id) 호출
    // TODO: 존재하지 않는 게시글 404 처리
    // TODO: 조회수 증가 처리

    res.status(200).json({
      success: true,
      message: '[TODO] 게시글 상세 조회 로직 미구현',
      data: {
        board: {
          id,
          type: 'GIVE',
          title: 'placeholder title',
          content: 'placeholder content',
          jobField: 'placeholder',
          category: 'placeholder',
          tags: [],
          authorId: 'user-id-placeholder',
          viewCount: 0,
          createdAt: new Date().toISOString(),
        },
      },
    });
  }
}
