/**
 * proxy.ts — 인증 미들웨어 (요청 가로채기)
 *
 * Next.js 미들웨어는 모든 HTTP 요청이 실제 페이지/API에 도달하기 전에 실행됩니다.
 * 마치 건물 입구의 보안 게이트처럼, 요청을 검사하고 통과/리다이렉트를 결정합니다.
 *
 * [이 미들웨어가 하는 일]
 * 1. 로그인하지 않은 사용자가 보호된 페이지에 접근하면 /login으로 이동시킵니다.
 * 2. 이미 로그인한 사용자가 /login에 접근하면 /로 이동시킵니다.
 * 3. Supabase 세션 쿠키를 갱신합니다 (세션 만료 방지).
 *
 * [config.matcher]
 * 미들웨어를 적용할 경로 패턴입니다.
 * _next/static, _next/image, favicon.ico는 정적 파일이므로 제외합니다.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인 없이도 접근 가능한 공개 경로 목록
const PUBLIC_PATHS = ["/login", "/auth/kakao", "/auth/callback", "/api/auth/withdraw"];

export default async function proxy(request: NextRequest) {
  // NextResponse.next()는 요청을 그대로 다음 단계로 통과시키는 응답입니다.
  // 쿠키를 갱신하기 위해 response 객체를 재할당할 수 있도록 let으로 선언합니다.
  let response = NextResponse.next({ request });

  // 미들웨어에서 Supabase 클라이언트를 생성합니다.
  // 쿠키를 읽고 쓰는 콜백을 직접 구현하여 세션을 관리합니다.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 요청과 응답 양쪽에 쿠키를 설정하여 세션이 갱신되도록 합니다
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 현재 로그인한 사용자를 확인합니다 (이 과정에서 세션도 자동 갱신됩니다)
  const { data: { user } } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  // 비로그인 사용자가 보호된 경로에 접근 시 → 로그인 페이지로 이동
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 로그인한 사용자가 로그인 페이지에 접근 시 → 대시보드로 이동
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

// 미들웨어를 적용할 경로 패턴 (정적 파일 제외)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
