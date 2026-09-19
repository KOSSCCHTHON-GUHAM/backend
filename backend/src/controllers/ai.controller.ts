import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';
import { RecommendationService } from '../services/recommendation.service';

export class AiController {
  private readonly ai = new AiService();
  private readonly recommendation = new RecommendationService(this.ai);

  async recommendBoards(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const all = await this.recommendation.boardsForUser(req.user!.id, page * limit, req.query.category ? String(req.query.category) : undefined, req.query.keyword ? String(req.query.keyword) : undefined);
    res.json({ boards: all.slice((page - 1) * limit, page * limit), total: all.length, page, hasNext: page * limit < all.length });
  }

  async recommendUsers(req: Request, res: Response): Promise<void> {
    const boardId = String(req.query.boardId ?? ''); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    if (!boardId) { res.status(400).json({ success: false, error: 'boardId가 필요합니다.' }); return; }
    const recommendations = await this.recommendation.usersForBoard(boardId, req.user!.id, limit);
    if (!recommendations) { res.status(404).json({ success: false, error: '본인이 작성한 포스팅을 찾을 수 없습니다.' }); return; }
    res.json({ recommendations });
  }

  async analyze(req: Request, res: Response): Promise<void> {
    const { title, category, content } = req.body;
    if (![title, category, content].every((value) => typeof value === 'string' && value.trim())) { res.status(400).json({ success: false, error: 'title, category, content가 필요합니다.' }); return; }
    try { res.json(await this.ai.analyzePost(title, category, content)); }
    catch (error) { res.status(502).json({ success: false, error: error instanceof Error ? error.message : 'AI 분석 실패' }); }
  }

  async draft(req: Request, res: Response): Promise<void> {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    let links: string[] = [];
    try {
      const parsed = Array.isArray(req.body.links) ? req.body.links : typeof req.body.links === 'string' ? JSON.parse(req.body.links) : [];
      if (!Array.isArray(parsed) || parsed.some((link) => typeof link !== 'string')) throw new Error();
      links = parsed.map((link) => link.trim()).filter(Boolean);
      if (links.some((link) => { try { return !['http:', 'https:'].includes(new URL(link).protocol); } catch { return true; } })) throw new Error();
    }
    catch { res.status(400).json({ success: false, error: 'links는 JSON 문자열 배열이어야 합니다.' }); return; }
    if (!files.length && !links.length) { res.status(400).json({ success: false, error: '사진 또는 링크를 하나 이상 첨부하세요.' }); return; }
    try { res.json(await this.ai.createDraft(files, links)); }
    catch (error) { res.status(502).json({ success: false, error: error instanceof Error ? error.message : 'AI 초안 생성 실패' }); }
  }

  async chat(req: Request, res: Response): Promise<void> {
    if (!req.body.message) { res.status(400).json({ success: false, error: 'message가 필요합니다.' }); return; }
    try { res.json({ success: true, data: await this.ai.chat(req.body.message, req.body.model) }); }
    catch (error) { res.status(502).json({ success: false, error: error instanceof Error ? error.message : 'AI 요청 실패' }); }
  }

  async listModels(_req: Request, res: Response): Promise<void> {
    try { res.json({ success: true, data: await this.ai.listModels() }); }
    catch (error) { res.status(502).json({ success: false, error: error instanceof Error ? error.message : '모델 조회 실패' }); }
  }
}
