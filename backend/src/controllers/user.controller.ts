import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase';
import { boards, profiles } from '../data/memoryStore';
import { AiService } from '../services/ai.service';

export class UserController {
  private readonly ai = new AiService();

  async onboarding(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { giveFields = [], interests = [], regions = [], customGiveText = '', customInterestText = '' } = req.body;
    if (![giveFields, interests, regions].every(Array.isArray)) { res.status(400).json({ success: false, error: 'giveFields, interests, regions는 배열이어야 합니다.' }); return; }
    try {
      const normalized = await this.ai.normalizeProfile(customGiveText, customInterestText);
      const previous = profiles.get(userId);
      const profile = { id: userId, email: req.user?.email ?? previous?.email ?? '', nickname: previous?.nickname ?? '', avatarUrl: previous?.avatarUrl, giveFields, interests, regions, customGiveText, customInterestText, ...normalized, onboardingCompleted: true };
      profiles.set(userId, profile);
      const admin = getSupabaseAdmin();
      if (admin) {
        const { error } = await admin.from('profiles').update({
          give_fields: giveFields,
          interests,
          regions,
          custom_give_text: customGiveText,
          custom_interest_text: customInterestText,
          normalized_give_tags: normalized.normalizedGiveTags,
          normalized_interest_tags: normalized.normalizedInterestTags,
          onboarding_completed: true,
        }).eq('id', userId);
        if (error) throw new Error(`프로필 DB 저장 실패: ${error.message}`);
      }
      res.json({ user: profile, ...normalized, onboardingCompleted: true });
    } catch (error) { res.status(500).json({ success: false, error: error instanceof Error ? error.message : '온보딩 저장 실패' }); }
  }

  async me(req: Request, res: Response): Promise<void> {
    const profile = profiles.get(req.user!.id);
    if (!profile) { res.status(404).json({ success: false, error: '프로필을 찾을 수 없습니다.' }); return; }
    const mine = [...boards.values()].filter((board) => board.authorId === profile.id);
    res.json({ user: profile, boardStats: { total: mine.length, recruiting: mine.filter((b) => b.recruitment.status === 'RECRUITING').length, completed: mine.filter((b) => b.recruitment.status === 'COMPLETED').length } });
  }

  async myBoards(req: Request, res: Response): Promise<void> {
    const status = req.query.status ? String(req.query.status) : undefined;
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const items = [...boards.values()].filter((board) => board.authorId === req.user!.id).filter((board) => !status || board.recruitment.status === status);
    res.json({ boards: items.slice((page - 1) * limit, page * limit), total: items.length, hasNext: page * limit < items.length });
  }
}
