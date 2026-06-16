"use client";
/**
 * InterestRateControl.tsx — 할부이자 토글 + 이자율 입력 컴포넌트
 *
 * 두 가지 UI 요소를 포함합니다:
 * 1. 토글 스위치: 이자 계산 포함 여부 (enabled/disabled)
 * 2. 숫자 입력 필드: 연 이자율 입력 (% 단위, 소수점 허용)
 *
 * minimal 모드: 툴바에 내장될 때 사용하는 간결한 레이아웃
 * 일반 모드: 독립적으로 사용할 때 테두리+패딩이 있는 레이아웃
 *
 * 이 컴포넌트는 상태를 직접 가지지 않고, 부모로부터 값을 받아 표시합니다.
 * 변경 시 부모의 콜백(onEnabledChange, onRateChange)을 호출합니다.
 * → 이런 패턴을 "제어 컴포넌트(Controlled Component)"라고 합니다.
 */

import { Percent } from "lucide-react";

interface Props {
  enabled: boolean;                    // 이자 계산 활성화 여부
  onEnabledChange: (enabled: boolean) => void;
  rate: string;                        // 이자율 입력값 (문자열로 관리)
  onRateChange: (rate: string) => void;
  minimal?: boolean;                   // 툴바 내장용 간결 레이아웃 여부
}

export default function InterestRateControl({
  enabled,
  onEnabledChange,
  rate,
  onRateChange,
  minimal = false,
}: Props) {
  const containerClasses = minimal
    ? "flex items-center gap-2 px-1"
    : "flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm";

  return (
    <div className={containerClasses}>
      {/* 토글 스위치 + 레이블 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          {/* 슬라이딩 원형 버튼: enabled 시 오른쪽으로 이동 */}
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">할부이자</span>
      </div>

      {/* 이자율 입력 필드: 비활성화 상태에서는 흐릿하게 표시 */}
      <div className={`flex items-center gap-1 rounded-lg border px-2 py-1 transition-all ${
        enabled
          ? "border-gray-200 bg-gray-50 focus-within:border-indigo-500 focus-within:bg-white"
          : "border-transparent bg-gray-50/50 opacity-40"
      }`}>
        <input
          type="number"
          min={0}
          step={0.1}
          value={rate}
          onChange={(e) => onRateChange(e.target.value)}
          disabled={!enabled}
          placeholder="0.0"
          className="w-10 bg-transparent text-right text-xs font-bold text-gray-700 focus:outline-none disabled:cursor-not-allowed"
        />
        <Percent className="h-3 w-3 text-gray-400" />
      </div>
    </div>
  );
}
