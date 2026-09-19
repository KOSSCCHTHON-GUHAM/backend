import { Request, Response } from 'express';
import { boards, createId, profiles } from '../data/memoryStore';
import { BoardDetail } from '../types/api';
import { deletePersistedBoard, persistBoard, storeBoardImages, updatePersistedBoard } from '../services/persistence.service';

const parsePayload = (body: Record<string, unknown>): Record<string, any> => {
  if (typeof body.payload === 'string') {
    try { return JSON.parse(body.payload); } catch { throw new Error('payload는 유효한 JSON이어야 합니다.'); }
  }
  return body;
};
const stringArray = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
const isHttpUrl = (value: string): boolean => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); }
  catch { return false; }
};

export class BoardController {
  async createBoard(req: Request, res: Response): Promise<void> {
    try {
      const data = parsePayload(req.body);
      const required = ['title', 'category', 'content', 'activityRegion', 'activityMethod', 'activityHours'];
      const recruitCount = Number(data.recruitCount);
      if (required.some((key) => !String(data[key] ?? '').trim()) || !Number.isInteger(recruitCount) || recruitCount < 1) {
        res.status(400).json({ success: false, error: '필수 포스팅 입력값이 누락되었습니다.' }); return;
      }
      if (!Array.isArray(data.giveTags) || !Array.isArray(data.needTags)) {
        res.status(400).json({ success: false, error: 'giveTags와 needTags는 문자열 배열이어야 합니다.' }); return;
      }
      const relatedLinks = stringArray(data.relatedLinks);
      if (relatedLinks.some((link) => !isHttpUrl(link))) {
        res.status(400).json({ success: false, error: 'relatedLinks에는 HTTP(S) URL만 사용할 수 있습니다.' }); return;
      }
      const now = new Date().toISOString(); const boardId = createId();
      const imageUrls = await storeBoardImages(req.user!.id, boardId, (req.files as Express.Multer.File[] | undefined) ?? []);
      const board: BoardDetail = {
        id: boardId, authorId: req.user!.id, title: String(data.title).trim(), category: String(data.category), recruitCount,
        content: String(data.content), giveTags: stringArray(data.giveTags), needTags: stringArray(data.needTags),
        activityRegion: String(data.activityRegion), activityMethod: String(data.activityMethod), activityHours: String(data.activityHours),
        relatedLinks, imageUrls,
        recruitment: { current: 0, target: recruitCount, status: 'RECRUITING' }, createdAt: now, updatedAt: now,
      };
      await persistBoard(board);
      boards.set(board.id, board);
      res.status(201).json({ board });
    } catch (error) { res.status(400).json({ success: false, error: error instanceof Error ? error.message : '잘못된 요청' }); }
  }

  getBoards(req: Request, res: Response): void {
    const { category, keyword, sort = 'LATEST' } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    let items = [...boards.values()].filter((board) => !category || category === 'ALL' || board.category === category)
      .filter((board) => !keyword || `${board.title} ${board.giveTags.join(' ')} ${board.needTags.join(' ')}`.toLowerCase().includes(String(keyword).toLowerCase()));
    if (sort === 'LATEST') items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ boards: items.slice((page - 1) * limit, page * limit).map((board) => ({ ...board, author: profiles.get(board.authorId) ? { id: board.authorId, nickname: profiles.get(board.authorId)!.nickname } : undefined })), total: items.length, page, hasNext: page * limit < items.length });
  }

  getBoardById(req: Request, res: Response): void {
    const board = boards.get(req.params.id);
    if (!board) { res.status(404).json({ success: false, error: '포스팅을 찾을 수 없습니다.' }); return; }
    const profile = profiles.get(board.authorId);
    res.json({ board, author: profile ? { id: profile.id, nickname: profile.nickname, giveFields: profile.giveFields } : null, permissions: { isOwner: req.user?.id === board.authorId }, imageUrls: board.imageUrls, relatedLinks: board.relatedLinks });
  }

  async updateBoard(req: Request, res: Response): Promise<void> {
    const board = boards.get(req.params.id);
    if (!board) { res.status(404).json({ success: false, error: '포스팅을 찾을 수 없습니다.' }); return; }
    if (board.authorId !== req.user!.id) { res.status(403).json({ success: false, error: '수정 권한이 없습니다.' }); return; }
    const allowed = ['title', 'category', 'recruitCount', 'content', 'giveTags', 'needTags', 'activityRegion', 'activityMethod', 'activityHours', 'relatedLinks'] as const;
    for (const key of allowed) if (req.body[key] !== undefined) (board as any)[key] = req.body[key];
    board.recruitment.target = Number(board.recruitCount); board.updatedAt = new Date().toISOString();
    try { await updatePersistedBoard(board); }
    catch (error) { res.status(500).json({ success: false, error: error instanceof Error ? error.message : '수정 실패' }); return; }
    res.json({ board });
  }

  async deleteBoard(req: Request, res: Response): Promise<void> {
    const board = boards.get(req.params.id);
    if (!board) { res.status(404).json({ success: false, error: '포스팅을 찾을 수 없습니다.' }); return; }
    if (board.authorId !== req.user!.id) { res.status(403).json({ success: false, error: '삭제 권한이 없습니다.' }); return; }
    try { await deletePersistedBoard(board.id, board.authorId); }
    catch (error) { res.status(500).json({ success: false, error: error instanceof Error ? error.message : '삭제 실패' }); return; }
    boards.delete(board.id); res.status(204).send();
  }
}
