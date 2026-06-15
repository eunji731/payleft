"use client";

import { getMonthlyPayment, getRemainingInstallments, InstallmentItem } from "@/lib/calc";
import { formatWon } from "@/lib/format";
import { List } from "lucide-react";

interface Props {
  items: InstallmentItem[];
}

export default function InstallmentList({ items }: Props) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-gray-500" />
            <h2 className="text-sm font-bold text-gray-700">할부 항목 상세 ({items.length}건)</h2>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left text-[11px] sm:text-xs">
            <thead className="sticky top-0 z-10 bg-white text-gray-400">
              <tr className="border-b border-gray-50">
                <th className="pb-2 font-medium">가맹점명</th>
                <th className="pb-2 font-medium">거래일</th>
                <th className="pb-2 font-medium">회차</th>
                <th className="pb-2 text-right font-medium">원금잔액</th>
                <th className="pb-2 text-right font-medium">월납부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => {
                const remaining = getRemainingInstallments(item);
                const monthly = getMonthlyPayment(item);

                return (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="font-bold text-gray-800">{item.name}</div>
                    </td>
                    <td className="py-3 pr-2 text-gray-500">{item.payDate}</td>
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-700 font-medium">
                          {item.currentInstallment}/{item.totalInstallment}
                        </span>
                        {remaining === 0 && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                            완납
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-right font-medium text-gray-700">
                      {formatWon(item.amount)}
                    </td>
                    <td className="py-3 pr-2 text-right font-bold text-indigo-600">
                      {remaining > 0 ? formatWon(monthly) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              표시할 할부 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
