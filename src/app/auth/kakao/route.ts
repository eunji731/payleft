/**
 * auth/kakao/route.ts — 카카오 로그인 시작 엔드포인트 (GET /auth/kakao)
 *
 * Next.js에서 route.ts 파일은 API 엔드포인트를 정의합니다.
 * 이 파일은 브라우저를 카카오 OAuth 인증 페이지로 리다이렉트합니다.
 *
 * [OAuth 2.0 인증 흐름 - 1단계]
 * 사용자가 "카카오로 로그인" 클릭
 *   → 이 API가 호출됨
 *   → 카카오 로그인 페이지(kauth.kakao.com)로 리다이렉트
 *   → 사용자가 카카오 계정으로 로그인
 *   → 카카오가 /auth/callback으로 인증 코드를 전달 (2단계로 이어짐)
 */

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 현재 사이트의 origin을 추출합니다 (예: "https://payleft.vercel.app")
  // 로컬 개발 시에는 "http://localhost:3000"이 됩니다
  const { origin } = new URL(request.url);

  // 카카오 OAuth 인증 URL에 필요한 파라미터를 구성합니다
  const params = new URLSearchParams({
    client_id: process.env.KAKAO_CLIENT_ID!,          // 카카오 앱 키
    redirect_uri: `${origin}/auth/callback`,           // 인증 완료 후 돌아올 주소
    response_type: "code",                             // 인증 코드 방식 사용
  });

  // 카카오 로그인 페이지로 리다이렉트합니다
  return NextResponse.redirect(`https://kauth.kakao.com/oauth/authorize?${params.toString()}`);
}
