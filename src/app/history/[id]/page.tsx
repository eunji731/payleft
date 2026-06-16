"use client";
/**
 * history/[id]/page.tsx — 이력 상세 페이지 (/history/[id])
 *
 * [id]는 동적 경로 세그먼트입니다.
 * 예: /history/42 → 42번 이력의 상세 대시보드
 *
 * 특정 시점에 저장된 할부 데이터를 기준으로 대시보드와 동일한 UI를 보여줍니다.
 * 과거 데이터를 기반으로 하므로 현재 시점을 기준으로 계산합니다.
 * (예: 현재 날짜 기준으로 남은 납부 스케줄 재계산)
 *
 * useParams: Next.js에서 동적 경로의 파라미터를 읽는 훅입니다.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import SummaryCards from "@/components/SummaryCards";
import MonthlyChart from "@/components/MonthlyChart";
import InstallmentList from "@/components/InstallmentList";
import MonthlyDetailTable from "@/components/MonthlyDetailTable";
import EditableTitle from "@/components/EditableTitle";
import DashboardToolbar from "@/components/DashboardToolbar";
import { getSummaryStats, InstallmentItem } from "@/lib/calc";

/** API에서 받아오는 이력 상세 데이터 구조 */
interface BatchDetail {
  id: number;
  title: string;
  itemCount: number;
  createdAt: string;
  items: Omit<InstallmentItem, "id">[]; // DB에 저장된 JSON 항목들 (id 없음)
}

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>(); // URL에서 [id] 파라미터 추출
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
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
          setIsNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setBatch(data);
        setIsLoading(false);
      });
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isNotFound || !batch) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-gray-400">
        해당 이력을 찾을 수 없습니다.
      </div>
    );
  }

  // DB에 저장된 items에는 id가 없으므로 인덱스를 id로 사용합니다
  const items: InstallmentItem[] = batch.items.map((item, index) => ({ ...item, id: index }));
  const annualRatePercent = interestEnabled ? Number(interestRate) || 0 : 0;

  // 저장 당시 데이터 + 현재 날짜를 기준으로 통계를 재계산합니다
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
      {/* 이력 목록으로 돌아가는 링크 */}
      <Link
        href="/history"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        이력 목록
      </Link>

      {/* 헤더 */}
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

        <DashboardToolbar
          items={items}
          stats={stats}
          interestEnabled={interestEnabled}
          onInterestEnabledChange={setInterestEnabled}
          interestRate={interestRate}
          onInterestRateChange={setInterestRate}
          fileNamePrefix={batch.title || "PayLeft"}
        />
      </div>

      {/* 대시보드와 동일한 레이아웃 */}
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
