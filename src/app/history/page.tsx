"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, ChevronRight, Pencil, Check, X } from "lucide-react";

interface HistoryEntry {
  id: number;
  title: string;
  itemCount: number;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

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
        setLoading(false);
      });
  }, [router]);

  function startEdit(entry: HistoryEntry) {
    setEditingId(entry.id);
    setEditValue(entry.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveEdit(id: number) {
    const title = editValue.trim();
    setSaving(true);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, title } : e)));
        setEditingId(null);
        setEditValue("");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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

          return (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-2 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
            >
              {isEditing ? (
                <>
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
                    disabled={saving}
                    className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50"
                    title="저장"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                    title="취소"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href={`/history/${entry.id}`} className="min-w-0 flex-1">
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
                    onClick={() => startEdit(entry)}
                    className="rounded-lg p-2 text-gray-300 hover:bg-gray-50 hover:text-gray-500 transition-all"
                    title="제목 수정"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <Link href={`/history/${entry.id}`}>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </Link>
                </>
              )}
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
            저장 이력이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
