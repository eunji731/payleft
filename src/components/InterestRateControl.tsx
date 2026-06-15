"use client";

import { Percent } from "lucide-react";

interface Props {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  rate: string;
  onRateChange: (rate: string) => void;
  minimal?: boolean;
}

export default function InterestRateControl({ 
  enabled, 
  onEnabledChange, 
  rate, 
  onRateChange,
  minimal = false
}: Props) {
  const containerClasses = minimal
    ? "flex items-center gap-2 px-1"
    : "flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm";

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">할부이자</span>
      </div>
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
