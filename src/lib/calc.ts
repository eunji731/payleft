export interface InstallmentItem {
  id: number;
  name: string;
  payDate: string;
  currentInstallment: number;
  totalInstallment: number;
  amount: number;
}

export interface MonthlyPaymentEntry {
  id: number;
  name: string;
  amount: number;
  installmentLabel: string;
}

export interface MonthlySummary {
  month: string;
  total: number;
  items: MonthlyPaymentEntry[];
}

export interface SummaryStats {
  nextMonth: string;
  nextMonthTotal: number;
  totalRemaining: number;
  completionMonth: string | null;
  summaries: MonthlySummary[];
}

/** 남은 회차 = 전체 회차 - 현재 회차 */
export function getRemainingInstallments(item: InstallmentItem): number {
  return Math.max(0, item.totalInstallment - item.currentInstallment);
}

/** 월 납부액 = 원금잔액 ÷ 남은 회차 (균등 분할) + 다음 회차 할부이자 (연 이자율 기준) */
export function getMonthlyPayment(item: InstallmentItem, annualRatePercent: number = 0): number {
  const remaining = getRemainingInstallments(item);
  if (remaining <= 0) return 0;

  const base = Math.floor(item.amount / remaining);
  const remainder = item.amount - base * remaining;
  const principal = remaining === 1 ? base + remainder : base;

  const monthlyRate = annualRatePercent / 100 / 12;
  const interest = item.amount * monthlyRate;

  return principal + interest;
}

export function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

/**
 * 다음달부터 남은 회차만큼의 월별 납부 일정을 계산한다.
 * 마지막 회차에 나눗셈 잔액을 합산하여 원금 합계가 amount와 정확히 일치하도록 한다.
 * annualRatePercent > 0이면, 매월 남은 원금잔액에 대해 이자가 추가로 부과된다.
 */
export function getPaymentSchedule(
  item: InstallmentItem,
  referenceDate: Date = new Date(),
  annualRatePercent: number = 0
): { month: string; amount: number; installmentNo: number }[] {
  const remaining = getRemainingInstallments(item);
  if (remaining <= 0) return [];

  const base = Math.floor(item.amount / remaining);
  const remainder = item.amount - base * remaining;
  const monthlyRate = annualRatePercent / 100 / 12;

  const schedule: { month: string; amount: number; installmentNo: number }[] = [];
  let balance = item.amount;
  for (let i = 1; i <= remaining; i++) {
    const principal = i === remaining ? base + remainder : base;
    const interest = balance * monthlyRate;
    schedule.push({
      month: formatMonth(addMonths(referenceDate, i)),
      amount: principal + interest,
      installmentNo: item.currentInstallment + i,
    });
    balance -= principal;
  }
  return schedule;
}

/** 모든 항목을 합산하여 월별 납부 요약(월별 합계 및 세부 항목)을 생성한다. */
export function buildMonthlySummaries(
  items: InstallmentItem[],
  referenceDate: Date = new Date(),
  annualRatePercent: number = 0
): MonthlySummary[] {
  const map = new Map<string, MonthlySummary>();

  for (const item of items) {
    for (const entry of getPaymentSchedule(item, referenceDate, annualRatePercent)) {
      let summary = map.get(entry.month);
      if (!summary) {
        summary = { month: entry.month, total: 0, items: [] };
        map.set(entry.month, summary);
      }
      summary.total += entry.amount;
      summary.items.push({
        id: item.id,
        name: item.name,
        amount: entry.amount,
        installmentLabel: `${entry.installmentNo}/${item.totalInstallment}회차`,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

/** 상단 요약 카드용 통계: 다음달 납부액 / 총 잔여 할부금 / 완납 예정월 */
export function getSummaryStats(
  items: InstallmentItem[],
  referenceDate: Date = new Date(),
  annualRatePercent: number = 0
): SummaryStats {
  const summaries = buildMonthlySummaries(items, referenceDate, annualRatePercent);
  const nextMonth = formatMonth(addMonths(referenceDate, 1));
  const nextMonthTotal = summaries.find((s) => s.month === nextMonth)?.total ?? 0;
  const totalRemaining = summaries.reduce((sum, s) => sum + s.total, 0);
  const completionMonth = summaries.length > 0 ? summaries[summaries.length - 1].month : null;

  return { nextMonth, nextMonthTotal, totalRemaining, completionMonth, summaries };
}
