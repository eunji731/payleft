"use client";

import { getSummaryStats, InstallmentItem } from "@/lib/calc";
import { formatWon } from "@/lib/format";
import { Minus, TrendingDown, TrendingUp, X, GitCompare, ChevronRight } from "lucide-react";

export interface CompareBatch {
  id: number;
  title: string;
  createdAt: string;
  items: Omit<InstallmentItem, "id">[];
}

interface Props {
  batchA: CompareBatch;
  batchB: CompareBatch;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function monthDiffLabel(before: string | null, after: string | null): string {
  if (!before || !after) return "-";
  const [by, bm] = before.split("-").map(Number);
  const [ay, am] = after.split("-").map(Number);
  const diff = (ay * 12 + am) - (by * 12 + bm);
  if (diff === 0) return "변동 없음";
  return diff < 0 ? `${Math.abs(diff)}개월 단축` : `${diff}개월 연장`;
}

/** 금액 변화 배지. 증가는 빚이 늘어난 것이므로 적색, 감소는 청색으로 표시한다. */
function AmountDiffBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400">
        <Minus className="h-3.5 w-3.5" /> 변동 없음
      </span>
    );
  }
  const isIncrease = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold ${
        isIncrease ? "text-rose-500" : "text-emerald-600"
      }`}
    >
      {isIncrease ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {formatWon(Math.abs(value))} {isIncrease ? "증가" : "감소"}
    </span>
  );
}

export default function CompareModal({ batchA, batchB, onClose }: Props) {
  const [older, newer] =
    new Date(batchA.createdAt) <= new Date(batchB.createdAt) ? [batchA, batchB] : [batchB, batchA];

  const toItems = (items: Omit<InstallmentItem, "id">[]): InstallmentItem[] =>
    items.map((item, index) => ({ ...item, id: index }));

  const statsOld = getSummaryStats(toItems(older.items));
  const statsNew = getSummaryStats(toItems(newer.items));

  const nextMonthDiff = statsNew.nextMonthTotal - statsOld.nextMonthTotal;
  const totalRemainingDiff = statsNew.totalRemaining - statsOld.totalRemaining;
  const countDiff = newer.items.length - older.items.length;

  const itemKey = (i: Omit<InstallmentItem, "id">) => `${i.name}__${i.payDate}__${i.totalInstallment}`;
  const oldKeys = new Set(older.items.map(itemKey));
  const newKeys = new Set(newer.items.map(itemKey));
  const completedItems = older.items.filter((i) => !newKeys.has(itemKey(i)));
  const addedItems = newer.items.filter((i) => !oldKeys.has(itemKey(i)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between bg-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
              <GitCompare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">저장 이력 비교</h2>
              <p className="text-xs font-medium text-indigo-100">선택한 두 기록의 변화를 한눈에 확인하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto p-8">
          <div className="relative flex items-center gap-4">
            <div className="flex-1 rounded-2xl bg-gray-50 p-5 border-l-4 border-gray-300 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">BEFORE</span>
              </div>
              <p className="mt-3 truncate text-base font-black text-gray-700">{older.title || "(제목 없음)"}</p>
              <p className="mt-1 text-xs font-medium text-gray-400">{formatDate(older.createdAt)}</p>
            </div>
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 shadow-lg border-4 border-white z-10">
              <ChevronRight className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 rounded-2xl bg-indigo-50/50 p-5 border-l-4 border-indigo-500 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-white px-2 py-0.5 rounded border border-indigo-100">AFTER</span>
              </div>
              <p className="mt-3 truncate text-base font-black text-indigo-900">{newer.title || "(제목 없음)"}</p>
              <p className="mt-1 text-xs font-medium text-indigo-400">{formatDate(newer.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">주요 지표 변화</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">다음달 납부액</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400">이전</span>
                    <span className="text-[10px] font-black text-gray-500">{formatWon(statsOld.nextMonthTotal)}</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-xl font-black text-gray-900 leading-tight">{formatWon(statsNew.nextMonthTotal)}</span>
                  <AmountDiffBadge value={nextMonthDiff} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">총 잔여 할부금</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400">이전</span>
                    <span className="text-[10px] font-black text-gray-500">{formatWon(statsOld.totalRemaining)}</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-xl font-black text-gray-900 leading-tight">{formatWon(statsNew.totalRemaining)}</span>
                  <AmountDiffBadge value={totalRemainingDiff} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">완납 예정월</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400">이전</span>
                    <span className="text-[10px] font-black text-gray-500">{statsOld.completionMonth ?? "-"}</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-xl font-black text-gray-900 leading-tight">{statsNew.completionMonth ?? "-"}</span>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {monthDiffLabel(statsOld.completionMonth, statsNew.completionMonth)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">전체 할부 건수</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400">이전</span>
                    <span className="text-[10px] font-black text-gray-500">{older.items.length}건</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-xl font-black text-gray-900 leading-tight">{newer.items.length}건</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    countDiff === 0 ? "bg-gray-50 text-gray-500" : 
                    countDiff > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {countDiff === 0 ? "변동 없음" : countDiff > 0 ? `${countDiff}건 증가` : `${Math.abs(countDiff)}건 감소`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1 flex items-center gap-1.5">
                완납/제거 항목
                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md text-[10px]">{completedItems.length}</span>
              </h3>
              {completedItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-100 py-6 text-center text-[11px] font-medium text-gray-400">
                  변동 사항 없음
                </p>
              ) : (
                <div className="space-y-2">
                  {completedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-emerald-50 bg-emerald-50/20 px-4 py-3 shadow-sm shadow-emerald-50/50"
                    >
                      <span className="truncate text-xs font-bold text-gray-700">{item.name}</span>
                      <span className="text-[11px] font-black text-emerald-700">{formatWon(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest px-1 flex items-center gap-1.5">
                신규 추가 항목
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md text-[10px]">{addedItems.length}</span>
              </h3>
              {addedItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-100 py-6 text-center text-[11px] font-medium text-gray-400">
                  변동 사항 없음
                </p>
              ) : (
                <div className="space-y-2">
                  {addedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-indigo-50 bg-indigo-50/20 px-4 py-3 shadow-sm shadow-indigo-50/50"
                    >
                      <span className="truncate text-xs font-bold text-gray-700">{item.name}</span>
                      <span className="text-[11px] font-black text-indigo-700">{formatWon(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
