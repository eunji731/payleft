"use client";

import { useCallback, useEffect, useState } from "react";
import { getSummaryStats, InstallmentItem } from "@/lib/calc";
import SummaryCards from "@/components/SummaryCards";
import MonthlyChart from "@/components/MonthlyChart";
import InstallmentList from "@/components/InstallmentList";
import MonthlyDetailTable from "@/components/MonthlyDetailTable";
import { LayoutDashboard } from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<InstallmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(() => {
    return fetch("/api/installments").then((res) => res.json());
  }, []);

  useEffect(() => {
    fetchItems().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [fetchItems]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const stats = getSummaryStats(items);
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
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              PayLeft Dashboard
            </h1>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {today} 할부 관리 현황입니다.
          </p>
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
          <InstallmentList items={items} />
        </div>
      </div>
    </div>
  );
}
