"use client";
/**
 * history/page.tsx — 저장 이력 목록 페이지 (/history)
 *
 * 과거에 가져온 할부 데이터의 이력 목록을 보여줍니다.
 * 각 이력 항목을 클릭하면 해당 시점의 대시보드(/history/[id])로 이동합니다.
 *
 * [주요 기능]
 * - 이력 목록 표시 (최신 순)
 * - 이력 제목 인라인 수정
 * - 최대 2개 이력을 선택하여 비교 (CompareModal)
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, ChevronRight, Pencil, Check, X, GitCompare } from "lucide-react";
import CompareModal, { CompareBatch } from "@/components/CompareModal";

/** API에서 받아오는 이력 항목 구조 */
interface HistoryEntry {
  id: number;
  title: string;
  itemCount: number;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 제목 수정 관련 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 이력 비교 관련 상태 (최대 2개 선택)
  const [selected, setSelected] = useState<number[]>([]);
  const [compareData, setCompareData] = useState<[CompareBatch, CompareBatch] | null>(null);
  const [isCompareLoading, setIsCompareLoading] = useState(false);

  useEffect(() => {
    fetch("/api/history", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setEntries(data);
        setIsLoading(false);
      });
  }, [router]);

  /** 이력 항목의 제목 수정 모드를 시작합니다 */
  function startEdit(entry: HistoryEntry) {
    setEditingId(entry.id);
    setEditValue(entry.title);
  }

  /** 제목 수정을 취소합니다 */
  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  /** 이력 항목의 선택 상태를 토글합니다 (최대 2개) */
  function toggleSelect(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id); // 이미 선택됨: 해제
      if (prev.length >= 2) return prev; // 이미 2개 선택됨: 무시
      return [...prev, id]; // 새로 추가
    });
  }

  /** 선택한 2개 이력의 상세 데이터를 가져와 비교 모달을 엽니다 */
  async function openCompare() {
    if (selected.length !== 2) return;
    setIsCompareLoading(true);
    try {
      // 두 이력을 동시에 조회합니다 (병렬 처리)
      const [resA, resB] = await Promise.all([
        fetch(`/api/history/${selected[0]}`, { cache: "no-store" }),
        fetch(`/api/history/${selected[1]}`, { cache: "no-store" }),
      ]);
      if (!resA.ok || !resB.ok) return;
      const [a, b] = await Promise.all([resA.json(), resB.json()]);
      setCompareData([a, b]);
    } finally {
      setIsCompareLoading(false);
    }
  }

  /** 이력 제목을 API를 통해 수정합니다 */
  async function saveEdit(id: number) {
    const title = editValue.trim();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        // API 재호출 없이 로컬 상태만 업데이트합니다
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, title } : e)));
        setEditingId(null);
        setEditValue("");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-600 p-1.5 text-white">
          <History className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">저장 이력</h1>
      </div>

      <div className="flex flex-col gap-2">
        {entries.map((entry) => {
          const isEditing = editingId === entry.id;
          const isSelected = selected.includes(entry.id);

          return (
            <div
              key={entry.id}
              onClick={() => !isEditing && toggleSelect(entry.id)}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-6 py-4 shadow-sm transition-all cursor-pointer ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-indigo-50"
                  : "border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md"
              }`}
            >
              {/* 체크박스 (선택 여부 표시) */}
              <div className="flex items-center justify-center shrink-0">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-200 bg-white"
                  } ${(!isSelected && selected.length >= 2) ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              </div>

              {isEditing ? (
                // 수정 모드: 입력 필드 + 저장/취소 버튼
                <div className="flex flex-1 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(entry.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => saveEdit(entry.id)}
                    disabled={isSaving}
                    className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50"
                    title="저장"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                    title="취소"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                // 표시 모드: 제목/날짜 + 수정 버튼 + 상세 링크
                <>
                  <Link
                    href={`/history/${entry.id}`}
                    className="min-w-0 flex-1"
                    onClick={(e) => e.stopPropagation()} // 항목 클릭과 링크 클릭 구분
                  >
                    <p className="truncate text-sm font-bold text-gray-900">{entry.title || "(제목 없음)"}</p>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {new Date(entry.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {entry.itemCount}건
                    </p>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 항목 선택 토글 방지
                      startEdit(entry);
                    }}
                    className="rounded-lg p-2 text-gray-300 hover:bg-gray-50 hover:text-gray-500 transition-all"
                    title="제목 수정"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/history/${entry.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </Link>
                </>
              )}
            </div>
          );
        })}

        {/* 이력이 없을 때 빈 상태 표시 */}
        {entries.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
            저장 이력이 없습니다.
          </div>
        )}
      </div>

      {/* 하단 고정 비교 툴바: 항목을 선택했을 때만 표시 */}
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-xl">
            <span className="text-xs font-bold text-gray-500">{selected.length}/2개 선택됨</span>
            <button
              onClick={() => setSelected([])}
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              선택 취소
            </button>
            <button
              onClick={openCompare}
              disabled={selected.length !== 2 || isCompareLoading}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <GitCompare className="h-3.5 w-3.5" />
              {isCompareLoading ? "불러오는 중..." : "선택한 이력 비교하기"}
            </button>
          </div>
        </div>
      )}

      {/* 비교 모달: 데이터가 있을 때만 렌더링 */}
      {compareData && (
        <CompareModal
          batchA={compareData[0]}
          batchB={compareData[1]}
          onClose={() => setCompareData(null)}
        />
      )}
    </div>
  );
}
