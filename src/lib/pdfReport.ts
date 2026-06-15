import { getMonthlyPayment, getRemainingInstallments, InstallmentItem, SummaryStats } from "./calc";
import { formatWon } from "./format";

export const PAGE_W_MM = 210;
export const PAGE_H_MM = 297;
export const MARGIN_MM = 12;

const PX_PER_MM = 96 / 25.4;
const PAGE_W_PX = Math.round((PAGE_W_MM - MARGIN_MM * 2) * PX_PER_MM);

const FONT_STACK = "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

const MONTHLY_ROWS_PER_PAGE = 16;
const ITEM_ROWS_PER_PAGE = 22;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

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

/** 대시보드 데이터를 기반으로 PDF 리포트용 페이지(off-screen DOM) 목록을 생성한다. */
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

  const monthlyRows = stats.summaries.map((s) => [s.month, formatWon(s.total)]);
  const monthlyChunks = chunk(monthlyRows, MONTHLY_ROWS_PER_PAGE);

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

  for (let i = 1; i < monthlyChunks.length; i++) {
    const page = createPage();
    page.innerHTML = `
      <h2 style="margin:0 0 8px;font-size:13px;font-weight:800;color:#334155;">월별 납부 합계 (계속)</h2>
      ${tableHtml(["월", "합계"], monthlyChunks[i])}
    `;
    pages.push(page);
  }

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
