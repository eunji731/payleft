/**
 * api/auth/withdraw/route.ts — 회원탈퇴 엔드포인트 (DELETE /api/auth/withdraw)
 *
 * [탈퇴 처리 순서]
 * 1. 현재 로그인한 Supabase 사용자를 확인합니다
 * 2. 카카오 연동 해제 (Admin 키로 카카오 서버에 요청)
 * 3. Prisma DB에서 해당 사용자의 모든 데이터를 삭제합니다
 * 4. Supabase Auth에서 사용자 계정을 삭제합니다
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  // ── 1단계: 현재 로그인한 사용자 확인 ────────────────────────────────────
  // getSession()은 쿠키의 JWT를 네트워크 호출 없이 바로 읽습니다.
  // (getUser()는 Supabase 서버 검증 때문에 세션 만료 시 hang 가능)
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
  }

  const userId = user.id;
  const kakaoId: string | undefined = user.user_metadata?.kakao_id;

  // ── 2단계: 카카오 연동 해제 ───────────────────────────────────────────────
  // KAKAO_ADMIN_KEY가 설정되어 있을 때만 카카오 서버에 연동 해제 요청을 보냅니다.
  // 실패해도 탈퇴 자체는 계속 진행합니다 (카카오 쪽 연동만 남을 뿐 서비스 계정은 삭제됨).
  if (kakaoId && process.env.KAKAO_ADMIN_KEY) {
    try {
      const unlinkRes = await fetch("https://kapi.kakao.com/v1/user/unlink", {
        method: "POST",
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          target_id_type: "user_id",
          target_id: kakaoId,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!unlinkRes.ok) {
        console.warn("[withdraw] 카카오 연동 해제 실패 (탈퇴는 계속 진행):", await unlinkRes.text());
      }
    } catch (e) {
      console.warn("[withdraw] 카카오 연동 해제 요청 오류 (탈퇴는 계속 진행):", e);
    }
  }

  // ── 3단계: Prisma DB에서 사용자 데이터 삭제 ───────────────────────────────
  await prisma.installment.deleteMany({ where: { userId } });
  await prisma.importBatch.deleteMany({ where: { userId } });

  // ── 4단계: Supabase Auth 계정 삭제 ──────────────────────────────────────
  const admin = createAdminClient();
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("[withdraw] Supabase 계정 삭제 실패:", deleteError);
    return NextResponse.json({ error: "계정 삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
