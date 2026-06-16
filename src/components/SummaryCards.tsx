/**
 * SummaryCards.tsx — 대시보드 상단 요약 카드 3개
 *
 * "use client" 없음 = 서버 컴포넌트입니다.
 * props로 데이터를 받아서 HTML을 렌더링하기만 하므로 서버에서 처리할 수 있습니다.
 *
 * 표시 내용:
 * - 다음달 납부액
 * - 총 잔여 할부금
 * - 완납 예정월
 */

import { SummaryStats } from "@/lib/calc";
import { formatWon } from "@/lib/format";
import { Calendar, CreditCard, Wallet } from "lucide-react";

interface Props {
  stats: SummaryStats;
}

export default function SummaryCards({ stats }: Props) {
  // 카드 3개의 데이터를 배열로 정의하여 반복 렌더링합니다
  const cards = [
    {
      label: "다음달 납부액",
      value: formatWon(stats.nextMonthTotal),
      sub: stats.nextMonth,
      icon: <Calendar className="h-5 w-5 opacity-80" />,
      className: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-200/50",
      valueColor: "text-white",
      labelColor: "text-blue-100",
      subColor: "text-blue-100/70",
    },
    {
      label: "총 잔여 할부금",
      value: formatWon(stats.totalRemaining),
      sub: "전체 항목 기준",
      icon: <Wallet className="h-5 w-5 opacity-80" />,
      className: "bg-gradient-to-br from-rose-500 to-orange-600 text-white shadow-rose-200/50",
      valueColor: "text-white",
      labelColor: "text-rose-100",
      subColor: "text-rose-100/70",
    },
    {
      label: "완납 예정월",
      value: stats.completionMonth ?? "-",
      sub: "모든 할부 완료 시점",
      icon: <CreditCard className="h-5 w-5 opacity-80" />,
      className: "bg-white border border-gray-100 shadow-sm",
      valueColor: "text-emerald-600",
      labelColor: "text-gray-500",
      subColor: "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all hover:scale-[1.02] ${card.className}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${card.labelColor}`}>
              {card.label}
            </p>
            {card.icon}
          </div>
          <div className="mt-4">
            <p className={`text-2xl font-black sm:text-3xl ${card.valueColor}`}>
              {card.value}
            </p>
            <p className={`mt-1 text-xs font-medium ${card.subColor}`}>
              {card.sub}
            </p>
          </div>
          {/* 배경 장식용 반투명 원형 blur 효과 */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/5 blur-2xl" />
        </div>
      ))}
    </div>
  );
}
