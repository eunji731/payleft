"use client";

import { Percent } from "lucide-react";

interface Props {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  rate: string;
  onRateChange: (rate: string) => void;
}

export default function InterestRateControl({ enabled, onEnabledChange, rate, onRateChange }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
      <button
        onClick={() => onEnabledChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-xs font-bold text-gray-700 whitespace-nowrap">할부이자 포함</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          step={0.1}
          value={rate}
          onChange={(e) => onRateChange(e.target.value)}
          disabled={!enabled}
          placeholder="연 이자율"
          className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-right text-sm font-bold focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50 transition-all"
        />
        <Percent className="h-3.5 w-3.5 text-gray-400" />
      </div>
    </div>
  );
}
