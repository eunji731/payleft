"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { InstallmentItem, SummaryStats } from "@/lib/calc";
import { exportDashboardToExcel, exportDashboardToPdf } from "@/lib/export";

interface Props {
  items: InstallmentItem[];
  stats: SummaryStats;
  annualRatePercent: number;
  fileNamePrefix: string;
}

export default function ExportMenu({ items, stats, annualRatePercent, fileNamePrefix }: Props) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePdf() {
    setOpen(false);
    setExporting("pdf");
    setError(null);
    try {
      await exportDashboardToPdf(items, stats, annualRatePercent, fileNamePrefix, `${fileNamePrefix}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
      setError("PDF 생성에 실패했습니다.");
    } finally {
      setExporting(null);
    }
  }

  async function handleExcel() {
    setOpen(false);
    setExporting("excel");
    setError(null);
    try {
      await exportDashboardToExcel(items, stats, annualRatePercent, `${fileNamePrefix}.xlsx`);
    } catch (err) {
      console.error("Excel export failed", err);
      setError("Excel 생성에 실패했습니다.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={exporting !== null}
        className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {exporting === "pdf" ? "PDF 생성 중..." : exporting === "excel" ? "Excel 생성 중..." : "내보내기"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
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

      {error && (
        <span className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500">
          {error}
        </span>
      )}
    </div>
  );
}
