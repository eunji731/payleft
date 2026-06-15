"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

interface Props {
  id: number;
  title: string;
  fallback?: string;
  className?: string;
  onSaved?: (title: string) => void;
}

export default function EditableTitle({ id, title, fallback = "(제목 없음)", className, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = value.trim();
    setSaving(true);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        setEditing(false);
        onSaved?.(trimmed);
      }
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setValue(title);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          autoFocus
          className={`rounded-lg border border-gray-200 bg-white px-3 py-1 focus:border-indigo-500 focus:outline-none ${className ?? ""}`}
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50"
          title="저장"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={cancel}
          disabled={saving}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
          title="취소"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={className}>{title || fallback}</span>
      <button
        onClick={() => setEditing(true)}
        className="rounded-lg p-1.5 text-gray-300 transition-all hover:bg-gray-50 hover:text-gray-500"
        title="제목 수정"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
