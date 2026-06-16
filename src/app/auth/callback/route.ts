/**
 * auth/callback/route.ts — 카카오 OAuth 콜백 처리 (GET /auth/callback)
 *
 * 카카오 로그인 완료 후 카카오가 이 URL로 인증 코드(code)를 전달합니다.
 *
 * [OAuth 2.0 인증 흐름 - 2단계]
 * 1. 카카오로부터 인증 코드(code)를 받습니다
 * 2. 코드를 액세스 토큰으로 교환합니다 (카카오 서버에 POST 요청)
 * 3. 액세스 토큰으로 사용자 프로필을 조회합니다 (카카오 API 호출)
 * 4. 카카오 ID를 Supabase UUID로 변환하여 Supabase 사용자를 생성/업데이트합니다
 * 5. 매직 링크 토큰을 발급받아 즉시 로그인 처리합니다
 * 6. 메인 페이지로 리다이렉트합니다
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kakaoUserEmail, kakaoUserId } from "@/lib/kakao";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code"); // 카카오가 전달한 일회성 인증 코드

  // 인증 코드가 없으면 로그인 실패로 처리
  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // ── 1단계: 인증 코드 → 액세스 토큰 교환 ─────────────────────────────────
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_CLIENT_ID!,
      client_secret: process.env.KAKAO_CLIENT_SECRET ?? "",
      redirect_uri: `${origin}/auth/callback`,
      code,
    }),
  });

  if (!tokenRes.ok) {
    console.error("[kakao callback] 토큰 교환 실패", await tokenRes.text());
    return NextResponse.redirect(`${origin}/login`);
  }

  const { access_token } = await tokenRes.json();

  // ── 2단계: 액세스 토큰으로 카카오 사용자 프로필 조회 ─────────────────────
  const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    console.error("[kakao callback] 프로필 조회 실패", await profileRes.text());
    return NextResponse.redirect(`${origin}/login`);
  }

  const profile = await profileRes.json();
  const kakaoId = String(profile.id);
  const nickname: string =
    profile.kakao_account?.profile?.nickname ?? profile.properties?.nickname ?? "사용자";

  // ── 3단계: 카카오 ID를 Supabase UUID/이메일로 변환 ────────────────────────
  const userId = kakaoUserId(kakaoId);  // 결정론적 UUID 생성 (항상 동일한 값)
  const email = kakaoUserEmail(kakaoId); // 내부용 가상 이메일

  // ── 4단계: Supabase에 사용자 생성 또는 업데이트 ───────────────────────────
  // 관리자 클라이언트로 RLS 없이 사용자 관리
  const admin = createAdminClient();
  const { data: existing } = await admin.auth.admin.getUserById(userId);

  if (existing?.user) {
    // 이미 가입한 사용자: 닉네임 등 메타데이터 갱신
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { kakao_id: kakaoId, nickname, provider: "kakao" },
    });
  } else {
    // 신규 사용자: Supabase Auth에 계정 생성
    const { error: createError } = await admin.auth.admin.createUser({
      id: userId,
      email,
      email_confirm: true, // 이메일 인증 없이 바로 활성화
      user_metadata: { kakao_id: kakaoId, nickname, provider: "kakao" },
    });

    if (createError) {
      console.error("[kakao callback] 사용자 생성 실패", createError);
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  // ── 5단계: 매직 링크로 즉시 로그인 처리 ─────────────────────────────────
  // 비밀번호가 없으므로 매직 링크 토큰을 발급받아 세션을 직접 생성합니다
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData) {
    console.error("[kakao callback] 매직 링크 생성 실패", linkError);
    return NextResponse.redirect(`${origin}/login`);
  }

  // 발급된 토큰을 즉시 검증하여 쿠키에 세션을 기록합니다
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    console.error("[kakao callback] OTP 검증 실패", verifyError);
    return NextResponse.redirect(`${origin}/login`);
  }

  // ── 6단계: 로그인 완료, 메인 페이지로 이동 ──────────────────────────────
  return NextResponse.redirect(`${origin}/`);
}
