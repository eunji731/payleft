"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ParsedItem, parseInstallmentText } from "@/lib/parse";
import { formatWon } from "@/lib/format";
import { FileText, Save, Send, Trash2 } from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [title, setTitle] = useState("");
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

    if (!title.trim()) {
      setMessage("이력 제목을 입력해주세요.");
      return;
    }

    const confirmed = confirm(
      `현재 저장된 할부 데이터를 모두 삭제하고, 이 ${items.length}건으로 교체합니다.\n계속하시겠습니까?`
    );
    if (!confirmed) return;

    setSaving(true);
    setMessage(null);

    try {
      const saveRes = await fetch("/api/installments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, title: title.trim() }),
      });

      if (!saveRes.ok) {
        setMessage("저장 중 오류가 발생했습니다.");
        return;
      }

      const result = await saveRes.json();
      setMessage(`${result.count}건으로 교체 완료되었습니다.`);
      setItems([]);
      setText("");
      setTitle("");
      window.dispatchEvent(new Event("payleft:data-changed"));
      router.push("/");
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
        <p className="mt-1 text-sm font-medium text-gray-500">할부 항목을 파싱하여 시스템에 등록합니다.</p>
        
        {/* Guide Section */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900">데이터 수집 방법</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-blue-700/80">
                <span className="font-black text-blue-800">신한카드 홈페이지/앱</span> &gt; 마이페이지 &gt; <span className="font-black text-blue-800">할부납부목록</span>의 텍스트를 전체 복사하여 아래에 붙여넣어 주세요.
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                <p className="text-[11px] font-bold text-blue-600/70">본 시스템은 신한카드의 할부 내역 포맷에 최적화되어 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-700">파싱된 데이터 미리보기 ({items.length}건)</h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="이력 제목 (예: 2026년 6월 신한카드)"
                    className="w-56 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
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
