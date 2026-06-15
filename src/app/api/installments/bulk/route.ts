import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface BulkItem {
  name: string;
  payDate: string;
  currentInstallment: number;
  totalInstallment: number;
  amount: number;
}

export async function POST(request: Request) {
  const body = await request.json();
  const items: BulkItem[] = body.items ?? [];
  const overwrite: boolean = body.overwrite ?? false;

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const data = {
      name: item.name,
      payDate: item.payDate,
      currentInstallment: Number(item.currentInstallment),
      totalInstallment: Number(item.totalInstallment),
      amount: Number(item.amount),
    };

    const existing = await prisma.installment.findUnique({
      where: { name_payDate: { name: data.name, payDate: data.payDate } },
    });

    if (existing) {
      if (overwrite) {
        await prisma.installment.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        skipped++;
      }
    } else {
      await prisma.installment.create({ data });
      created++;
    }
  }

  return NextResponse.json({ created, updated, skipped });
}
