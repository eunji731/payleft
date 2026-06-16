"use client";
/**
 * EditableTitle.tsx — 인라인 편집 가능한 제목 컴포넌트
 *
 * 평소에는 제목 텍스트를 표시하고, 수정 버튼(연필 아이콘)을 클릭하면
 * 입력 필드로 전환됩니다. 저장하면 API를 호출하여 DB에 반영합니다.
 *
 * 사용하는 곳:
 * - 대시보드 헤더 (최신 이력의 제목)
 * - 이력 상세 페이지 헤더
 */

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

interface Props {
  id: number;           // 수정할 importBatch의 id
  title: string;        // 현재 제목
  fallback?: string;    // 제목이 비어있을 때 표시할 기본값
  className?: string;   // 제목 텍스트에 적용할 추가 CSS 클래스
  onSaved?: (title: string) => void; // 저장 완료 후 부모 컴포넌트에 알리는 콜백
}

export default function EditableTitle({ id, title, fallback = "(제목 없음)", className, onSaved }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);  // 입력 필드의 현재 값
  const [isSaving, setIsSaving] = useState(false);

  /** PATCH API를 호출하여 제목을 저장합니다 */
  async function save() {
    const trimmed = value.trim();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        setIsEditing(false);
        onSaved?.(trimmed); // 부모 컴포넌트의 상태도 업데이트
      }
    } finally {
      setIsSaving(false);
    }
  }

  /** 편집을 취소하고 원래 제목으로 되돌립니다 */
  function cancel() {
    setValue(title);
    setIsEditing(false);
  }

  // 편집 모드: 입력 필드 + 저장/취소 버튼
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();   // Enter: 저장
            if (e.key === "Escape") cancel(); // Escape: 취소
          }}
          autoFocus // 편집 모드 진입 시 자동으로 포커스
          className={`rounded-lg border border-gray-200 bg-white px-3 py-1 focus:border-indigo-500 focus:outline-none ${className ?? ""}`}
        />
        <button
          onClick={save}
          disabled={isSaving}
          className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50"
          title="저장"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={cancel}
          disabled={isSaving}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
          title="취소"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // 표시 모드: 제목 텍스트 + 수정 버튼
  return (
    <div className="flex items-center gap-2">
      <span className={className}>{title || fallback}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="rounded-lg p-1.5 text-gray-300 transition-all hover:bg-gray-50 hover:text-gray-500"
        title="제목 수정"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
