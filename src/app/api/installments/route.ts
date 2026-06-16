/**
 * api/installments/route.ts — 할부 항목 조회 API (GET /api/installments)
 *
 * Next.js에서 app/api/... 경로의 route.ts 파일은 REST API 엔드포인트가 됩니다.
 * export async function GET()은 HTTP GET 메서드를 처리합니다.
 *
 * [동작]
 * 로그인한 사용자의 할부 항목 목록을 DB에서 읽어 JSON으로 반환합니다.
 * 비로그인 요청에는 401 Unauthorized를 반환합니다.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  // 서버에서 현재 로그인한 사용자를 확인합니다 (쿠키 기반)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 현재 사용자의 할부 항목을 거래일 오름차순으로 조회합니다
  const installments = await prisma.installment.findMany({
    where: { userId: user.id },
    orderBy: { payDate: "asc" },
  });

  return NextResponse.json(installments);
}
