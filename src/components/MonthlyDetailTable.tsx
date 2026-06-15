"use client";

import { useState } from "react";
import { MonthlySummary } from "@/lib/calc";
import { formatWon } from "@/lib/format";
import { ChevronDown, ChevronUp, PieChart } from "lucide-react";

interface Props {
  summaries: MonthlySummary[];
}

export default function MonthlyDetailTable({ summaries }: Props) {
  const [openMonth, setOpenMonth] = useState<string | null>(summaries[0]?.month ?? null);

  if (summaries.length === 0) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 text-sm text-gray-400 shadow-sm">
        <PieChart className="mb-2 h-8 w-8 opacity-20" />
        표시할 납부 일정이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-700">월별 상세 내역</h2>
        </div>
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200 flex-1">
        {summaries.map((summary) => {
          const open = openMonth === summary.month;
          return (
            <div
              key={summary.month}
              className={`overflow-hidden rounded-xl border transition-all ${
                open ? "border-indigo-100 bg-indigo-50/20" : "border-gray-50 bg-white hover:bg-gray-50/50"
              }`}
            >
              <button
                onClick={() => setOpenMonth(open ? null : summary.month)}
                className="flex w-full items-center justify-between px-4 py-3 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${open ? "text-indigo-700" : "text-gray-700"}`}>
                    {summary.month}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-400 border border-gray-100">
                    {summary.items.length}건
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${open ? "text-indigo-600" : "text-gray-800"}`}>
                    {formatWon(summary.total)}
                  </span>
                  {open ? (
                    <ChevronUp className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-300" />
                  )}
                </div>
              </button>
              {open && (
                <div className="px-4 pb-4">
                  <table className="w-full text-left text-[11px] sm:text-xs">
                    <thead>
                      <tr className="border-b border-indigo-100/50 text-indigo-300">
                        <th className="py-2 font-semibold">가맹점명</th>
                        <th className="py-2 font-semibold">회차</th>
                        <th className="py-2 text-right font-semibold">납부액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100/30">
                      {summary.items.map((entry, idx) => (
                        <tr key={`${entry.id}-${idx}`} className="last:border-0">
                          <td className="py-2 text-gray-700 font-medium">{entry.name}</td>
                          <td className="py-2 text-gray-400">{entry.installmentLabel}</td>
                          <td className="py-2 text-right font-bold text-gray-800">
                            {formatWon(entry.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
