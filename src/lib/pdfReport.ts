/**
 * pdfReport.ts — PDF 리포트 DOM 생성기
 *
 * export.ts에서 html2canvas로 캡처할 HTML DOM 요소들을 만들어 반환합니다.
 * 실제 PDF 변환은 export.ts에서 처리하고, 이 파일은 레이아웃 생성만 담당합니다.
 *
 * [동작 방식]
 * - A4 크기에 맞는 너비(px)로 div를 생성합니다
 * - 내용이 많으면 여러 페이지로 나눕니다 (chunk 함수)
 * - HTML 문자열을 직접 조립합니다 (XSS 방지를 위해 escapeHtml 적용)
 *
 * 이 파일은 브라우저에서만 동작합니다 (document.createElement 사용).
 */

import { getMonthlyPayment, getRemainingInstallments, InstallmentItem, SummaryStats } from "./calc";
import { formatWon } from "./format";

// A4 용지 크기 (mm 단위)
export const PAGE_W_MM = 210;
export const PAGE_H_MM = 297;
export const MARGIN_MM = 12; // 상하좌우 여백

// mm → px 변환 (96 DPI 기준)
const PX_PER_MM = 96 / 25.4;
const PAGE_W_PX = Math.round((PAGE_W_MM - MARGIN_MM * 2) * PX_PER_MM);

// 한글 폰트 스택 (운영체제별 대응)
const FONT_STACK = "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

// 페이지당 최대 행 수 (이 이상이면 다음 페이지로 넘깁니다)
const MONTHLY_ROWS_PER_PAGE = 16;
const ITEM_ROWS_PER_PAGE = 22;

/** HTML 특수 문자를 이스케이프하여 XSS를 방지합니다 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 배열을 지정한 크기로 분할합니다. 예: [1,2,3,4,5], size=2 → [[1,2],[3,4],[5]] */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** PDF 한 페이지에 해당하는 div 요소를 생성합니다 */
function createPage(): HTMLDivElement {
  const page = document.createElement("div");
  page.style.width = `${PAGE_W_PX}px`;
  page.style.boxSizing = "border-box";
  page.style.padding = "28px 32px";
  page.style.background = "#ffffff";
  page.style.color = "#0f172a";
  page.style.fontFamily = FONT_STACK;
  page.style.fontSize = "12px";
  return page;
}

/**
 * 헤더 행과 데이터 행을 받아 HTML 테이블 문자열을 반환합니다.
 * - 첫 번째 열은 왼쪽 정렬, 나머지는 오른쪽 정렬
 * - widths: 각 열의 너비 (예: ["32%", "16%", ...])
 */
