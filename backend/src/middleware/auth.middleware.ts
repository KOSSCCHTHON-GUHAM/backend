import { NextFunction, Request, Response } from 'express';
import { getSupabase } from '../config/supabase';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    res.status(401).json({ success: false, error: 'Bearer access token이 필요합니다.' });
    return;
  }
  try {
    const { data, error } = await getSupabase().auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ success: false, error: '유효하지 않거나 만료된 토큰입니다.' });
      return;
    }
    req.user = { id: data.user.id, email: data.user.email };
    next();
  } catch (error) {
    res.status(503).json({ success: false, error: error instanceof Error ? error.message : '인증 서비스 오류' });
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return next();
  try {
    const { data } = await getSupabase().auth.getUser(token);
    if (data.user) req.user = { id: data.user.id, email: data.user.email };
  } catch {
    // 공개 상세 조회는 인증 설정 오류나 잘못된 선택 토큰 때문에 막지 않습니다.
  }
  next();
};
