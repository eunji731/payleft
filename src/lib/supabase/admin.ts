/**
 * supabase/admin.ts — 관리자 권한 Supabase 클라이언트
 *
 * SERVICE_ROLE_KEY를 사용하는 슈퍼유저 클라이언트입니다.
 * 일반 클라이언트와 달리 Row Level Security(RLS)를 우회하여 모든 데이터에 접근할 수 있습니다.
 *
 * [사용 목적]
 * 카카오 로그인 콜백(/auth/callback)에서 사용자를 직접 생성하거나
 * 매직 링크(magiclink) 토큰을 발급할 때 관리자 권한이 필요합니다.
 *
 * [보안 주의사항]
 * SERVICE_ROLE_KEY는 절대 브라우저에 노출되면 안 됩니다.
 * NEXT_PUBLIC_ 접두사 없이 .env에 저장하여 서버에서만 사용합니다.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // 서버 전용 비밀 키
    {
      auth: {
        autoRefreshToken: false, // 서버에서는 토큰 자동 갱신 불필요
        persistSession: false,   // 서버에서는 세션 저장 불필요
      },
    }
  );
}
