import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CheckItem {
  name: string;
  payDate: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const items: CheckItem[] = body.items ?? [];

  const existing = await prisma.installment.findMany({
    where: {
      OR: items.map((item) => ({ name: item.name, payDate: item.payDate })),
    },
    select: { name: true, payDate: true },
  });

  return NextResponse.json({ duplicates: existing });
}
