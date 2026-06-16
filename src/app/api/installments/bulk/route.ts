/**
 * api/installments/bulk/route.ts — 할부 항목 일괄 교체 API (POST /api/installments/bulk)
 *
 * 데이터 입력 페이지(/import)에서 새 할부 데이터를 저장할 때 호출됩니다.
 *
 * [중요] 이 API는 기존 데이터를 모두 삭제하고 새 데이터로 교체합니다.
 * 카드사 앱에서 복사한 최신 할부 목록으로 덮어쓰는 방식이기 때문입니다.
 *
 * [트랜잭션 처리]
 * 삭제 → 생성 → 이력 저장을 하나의 트랜잭션으로 묶습니다.
 * 중간에 오류가 발생하면 전체가 롤백되어 데이터 불일치를 방지합니다.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface BulkItem {
  name: string;
  payDate: string;
  currentInstallment: number;
  totalInstallment: number;
  amount: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const items: BulkItem[] = body.items ?? [];
  const title: string = body.title ?? "";

  // 숫자 타입을 명시적으로 변환합니다 (폼 입력값이 문자열로 올 수 있음)
  const normalizedItems = items.map((item) => ({
    name: item.name,
    payDate: item.payDate,
    currentInstallment: Number(item.currentInstallment),
    totalInstallment: Number(item.totalInstallment),
    amount: Number(item.amount),
  }));

  // 세 가지 DB 작업을 하나의 트랜잭션으로 실행합니다
  await prisma.$transaction([
    // 1. 현재 사용자의 기존 할부 항목 전체 삭제
    prisma.installment.deleteMany({ where: { userId: user.id } }),

    // 2. 새 할부 항목들 일괄 생성
    prisma.installment.createMany({
      data: normalizedItems.map((item) => ({ ...item, userId: user.id })),
    }),

    // 3. 이번 가져오기 이력을 importBatch 테이블에 저장 (저장 이력 페이지에서 조회됨)
    prisma.importBatch.create({
      data: {
        userId: user.id,
        title,
        itemCount: normalizedItems.length,
        items: normalizedItems, // JSON 형태로 스냅샷 저장
      },
    }),
  ]);

  return NextResponse.json({ count: items.length });
}
