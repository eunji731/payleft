export interface ParsedItem {
  name: string;
  payDate: string;
  currentInstallment: number;
  totalInstallment: number;
  amount: number;
}

/**
 * 카드사 앱에서 복사한 분할납부 텍스트를 파싱한다.
 *
 * 항목 형식 (빈 줄로 구분):
 *   분할납부(가맹점명)
 *   2025.08.31 10/12회차
 *   8,800원
 *   8,800 원   (4번째 줄은 무시)
 */
export function parseInstallmentText(text: string): ParsedItem[] {
  const blocks = text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  const results: ParsedItem[] = [];

  for (const block of blocks) {
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 3) continue;

    const nameMatch = lines[0].match(/^분할납부\((.+)\)$/);
    const name = nameMatch ? nameMatch[1] : lines[0];

    const dateMatch = lines[1].match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d+)\/(\d+)\s*회차/);
    if (!dateMatch) continue;
    const [, year, month, day, current, total] = dateMatch;
    const payDate = `${year}-${month}-${day}`;

    const amountMatch = lines[2].match(/([\d,]+)\s*원/);
    if (!amountMatch) continue;
    const amount = Number(amountMatch[1].replace(/,/g, ""));

    results.push({
      name,
      payDate,
      currentInstallment: Number(current),
      totalInstallment: Number(total),
      amount,
    });
  }

  return results;
}
