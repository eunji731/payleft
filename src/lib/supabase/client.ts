/**
 * supabase/client.ts — 브라우저(클라이언트) 전용 Supabase 클라이언트
 *
 * [서버 클라이언트 vs 브라우저 클라이언트]
 * Supabase는 두 가지 클라이언트를 제공합니다:
 * - 브라우저 클라이언트 (이 파일): "use client" 컴포넌트에서 사용
 *   → 사용자의 로그인 상태 변화를 실시간으로 감지할 수 있습니다.
 * - 서버 클라이언트 (server.ts): API Route, Server Component에서 사용
 *   → 쿠키를 통해 서버에서 인증 상태를 확인합니다.
 *
 * 환경변수 앞의 NEXT_PUBLIC_ 접두사는 브라우저에 노출되어도 안전한 공개 키임을 나타냅니다.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
