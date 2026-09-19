import { Request, Response } from 'express';
import { getSupabase, getSupabaseAdmin } from '../config/supabase';
import { profiles } from '../data/memoryStore';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) { res.status(400).json({ success: false, error: 'email과 password가 필요합니다.' }); return; }
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error || !data.session || !data.user) { res.status(401).json({ success: false, error: error?.message ?? '로그인 실패' }); return; }
      let profile = profiles.get(data.user.id);
      const { data: dbProfile } = await (getSupabaseAdmin() ?? getSupabase()).from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      if (dbProfile) {
        profile = {
          id: data.user.id, email: data.user.email ?? email, nickname: dbProfile.nickname,
          avatarUrl: dbProfile.avatar_url, giveFields: dbProfile.give_fields ?? [], interests: dbProfile.interests ?? [], regions: dbProfile.regions ?? [],
          customGiveText: dbProfile.custom_give_text, customInterestText: dbProfile.custom_interest_text,
          normalizedGiveTags: dbProfile.normalized_give_tags ?? [], normalizedInterestTags: dbProfile.normalized_interest_tags ?? [],
          onboardingCompleted: Boolean(dbProfile.onboarding_completed),
        };
        profiles.set(profile.id, profile);
      }
      res.json({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token, user: { id: data.user.id, email: data.user.email, nickname: profile?.nickname ?? data.user.user_metadata.nickname ?? '', onboardingCompleted: profile?.onboardingCompleted ?? false } });
    } catch (error) { res.status(503).json({ success: false, error: error instanceof Error ? error.message : '인증 서비스 오류' }); }
  }

  async register(req: Request, res: Response): Promise<void> {
    const { email, password, nickname } = req.body as { email?: string; password?: string; nickname?: string };
    if (!email || !password || !nickname) { res.status(400).json({ success: false, error: 'email, password, nickname이 필요합니다.' }); return; }
    if (password.length < 8) { res.status(400).json({ success: false, error: 'password는 8자 이상이어야 합니다.' }); return; }
    if (nickname.trim().length < 2 || nickname.trim().length > 10) { res.status(400).json({ success: false, error: 'nickname은 2~10자여야 합니다.' }); return; }
    try {
      const supabase = getSupabase();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedNickname = nickname.trim();
      const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password, options: { data: { nickname: normalizedNickname } } });
      if (error || !data.user) {
        const duplicate = /already|registered|exists/i.test(error?.message ?? '');
        res.status(duplicate ? 409 : 400).json({ success: false, error: error?.message ?? '회원가입 실패' }); return;
      }
      // Supabase는 이메일 열거 공격 방지를 위해 기존 이메일에도 가짜 user를 반환할 수 있습니다.
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        res.status(409).json({ success: false, error: '이미 가입된 이메일입니다.' }); return;
      }
      const profile = { id: data.user.id, email: normalizedEmail, nickname: normalizedNickname, giveFields: [], interests: [], regions: [], normalizedGiveTags: [], normalizedInterestTags: [], onboardingCompleted: false };
      profiles.set(data.user.id, profile);
      const writer = getSupabaseAdmin() ?? supabase;
      const { error: profileError } = await writer.from('profiles').upsert({ id: data.user.id, nickname: normalizedNickname, onboarding_completed: false });
      if (profileError) console.warn('[register] profile upsert:', profileError.message);
      res.status(201).json({ user: { id: data.user.id, email: normalizedEmail, nickname: normalizedNickname }, nextAction: 'LOGIN' });
    } catch (error) { res.status(503).json({ success: false, error: error instanceof Error ? error.message : '인증 서비스 오류' }); }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) { res.status(400).json({ success: false, error: 'refreshToken이 필요합니다.' }); return; }
    try {
      const { data, error } = await getSupabase().auth.refreshSession({ refresh_token: refreshToken });
      if (error || !data.session) { res.status(401).json({ success: false, error: error?.message ?? '토큰 재발급 실패' }); return; }
      res.json({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token });
    } catch (error) { res.status(503).json({ success: false, error: error instanceof Error ? error.message : '인증 서비스 오류' }); }
  }

  async checkNickname(req: Request, res: Response): Promise<void> {
    const nickname = String(req.query.nickname ?? '').trim();
    if (!nickname) { res.status(400).json({ success: false, error: 'nickname이 필요합니다.' }); return; }
    try {
      const { data, error } = await (getSupabaseAdmin() ?? getSupabase()).from('profiles').select('id').eq('nickname', nickname).limit(1);
      if (error) throw error;
      const isAvailable = !data?.length;
      res.json({ isAvailable, message: isAvailable ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.' });
    } catch (error) { res.status(503).json({ success: false, error: error instanceof Error ? error.message : '조회 실패' }); }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    try { if (token) await getSupabaseAdmin()?.auth.admin.signOut(token); } catch (error) { console.warn('[logout]', error); }
    res.status(204).send();
  }
}
