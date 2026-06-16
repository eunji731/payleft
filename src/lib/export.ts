/**
 * export.ts — PDF/Excel 내보내기 기능
 *
 * 대시보드 데이터를 파일로 내보내는 두 가지 함수를 제공합니다.
 *
 * [지연 로딩(Lazy Import)]
 * html2canvas-pro, jsPDF, xlsx는 모두 용량이 큰 라이브러리입니다.
 * 앱 초기 로딩 시 이 파일들을 모두 불러오면 페이지가 느려집니다.
 * await import(...)를 사용하면 해당 함수가 처음 호출될 때만 라이브러리를 로드합니다.
 * → 초기 번들 크기 감소, 필요할 때만 다운로드
 *
 * 이 파일은 브라우저에서만 동작합니다 (DOM, document 사용).
 */

import { getMonthlyPayment, InstallmentItem, SummaryStats } from "./calc";
import { MARGIN_MM, PAGE_W_MM } from "./pdfReport";

/**
 * 대시보드 데이터를 PDF 파일로 저장합니다.
 *
 * [동작 방식]
 * 1. pdfReport.ts에서 보이지 않는 DOM 요소(off-screen div)를 생성합니다
 * 2. html2canvas로 각 DOM 요소를 이미지로 캡처합니다
 * 3. 캡처된 이미지를 jsPDF로 PDF 페이지에 삽입합니다
 * 4. 완성된 PDF를 사용자 PC에 다운로드합니다
 */
export async function exportDashboardToPdf(
  items: InstallmentItem[],
  stats: SummaryStats,
  annualRatePercent: number,
  title: string,
  fileName: string
) {
  // 세 라이브러리를 동시에 로드합니다 (병렬 처리로 속도 향상)
  const [{ default: html2canvas }, { default: jsPDF }, { buildReportPages }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
    import("./pdfReport"),
  ]);

  // PDF 페이지에 해당하는 DOM 요소들을 생성합니다
  const pages = buildReportPages(items, stats, annualRatePercent, title);

  // 화면 밖에 DOM을 추가합니다 (사용자에게 보이지 않음)
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px"; // 화면 왼쪽 밖으로 숨김
  container.style.top = "0";
  pages.forEach((page) => container.appendChild(page));
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF("p", "mm", "a4"); // A4 세로 방향
    const contentWidthMm = PAGE_W_MM - MARGIN_MM * 2;

    for (let i = 0; i < pages.length; i++) {
      // DOM 요소를 캔버스 이미지로 변환 (scale: 2 = 고해상도 렌더링)
      const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      // 이미지 비율을 유지하면서 PDF 너비에 맞게 높이를 계산합니다
      const imgHeightMm = (canvas.height * contentWidthMm) / canvas.width;

      if (i > 0) pdf.addPage(); // 두 번째 페이지부터 새 페이지 추가
      pdf.addImage(imgData, "PNG", MARGIN_MM, MARGIN_MM, contentWidthMm, imgHeightMm);
    }

    pdf.save(fileName); // 브라우저 다운로드 다이얼로그 실행
  } finally {
    // 오류가 발생해도 DOM에서 반드시 제거합니다
    document.body.removeChild(container);
  }
}

/**
 * 대시보드 데이터를 Excel 파일(.xlsx)로 저장합니다.
 *
 * [시트 구성]
 * 1. 안내: 생성일시, 이자율 포함 여부
 * 2. 할부 항목: 각 항목의 상세 정보
 * 3. 월별 합계: 월별 납부 합계
 * 4. 월별 상세: 월별 항목별 납부 내역
 */
export async function exportDashboardToExcel(
  items: InstallmentItem[],
  stats: SummaryStats,
  annualRatePercent: number,
  fileName: string
) {
  const XLSX = await import("xlsx");

  // 할부 항목 시트 데이터
  const itemRows = items.map((item) => ({
    가맹점명: item.name,
    거래일: item.payDate,
    "현재 회차": item.currentInstallment,
    "전체 회차": item.totalInstallment,
    원금잔액: Math.round(item.amount),
    월납부액: Math.round(getMonthlyPayment(item, annualRatePercent)),
  }));

  // 월별 합계 시트 데이터
  const summaryRows = stats.summaries.map((s) => ({
    월: s.month,
    합계: Math.round(s.total),
  }));

  // 월별 상세 시트 데이터 (각 항목별 납부액)
  const detailRows = stats.summaries.flatMap((s) =>
    s.items.map((entry) => ({
      월: s.month,
      가맹점명: entry.name,
      회차: entry.installmentLabel,
      납부액: Math.round(entry.amount),
    }))
  );

  const generatedAt = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 안내 시트: aoa_to_sheet = Array of Arrays to Sheet
  const infoSheet = XLSX.utils.aoa_to_sheet([
    ["생성일시", generatedAt],
    ["할부이자", annualRatePercent > 0 ? `포함 (연 ${annualRatePercent}%)` : "미포함 (원금 기준)"],
  ]);

  // 워크북(엑셀 파일)에 시트를 추가합니다
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, infoSheet, "안내");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows), "할부 항목");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "월별 합계");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows), "월별 상세");

  // 파일을 브라우저 다운로드로 저장합니다
  XLSX.writeFile(wb, fileName);
}
