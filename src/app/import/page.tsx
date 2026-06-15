"use client";

import { useState } from "react";
import { ParsedItem, parseInstallmentText } from "@/lib/parse";
import { formatWon } from "@/lib/format";
import { FileText, Save, Send, Trash2 } from "lucide-react";

export default function ImportPage() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleParse() {
    const parsed = parseInstallmentText(text);
    setItems(parsed);
    setMessage(
      parsed.length > 0
        ? `${parsed.length}건의 항목을 파싱했습니다.`
        : "파싱된 항목이 없습니다. 텍스트 형식을 확인해주세요."
    );
  }

  function updateItem(index: number, patch: Partial<ParsedItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveAll() {
    if (items.length === 0) return;
    setSaving(true);
    setMessage(null);

    try {
      const checkRes = await fetch("/api/installments/bulk-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ name: i.name, payDate: i.payDate })) }),
      });
      const { duplicates } = await checkRes.json();

      let overwrite = false;
      if (duplicates.length > 0) {
        const names = duplicates
          .map((d: { name: string; payDate: string }) => `${d.name} (${d.payDate})`)
          .join(", ");
        overwrite = confirm(
          `다음 ${duplicates.length}개 항목은 이미 존재합니다:\n${names}\n\n덮어쓰시겠습니까? (취소하면 해당 항목은 건너뜁니다)`
        );
      }

      const saveRes = await fetch("/api/installments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, overwrite }),
      });
      const result = await saveRes.json();

      setMessage(
        `저장 완료: 신규 ${result.created}건, 덮어쓰기 ${result.updated}건, 건너뜀 ${result.skipped}건`
      );
      setItems([]);
      setText("");
    } catch {
      setMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">데이터 입력</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">카드사에서 복사한 텍스트를 붙여넣어 할부 항목을 추가합니다.</p>
      </div>

      <div className="space-y-8">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-sm font-bold text-gray-700">카드사 텍스트 붙여넣기</h2>
            </div>
          </div>
          <div className="p-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`분할납부(08전기0128137559)\n2025.08.31 10/12회차\n8,800원\n8,800 원\n\n분할납부(쿠팡)\n2025.09.11 9/11회차\n74,200원\n74,200 원`}
              className="h-48 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleParse}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-95 transition-all"
              >
                <Send className="h-4 w-4" />
                데이터 파싱하기
              </button>
              {message && (
                <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 animate-in fade-in slide-in-from-left-2">
                  {message}
                </span>
              )}
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-700">파싱된 데이터 미리보기 ({items.length}건)</h2>
                </div>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 disabled:opacity-50 active:scale-95 transition-all"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "저장 중..." : "전체 저장하기"}
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full text-left text-[11px] sm:text-xs">
                  <thead className="sticky top-0 z-10 bg-white text-gray-400">
                    <tr className="border-b border-gray-50">
                      <th className="pb-3 font-medium">가맹점명</th>
                      <th className="pb-3 font-medium">거래일</th>
                      <th className="pb-3 font-medium">현재 회차</th>
                      <th className="pb-3 font-medium">전체 회차</th>
                      <th className="pb-3 text-right font-medium">원금잔액</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50/50">
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(idx, { name: e.target.value })}
                            className="w-full rounded-lg border border-gray-100 bg-white px-2 py-1.5 font-bold text-gray-800 focus:border-indigo-500 focus:outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="date"
                            value={item.payDate}
                            onChange={(e) => updateItem(idx, { payDate: e.target.value })}
                            className="rounded-lg border border-gray-100 bg-white px-2 py-1.5 text-gray-500 focus:border-indigo-500 focus:outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            value={item.currentInstallment}
                            onChange={(e) =>
                              updateItem(idx, { currentInstallment: Number(e.target.value) })
                            }
                            className="w-16 rounded-lg border border-gray-100 bg-white px-2 py-1.5 text-center font-medium focus:border-indigo-500 focus:outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={1}
                            value={item.totalInstallment}
                            onChange={(e) =>
                              updateItem(idx, { totalInstallment: Number(e.target.value) })
                            }
                            className="w-16 rounded-lg border border-gray-100 bg-white px-2 py-1.5 text-center font-medium focus:border-indigo-500 focus:outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <input
                            type="number"
                            min={0}
                            value={item.amount}
                            onChange={(e) => updateItem(idx, { amount: Number(e.target.value) })}
                            className="w-28 rounded-lg border border-gray-100 bg-white px-2 py-1.5 text-right font-bold text-indigo-600 focus:border-indigo-500 focus:outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => removeItem(idx)}
                            className="rounded-lg p-2 text-gray-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="py-4 pr-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                        총 합계
                      </td>
                      <td className="py-4 pr-2 text-right text-lg font-black text-indigo-600">
                        {formatWon(items.reduce((sum, i) => sum + i.amount, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
