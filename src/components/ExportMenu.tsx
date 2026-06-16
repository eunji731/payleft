"use client";
/**
 * ExportMenu.tsx — PDF/Excel 내보내기 드롭다운 메뉴
 *
 * "내보내기" 버튼을 클릭하면 드롭다운이 열리고, PDF 또는 Excel을 선택할 수 있습니다.
 *
 * [지연 로딩(Lazy Loading)]
 * PDF/Excel 라이브러리(jsPDF, xlsx)는 용량이 크기 때문에
 * 앱 초기 로딩 시 불러오지 않고, 내보내기 버튼을 클릭할 때만 import합니다.
 * 이렇게 하면 초기 페이지 로딩 속도가 빨라집니다.
 */

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { InstallmentItem, SummaryStats } from "@/lib/calc";
import { exportDashboardToExcel, exportDashboardToPdf } from "@/lib/export";

interface Props {
  items: InstallmentItem[];
  stats: SummaryStats;
  annualRatePercent: number;
  fileNamePrefix: string;    // 저장될 파일명의 앞부분 (예: "2026년 6월 신한카드")
  minimal?: boolean;         // 툴바 내장용 간결 레이아웃 여부
}

export default function ExportMenu({
  items,
  stats,
  annualRatePercent,
  fileNamePrefix,
  minimal = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePdf() {
    setIsOpen(false);
    setExporting("pdf");
    setError(null);
    try {
      await exportDashboardToPdf(items, stats, annualRatePercent, fileNamePrefix, `${fileNamePrefix}.pdf`);
    } catch (err) {
      console.error("PDF 내보내기 실패", err);
      setError("PDF 생성에 실패했습니다.");
    } finally {
      setExporting(null);
    }
  }

  async function handleExcel() {
    setIsOpen(false);
    setExporting("excel");
    setError(null);
    try {
      await exportDashboardToExcel(items, stats, annualRatePercent, `${fileNamePrefix}.xlsx`);
    } catch (err) {
      console.error("Excel 내보내기 실패", err);
      setError("Excel 생성에 실패했습니다.");
    } finally {
      setExporting(null);
    }
  }

  const buttonClasses = minimal
    ? "flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
    : "flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all";

  return (
    <div className="relative">
      {/* 내보내기 버튼: 클릭 시 드롭다운 토글 */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        disabled={exporting !== null} // 내보내기 진행 중에는 버튼 비활성화
        className={buttonClasses}
      >
        {exporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className={`h-3.5 w-3.5 ${minimal ? "text-indigo-500" : ""}`} />
        )}
        <span>
          {exporting === "pdf" ? "PDF..." : exporting === "excel" ? "Excel..." : "내보내기"}
        </span>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <>
          {/* 배경 오버레이: 메뉴 외부 클릭 시 닫힘 */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <button
              onClick={handlePdf}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <FileText className="h-4 w-4 text-rose-500" />
              PDF로 내보내기
            </button>
            <button
              onClick={handleExcel}
              className="flex w-full items-center gap-2 border-t border-gray-50 px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Excel로 내보내기
            </button>
          </div>
        </>
      )}

      {/* 오류 메시지 */}
      {error && (
        <span className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500">
          {error}
        </span>
      )}
    </div>
  );
}
