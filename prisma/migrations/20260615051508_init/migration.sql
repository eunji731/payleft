-- CreateTable
CREATE TABLE "Installment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "payDate" TEXT NOT NULL,
    "currentInstallment" INTEGER NOT NULL,
    "totalInstallment" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Installment_name_payDate_key" ON "Installment"("name", "payDate");
