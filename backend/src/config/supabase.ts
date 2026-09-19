import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | undefined;

export const getSupabase = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL과 SUPABASE_PUBLISHABLE_KEY가 필요합니다.');
  // 요청 간 로그인 세션이 섞이지 않도록 public client는 호출마다 새로 만듭니다.
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
};

export const getSupabaseAdmin = (): SupabaseClient | undefined => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return undefined;
  adminClient ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return adminClient;
};
