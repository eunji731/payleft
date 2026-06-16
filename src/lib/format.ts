/**
 * format.ts — 화면 표시용 포맷팅 유틸리티
 *
 * 숫자나 문자열을 사용자에게 보기 좋은 형태로 변환하는 순수 함수 모음입니다.
 */

/**
 * 숫자를 한국 원화 표기로 변환합니다.
 * 예: 150000 → "150,000원"
 */
export function formatWon(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

/**
 * "YYYY-MM" 형식의 월 문자열에서 "N월" 형태의 레이블을 추출합니다.
 * 차트 X축 등 짧은 레이블이 필요할 때 사용합니다.
 * 예: "2025-10" → "10월"
 */
export function formatMonthLabel(month: string): string {
  const [, m] = month.split("-");
  return `${Number(m)}월`;
}
