/**
 * api/history/[id]/route.ts — 특정 이력 조회/수정 API
 *
 * [id]는 동적 경로 세그먼트입니다. URL의 숫자 부분이 id 파라미터로 전달됩니다.
 * 예: GET /api/history/42 → params.id === "42"
 *
 * GET  /api/history/:id — 해당 이력의 전체 데이터(items JSON 포함) 조회
 * PATCH /api/history/:id — 해당 이력의 제목(title)을 수정
 *
 * [보안] 반드시 userId를 조건에 포함하여 다른 사용자의 데이터에 접근하지 못하도록 합니다.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/** 특정 이력 상세 조회 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // Next.js에서 동적 파라미터는 Promise로 제공됩니다

  // userId를 조건에 포함해 타인의 데이터를 조회하지 못하도록 합니다
  const batch = await prisma.importBatch.findFirst({
    where: { id: Number(id), userId: user.id },
  });

  if (!batch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(batch);
}

/** 이력 제목 수정 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const title: string = body.title ?? "";

  // 수정 전 소유권 확인 (내 데이터가 맞는지)
  const existing = await prisma.importBatch.findFirst({
    where: { id: Number(id), userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.importBatch.update({
    where: { id: Number(id) },
    data: { title },
  });

  return NextResponse.json(updated);
}
