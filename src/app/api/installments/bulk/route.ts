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

  const normalizedItems = items.map((item) => ({
    name: item.name,
    payDate: item.payDate,
    currentInstallment: Number(item.currentInstallment),
    totalInstallment: Number(item.totalInstallment),
    amount: Number(item.amount),
  }));

  await prisma.$transaction([
    prisma.installment.deleteMany({ where: { userId: user.id } }),
    prisma.installment.createMany({
      data: normalizedItems.map((item) => ({ ...item, userId: user.id })),
    }),
    prisma.importBatch.create({
      data: {
        userId: user.id,
        title,
        itemCount: normalizedItems.length,
        items: normalizedItems,
      },
    }),
  ]);

  return NextResponse.json({ count: items.length });
}
