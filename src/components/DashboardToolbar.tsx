"use client";
/**
 * DashboardToolbar.tsx — 대시보드/이력 상세 페이지 오른쪽 툴바
 *
 * 이자율 설정 컨트롤과 내보내기 메뉴를 하나의 알약(pill) 모양 UI로 묶습니다.
 *
 * [역할 분리]
 * 이 컴포넌트는 InterestRateControl과 ExportMenu를 조합하는 래퍼(wrapper)입니다.
 * 두 컴포넌트의 props를 브리징하고, 이자율 계산만 담당합니다.
 */

import InterestRateControl from "./InterestRateControl";
import ExportMenu from "./ExportMenu";
import { InstallmentItem, SummaryStats } from "@/lib/calc";

interface Props {
  items: InstallmentItem[];
  stats: SummaryStats;
  interestEnabled: boolean;
  onInterestEnabledChange: (enabled: boolean) => void;
  interestRate: string;
  onInterestRateChange: (rate: string) => void;
  fileNamePrefix: string;
}

export default function DashboardToolbar({
  items,
  stats,
  interestEnabled,
  onInterestEnabledChange,
  interestRate,
  onInterestRateChange,
  fileNamePrefix,
}: Props) {
  // 이자 미적용 시 0%로 처리하여 ExportMenu에 전달합니다
  const annualRatePercent = interestEnabled ? Number(interestRate) || 0 : 0;

  return (
    <div className="inline-flex items-center rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
      {/* 좌측: 이자율 토글 */}
      <div className="flex items-center pr-1 border-r border-gray-100">
        <InterestRateControl
          enabled={interestEnabled}
          onEnabledChange={onInterestEnabledChange}
          rate={interestRate}
          onRateChange={onInterestRateChange}
          minimal
        />
      </div>
      {/* 우측: 내보내기 메뉴 */}
      <div className="pl-1">
        <ExportMenu
          items={items}
          stats={stats}
          annualRatePercent={annualRatePercent}
          fileNamePrefix={fileNamePrefix}
          minimal
        />
      </div>
    </div>
  );
}
