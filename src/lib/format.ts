export function formatWon(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatMonthLabel(month: string): string {
  const [, m] = month.split("-");
  return `${Number(m)}월`;
}
