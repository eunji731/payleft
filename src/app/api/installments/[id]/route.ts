import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { name, payDate, currentInstallment, totalInstallment, amount } = body;

  const installment = await prisma.installment.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(payDate !== undefined && { payDate }),
      ...(currentInstallment !== undefined && { currentInstallment: Number(currentInstallment) }),
      ...(totalInstallment !== undefined && { totalInstallment: Number(totalInstallment) }),
      ...(amount !== undefined && { amount: Number(amount) }),
    },
  });

  return NextResponse.json(installment);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  await prisma.installment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
