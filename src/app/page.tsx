"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSummaryStats, InstallmentItem } from "@/lib/calc";
import SummaryCards from "@/components/SummaryCards";
import MonthlyChart from "@/components/MonthlyChart";
import InstallmentList from "@/components/InstallmentList";
import MonthlyDetailTable from "@/components/MonthlyDetailTable";
import EditableTitle from "@/components/EditableTitle";
import InterestRateControl from "@/components/InterestRateControl";
import ExportMenu from "@/components/ExportMenu";
import { LayoutDashboard } from "lucide-react";

interface LatestBatch {
  id: number;
  title: string;
}

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<InstallmentItem[]>([]);
  const [latestBatch, setLatestBatch] = useState<LatestBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestEnabled, setInterestEnabled] = useState(false);
  const [interestRate, setInterestRate] = useState("");

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/installments", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/login");
      return [];
    }
    return res.json();
  }, [router]);

  const fetchLatestBatch = useCallback(async () => {
    const res = await fetch("/api/history/latest", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data ? { id: data.id, title: data.title } : null;
  }, []);

  useEffect(() => {
    Promise.all([fetchItems(), fetchLatestBatch()]).then(([data, batch]) => {
      setItems(data);
      setLatestBatch(batch);
      setLoading(false);
    });

    const handleDataChanged = () => {
      fetchItems().then((data) => setItems(data));
      fetchLatestBatch().then((batch) => setLatestBatch(batch));
    };
    window.addEventListener("payleft:data-changed", handleDataChanged);
    return () => window.removeEventListener("payleft:data-changed", handleDataChanged);
  }, [fetchItems, fetchLatestBatch]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const annualRatePercent = interestEnabled ? Number(interestRate) || 0 : 0;
  const stats = getSummaryStats(items, new Date(), annualRatePercent);
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            {latestBatch ? (
              <EditableTitle
                id={latestBatch.id}
                title={latestBatch.title}
                fallback="PayLeft Dashboard"
                className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
                onSaved={(title) => setLatestBatch((prev) => (prev ? { ...prev, title } : prev))}
              />
            ) : (
              <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                PayLeft Dashboard
              </h1>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {today} 할부 관리 현황입니다.
          </p>
          <p className="mt-1 text-xs font-medium text-gray-400">
            {interestEnabled
              ? `* 연 ${annualRatePercent}% 할부이자를 포함하여 계산된 대시보드입니다.`
              : "* 할부이자는 제외하고, 원금 납부액만 기준으로 계산된 대시보드입니다."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <InterestRateControl
            enabled={interestEnabled}
            onEnabledChange={setInterestEnabled}
            rate={interestRate}
            onRateChange={setInterestRate}
          />
          <ExportMenu
            items={items}
            stats={stats}
            annualRatePercent={annualRatePercent}
            fileNamePrefix={latestBatch?.title || "PayLeft"}
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Stats */}
        <SummaryCards stats={stats} />

        {/* Charts and Trends */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyChart summaries={stats.summaries} />
          </div>
          <div className="lg:col-span-1">
            <MonthlyDetailTable summaries={stats.summaries} />
          </div>
        </div>

        {/* Detailed Data */}
        <div className="grid grid-cols-1">
          <InstallmentList items={items} annualRatePercent={annualRatePercent} />
        </div>
      </div>
    </div>
  );
}
