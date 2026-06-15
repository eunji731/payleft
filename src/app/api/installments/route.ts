import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const installments = await prisma.installment.findMany({
    orderBy: { payDate: "asc" },
  });
  return NextResponse.json(installments);
}
