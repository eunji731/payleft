/**
 * api/history/route.ts — 가져오기 이력 목록 조회 API (GET /api/history)
 *
 * 저장 이력 페이지(/history)에서 과거에 가져온 할부 데이터 목록을 조회합니다.
 * 각 항목은 importBatch 테이블의 한 행에 해당합니다.
 *
 * 세부 항목(items JSON)은 포함하지 않고 요약 정보만 반환합니다.
 * 상세 조회는 /api/history/[id]에서 처리합니다.
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

  // 최신 이력이 위에 오도록 createdAt 내림차순으로 정렬합니다
  // select로 필요한 필드만 가져와 응답 크기를 줄입니다 (items는 대용량이므로 제외)
  const batches = await prisma.importBatch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, itemCount: true, createdAt: true },
  });

  return NextResponse.json(batches);
}
