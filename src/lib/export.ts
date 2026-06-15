import { getMonthlyPayment, InstallmentItem, SummaryStats } from "./calc";
import { MARGIN_MM, PAGE_W_MM } from "./pdfReport";

/** 대시보드 데이터를 보기 좋은 표 형태의 리포트 PDF로 저장한다. */
export async function exportDashboardToPdf(
  items: InstallmentItem[],
  stats: SummaryStats,
  annualRatePercent: number,
  title: string,
  fileName: string
) {
  const [{ default: html2canvas }, { default: jsPDF }, { buildReportPages }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
    import("./pdfReport"),
  ]);

  const pages = buildReportPages(items, stats, annualRatePercent, title);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  pages.forEach((page) => container.appendChild(page));
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const contentWidthMm = PAGE_W_MM - MARGIN_MM * 2;

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const imgHeightMm = (canvas.height * contentWidthMm) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", MARGIN_MM, MARGIN_MM, contentWidthMm, imgHeightMm);
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

/** 할부 항목/월별 납부 일정을 엑셀 파일로 내보낸다. */
export async function exportDashboardToExcel(
  items: InstallmentItem[],
  stats: SummaryStats,
  annualRatePercent: number,
  fileName: string
) {
  const XLSX = await import("xlsx");

  const itemRows = items.map((item) => ({
    가맹점명: item.name,
    거래일: item.payDate,
    "현재 회차": item.currentInstallment,
    "전체 회차": item.totalInstallment,
    원금잔액: Math.round(item.amount),
    월납부액: Math.round(getMonthlyPayment(item, annualRatePercent)),
  }));

  const summaryRows = stats.summaries.map((s) => ({
    월: s.month,
    합계: Math.round(s.total),
  }));

  const detailRows = stats.summaries.flatMap((s) =>
    s.items.map((entry) => ({
      월: s.month,
      가맹점명: entry.name,
      회차: entry.installmentLabel,
      납부액: Math.round(entry.amount),
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows), "할부 항목");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "월별 합계");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows), "월별 상세");

  XLSX.writeFile(wb, fileName);
}
