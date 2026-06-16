/**
 * calc.ts — 할부 계산 핵심 로직
 *
 * 이 파일은 서버/클라이언트 양쪽에서 모두 사용되는 순수 함수(pure function) 모음입니다.
 * DB나 UI에 의존하지 않고, 입력값만으로 결과를 계산하기 때문에 테스트하기 쉽습니다.
 */

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

/** DB에서 읽어온 할부 항목 하나의 데이터 구조 */
export interface InstallmentItem {
  id: number;
  name: string;             // 가맹점명 (예: "쿠팡", "애플")
  payDate: string;          // 거래일 (예: "2025-09-11")
  currentInstallment: number; // 현재까지 납부한 회차 (예: 9)
  totalInstallment: number;   // 전체 할부 회차 (예: 12)
  amount: number;             // 남은 원금 잔액 (원 단위)
}

/** 월별 상세 내역에서 항목 하나를 나타내는 타입 */
export interface MonthlyPaymentEntry {
  id: number;
  name: string;
  amount: number;           // 해당 월에 납부할 금액
  installmentLabel: string; // 예: "10/12회차"
}

/** 특정 월 전체 납부 정보 (합계 + 각 항목) */
export interface MonthlySummary {
  month: string;            // 예: "2025-10"
  total: number;            // 해당 월 전체 납부 합계
  items: MonthlyPaymentEntry[];
}

/** 대시보드 상단 카드에 표시하는 요약 통계 */
export interface SummaryStats {
  nextMonth: string;         // 다음 달 (예: "2025-11")
  nextMonthTotal: number;    // 다음 달 납부 예정 금액
  totalRemaining: number;    // 모든 항목의 총 잔여 할부금
  completionMonth: string | null; // 가장 늦게 끝나는 항목의 완납 예정월 (없으면 null)
  summaries: MonthlySummary[];    // 월별 납부 스케줄 전체
}

// ─── 기본 계산 함수 ───────────────────────────────────────────────────────────

/**
 * 남은 회차를 계산합니다.
 * 예: 현재 9회차, 전체 12회차 → 3회 남음
 */
export function getRemainingInstallments(item: InstallmentItem): number {
  return Math.max(0, item.totalInstallment - item.currentInstallment);
}

/**
 * 다음 달 납부액을 계산합니다.
 *
 * 계산 방식:
 * - 원금을 남은 회차로 균등 분할합니다.
 * - 마지막 회차에는 나눗셈 나머지(1원 단위 오차)를 합산합니다.
 * - 이자가 있는 경우, 현재 남은 원금잔액 × 월이자율을 추가합니다.
 */
export function getMonthlyPayment(item: InstallmentItem, annualRatePercent: number = 0): number {
  const remaining = getRemainingInstallments(item);
  if (remaining <= 0) return 0;

  // 원금을 회차 수로 나누되, 나머지는 마지막 회차에 붙입니다
  const base = Math.floor(item.amount / remaining);
  const remainder = item.amount - base * remaining;
  const principal = remaining === 1 ? base + remainder : base;

  // 연이율 → 월이율로 변환 (12로 나눔)
  const monthlyRate = annualRatePercent / 100 / 12;
  const interest = item.amount * monthlyRate;

  return principal + interest;
}

// ─── 날짜 유틸리티 ────────────────────────────────────────────────────────────

/** Date 객체를 "YYYY-MM" 형식의 문자열로 변환합니다. */
export function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** 주어진 날짜에서 n개월 후의 1일을 반환합니다. */
export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

// ─── 납부 스케줄 계산 ─────────────────────────────────────────────────────────

/**
 * 한 할부 항목의 남은 납부 스케줄(월별 금액)을 계산합니다.
 *
 * - referenceDate를 기준으로 다음 달부터 시작합니다.
 * - 마지막 회차에 나눗셈 잔액을 합산해 원금 합계가 amount와 정확히 일치하도록 합니다.
 * - annualRatePercent > 0이면 매월 남은 원금잔액에 이자가 추가됩니다.
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
  let balance = item.amount; // 이자 계산을 위해 매월 감소하는 잔액

  for (let i = 1; i <= remaining; i++) {
    const principal = i === remaining ? base + remainder : base; // 마지막 회차에 나머지 합산
    const interest = balance * monthlyRate;

    schedule.push({
      month: formatMonth(addMonths(referenceDate, i)),
      amount: principal + interest,
      installmentNo: item.currentInstallment + i,
    });

    balance -= principal; // 원금 납부만큼 잔액 감소 (이자는 잔액에서 빠지지 않음)
  }

  return schedule;
}

// ─── 전체 집계 함수 ───────────────────────────────────────────────────────────

/**
 * 모든 할부 항목을 합산하여 월별 납부 요약을 만듭니다.
 *
 * 결과: [ { month: "2025-10", total: 150000, items: [...] }, ... ] 형태로
 * 날짜 오름차순으로 정렬됩니다.
 */
export function buildMonthlySummaries(
  items: InstallmentItem[],
  referenceDate: Date = new Date(),
  annualRatePercent: number = 0
): MonthlySummary[] {
  // 월을 key로 하는 Map으로 집계 후 배열로 변환합니다
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

/**
 * 대시보드 상단 요약 카드에 필요한 모든 통계를 한 번에 계산합니다.
 *
 * 반환값:
 * - nextMonth: 다음 달 ("2025-11" 형식)
 * - nextMonthTotal: 다음 달 납부 예정 금액
 * - totalRemaining: 모든 달의 납부 합계 (전체 잔여 할부금)
 * - completionMonth: 마지막 납부가 있는 달 (= 완납 예정월)
 * - summaries: 월별 상세 스케줄 전체
 */
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
