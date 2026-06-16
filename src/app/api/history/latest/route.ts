/**
 * api/history/latest/route.ts — 최신 가져오기 이력 조회 API (GET /api/history/latest)
 *
 * 대시보드(/)에서 현재 할부 데이터가 언제 가져온 것인지 표시하기 위해 사용합니다.
 * 가장 최근에 저장한 importBatch 한 건의 id와 title만 반환합니다.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // findFirst + orderBy를 조합하여 가장 최근 항목 1건만 가져옵니다
  const latest = await prisma.importBatch.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });

  // 이력이 없으면 null 반환 (프론트에서 null 체크로 처리)
  return NextResponse.json(latest);
}
