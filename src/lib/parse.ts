/**
 * parse.ts — 카드사 할부 텍스트 파싱 로직
 *
 * 신한카드 앱/홈페이지의 "할부납부목록"에서 복사한 텍스트를 구조화된 데이터로 변환합니다.
 * UI나 DB에 의존하지 않는 순수 함수입니다.
 */

/** 파싱 후 DB 저장 전 단계의 할부 항목 구조 (id 없음) */
export interface ParsedItem {
  name: string;               // 가맹점명
  payDate: string;            // 거래일 (YYYY-MM-DD)
  currentInstallment: number; // 현재 회차
  totalInstallment: number;   // 전체 회차
  amount: number;             // 원금 잔액 (원 단위)
}

/**
 * 카드사 앱에서 복사한 분할납부 텍스트를 파싱합니다.
 *
 * 텍스트 형식 (항목들은 빈 줄로 구분):
 * ─────────────────────────────
 *   분할납부(가맹점명)        ← 1번째 줄: 가맹점명
 *   2025.08.31 10/12회차     ← 2번째 줄: 거래일 + 회차 정보
 *   8,800원                  ← 3번째 줄: 원금 잔액
 *   8,800 원                 ← 4번째 줄: 무시 (카드사 앱에서 중복 표기)
 * ─────────────────────────────
 *
 * "분할납부(xxx)" 형식이 아닌 경우 1번째 줄 전체를 가맹점명으로 사용합니다.
 */
export function parseInstallmentText(text: string): ParsedItem[] {
  // 빈 줄을 기준으로 항목을 분리합니다
  const blocks = text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  const results: ParsedItem[] = [];

  for (const block of blocks) {
    // 각 항목 내부를 줄 단위로 분리합니다
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // 최소 3줄(이름, 날짜+회차, 금액)이 있어야 유효한 항목입니다
    if (lines.length < 3) continue;

    // 1번째 줄: 가맹점명 추출
    const nameMatch = lines[0].match(/^분할납부\((.+)\)$/);
    const name = nameMatch ? nameMatch[1] : lines[0];

    // 2번째 줄: "2025.08.31 10/12회차" 형식 파싱
    const dateMatch = lines[1].match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d+)\/(\d+)\s*회차/);
    if (!dateMatch) continue;
    const [, year, month, day, current, total] = dateMatch;
    const payDate = `${year}-${month}-${day}`;

    // 3번째 줄: "8,800원" 형식에서 숫자만 추출
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
