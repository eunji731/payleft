"use client";
/**
 * MonthlyChart.tsx — 월별 납부금 막대 차트
 *
 * recharts 라이브러리를 사용하는 인터랙티브 차트입니다.
 * 마우스를 올리면 툴팁이 표시되므로 브라우저에서만 동작합니다 → "use client" 필요
 *
 * ResponsiveContainer: 부모 컨테이너 크기에 맞게 차트 크기를 자동 조정합니다.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthlySummary } from "@/lib/calc";
import { formatMonthLabel, formatWon } from "@/lib/format";
import { BarChart3 } from "lucide-react";

interface Props {
  summaries: MonthlySummary[];
}

export default function MonthlyChart({ summaries }: Props) {
  // recharts에 맞는 데이터 형식으로 변환합니다: { month: "10월", total: 150000 }
  const data = summaries.map((s) => ({
    month: formatMonthLabel(s.month), // "2025-10" → "10월"
    total: Math.round(s.total),
  }));

  // 데이터가 없을 때 빈 상태 UI를 표시합니다
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-gray-100 bg-white text-sm text-gray-400 shadow-sm">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        <h2 className="text-sm font-bold text-gray-700">월별 납부금 추이</h2>
      </div>

      <div className="min-h-[380px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* 막대에 그라디언트 색상 적용을 위한 SVG 정의 */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            {/* 수평 격자선 (수직선 없애기 위해 vertical={false}) */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            {/* X축: 월 레이블 */}
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              dy={10}
            />

            {/* Y축: 금액 (만 단위로 축약) */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(value: number) => (value >= 10000 ? `${value / 10000}만` : value.toString())}
            />

            {/* 마우스 호버 시 표시되는 툴팁 */}
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [formatWon(Number(value)), "납부금"]}
            />

            {/* 막대 차트: 위쪽 모서리만 둥글게 */}
            <Bar
              dataKey="total"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