function tableHtml(headers: string[], rows: string[][], widths?: string[]): string {
  const colgroup = widths
    ? `<colgroup>${widths.map((w) => `<col style="width:${w}">`).join("")}</colgroup>`
    : "";

  const thead = `<thead><tr>${headers
    .map(
      (h, i) =>
        `<th style="text-align:${i === 0 ? "left" : "right"};padding:8px 6px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:11px;">${escapeHtml(h)}</th>`
    )
    .join("")}</tr></thead>`;

  const tbody = `<tbody>${rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell, i) =>
              `<td style="padding:8px 6px;border-bottom:1px solid #f1f5f9;text-align:${i === 0 ? "left" : "right"};${i === 0 ? "font-weight:700;" : ""}">${escapeHtml(cell)}</td>`
          )
          .join("")}</tr>`
    )
    .join("")}</tbody>`;

  return `<table style="width:100%;border-collapse:collapse;font-size:12px;">${colgroup}${thead}${tbody}</table>`;
}

/**
 * 대시보드 데이터를 기반으로 PDF 리포트용 페이지(off-screen DOM) 목록을 생성합니다.
 *
 * 반환된 HTMLDivElement 배열을 export.ts에서 html2canvas로 캡처합니다.
 *
 * [페이지 구성]
 * - 1페이지: 제목, 요약 카드(3개), 월별 합계 표 (일부)
 * - 2페이지~: 월별 합계 표 나머지 (MONTHLY_ROWS_PER_PAGE 초과 시)
 * - 이후 페이지들: 할부 항목 상세 표 (ITEM_ROWS_PER_PAGE씩 분할)
 */
export function buildReportPages(
  items: InstallmentItem[],
  stats: SummaryStats,
  annualRatePercent: number,
  title: string
): HTMLDivElement[] {
  const pages: HTMLDivElement[] = [];
  const generatedAt = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 월별 합계를 페이지 크기로 분할합니다
  const monthlyRows = stats.summaries.map((s) => [s.month, formatWon(s.total)]);
  const monthlyChunks = chunk(monthlyRows, MONTHLY_ROWS_PER_PAGE);

  // ── 1페이지: 제목, 요약 카드, 월별 합계 (첫 번째 분할) ────────────────────
  const firstPage = createPage();
  firstPage.innerHTML = `
    <div style="margin-bottom:20px;">
      <h1 style="margin:0;font-size:20px;font-weight:900;color:#111827;">${escapeHtml(title)}</h1>
      <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">${escapeHtml(generatedAt)} 생성 · ${
        annualRatePercent > 0
          ? `연 ${annualRatePercent}% 할부이자 포함`
          : "할부이자 미포함 (원금 기준)"
      }</p>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:20px;">
      ${[
        ["다음달 납부액", formatWon(stats.nextMonthTotal), stats.nextMonth],
        ["총 잔여 할부금", formatWon(stats.totalRemaining), "전체 항목 기준"],
        ["완납 예정월", stats.completionMonth ?? "-", "모든 할부 완료 시점"],
      ]
        .map(
          ([label, value, sub]) => `
        <div style="flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
          <p style="margin:0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;">${escapeHtml(label)}</p>
          <p style="margin:6px 0 2px;font-size:18px;font-weight:900;color:#1e293b;">${escapeHtml(value)}</p>
          <p style="margin:0;font-size:10px;color:#94a3b8;">${escapeHtml(sub)}</p>
        </div>`
        )
        .join("")}
    </div>
    <h2 style="margin:0 0 8px;font-size:13px;font-weight:800;color:#334155;">월별 납부 합계</h2>
    ${tableHtml(["월", "합계"], monthlyChunks[0] ?? [])}
  `;
  pages.push(firstPage);

  // ── 월별 합계 이어지는 페이지들 ──────────────────────────────────────────
  for (let i = 1; i < monthlyChunks.length; i++) {
    const page = createPage();
    page.innerHTML = `
      <h2 style="margin:0 0 8px;font-size:13px;font-weight:800;color:#334155;">월별 납부 합계 (계속)</h2>
      ${tableHtml(["월", "합계"], monthlyChunks[i])}
    `;
    pages.push(page);
  }

  // ── 할부 항목 상세 페이지들 ────────────────────────────────────────────────
  const itemRows = items.map((item) => {
    const remaining = getRemainingInstallments(item);
    const monthly = getMonthlyPayment(item, annualRatePercent);
    return [
      item.name,
      item.payDate,
      `${item.currentInstallment}/${item.totalInstallment}${remaining === 0 ? " (완납)" : ""}`,
      formatWon(item.amount),
      remaining > 0 ? formatWon(monthly) : "-",
    ];
  });

  const itemChunks = chunk(itemRows, ITEM_ROWS_PER_PAGE);
  const itemColWidths = ["32%", "16%", "16%", "18%", "18%"];

  itemChunks.forEach((rows, i) => {
    const page = createPage();
    page.innerHTML = `
      <h2 style="margin:0 0 8px;font-size:13px;font-weight:800;color:#334155;">할부 항목 상세${i === 0 ? "" : " (계속)"}</h2>
      ${tableHtml(["가맹점명", "거래일", "회차", "원금잔액", "월납부"], rows, itemColWidths)}
    `;
    pages.push(page);
  });

  return pages;
}
