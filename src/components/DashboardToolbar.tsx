"use client";

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
  const annualRatePercent = interestEnabled ? Number(interestRate) || 0 : 0;

  return (
    <div className="inline-flex items-center rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
      <div className="flex items-center pr-1 border-r border-gray-100">
        <InterestRateControl
          enabled={interestEnabled}
          onEnabledChange={onInterestEnabledChange}
          rate={interestRate}
          onRateChange={onInterestRateChange}
          minimal
        />
      </div>
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
