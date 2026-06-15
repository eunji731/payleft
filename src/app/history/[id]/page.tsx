"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import SummaryCards from "@/components/SummaryCards";
import MonthlyChart from "@/components/MonthlyChart";
import InstallmentList from "@/components/InstallmentList";
import MonthlyDetailTable from "@/components/MonthlyDetailTable";
import EditableTitle from "@/components/EditableTitle";
import InterestRateControl from "@/components/InterestRateControl";
import { getSummaryStats, InstallmentItem } from "@/lib/calc";

interface BatchDetail {
  id: number;
  title: string;
  itemCount: number;
  createdAt: string;
  items: Omit<InstallmentItem, "id">[];
}

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [interestEnabled, setInterestEnabled] = useState(false);
  const [interestRate, setInterestRate] = useState("");

  useEffect(() => {
    fetch(`/api/history/${params.id}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setBatch(data);
        setLoading(false);
      });
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (notFound || !batch) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-gray-400">
        해당 이력을 찾을 수 없습니다.
      </div>
    );
  }

  const items: InstallmentItem[] = batch.items.map((item, index) => ({ ...item, id: index }));
  const annualRatePercent = interestEnabled ? Number(interestRate) || 0 : 0;
  const stats = getSummaryStats(items, new Date(), annualRatePercent);
  const savedAt = new Date(batch.createdAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/history"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        이력 목록
      </Link>

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-white">
              <History className="h-5 w-5" />
            </div>
            <EditableTitle
              id={batch.id}
              title={batch.title}
              className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
              onSaved={(title) => setBatch((prev) => (prev ? { ...prev, title } : prev))}
            />
          </div>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {savedAt} 저장 · {batch.itemCount}건의 할부 현황입니다.
          </p>
          <p className="mt-1 text-xs font-medium text-gray-400">
            {interestEnabled
              ? `* 연 ${annualRatePercent}% 할부이자를 포함하여 계산된 대시보드입니다.`
              : "* 할부이자는 제외하고, 원금 납부액만 기준으로 계산된 대시보드입니다."}
          </p>
        </div>

        <InterestRateControl
          enabled={interestEnabled}
          onEnabledChange={setInterestEnabled}
          rate={interestRate}
          onRateChange={setInterestRate}
        />
      </div>

      <div className="space-y-8">
        <SummaryCards stats={stats} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyChart summaries={stats.summaries} />
          </div>
          <div className="lg:col-span-1">
            <MonthlyDetailTable summaries={stats.summaries} />
          </div>
        </div>

        <div className="grid grid-cols-1">
          <InstallmentList items={items} annualRatePercent={annualRatePercent} />
        </div>
      </div>
    </div>
  );
}
