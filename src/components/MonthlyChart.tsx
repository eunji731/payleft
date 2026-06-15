"use client";

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
  const data = summaries.map((s) => ({
    month: formatMonthLabel(s.month),
    total: Math.round(s.total),
  }));

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
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(value: number) => (value >= 10000 ? `${value / 10000}만` : value.toString())}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [formatWon(Number(value)), "납부금"]}
            />
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
