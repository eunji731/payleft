/**
 * supabase/server.ts — 서버 전용 Supabase 클라이언트
 *
 * Next.js의 API Route(route.ts)나 Server Component에서 사용됩니다.
 * 브라우저 클라이언트와 달리, HTTP 쿠키를 읽고 쓰는 방식으로 세션을 관리합니다.
 *
 * [왜 쿠키를 직접 처리하나요?]
 * 서버는 브라우저의 localStorage에 접근할 수 없습니다.
 * 대신 HTTP 요청에 포함된 쿠키를 통해 로그인한 사용자가 누구인지 확인합니다.
 *
 * [async 함수인 이유]
 * Next.js의 `cookies()` 함수가 비동기 API이기 때문입니다.
 * API Route에서 `const supabase = await createClient()` 형태로 사용합니다.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 현재 요청의 모든 쿠키를 가져옵니다
        getAll() {
          return cookieStore.getAll();
        },
        // 응답에 쿠키를 설정합니다 (로그인/세션 갱신 시 호출)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출된 경우 쿠키를 설정할 수 없습니다.
            // 이 경우 proxy.ts(미들웨어)가 세션을 갱신하므로 무시해도 안전합니다.
          }
        },
      },
    }
  );
}
