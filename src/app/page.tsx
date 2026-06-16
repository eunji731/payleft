"use client";
/**
 * page.tsx — 메인 대시보드 페이지 (/)
 *
 * Next.js에서 app/page.tsx는 루트 URL("/")에 해당하는 페이지입니다.
 * "use client" 선언으로 브라우저에서 실행되며, React 훅을 사용할 수 있습니다.
 *
 * [페이지 구성]
 * 1. 헤더: 이력 제목(편집 가능) + 날짜 + 이자율/내보내기 툴바
 * 2. 요약 카드: 다음달 납부액 / 총 잔여 / 완납 예정월
 * 3. 월별 차트 + 월별 상세 테이블
 * 4. 할부 항목 상세 테이블
 *
 * [데이터 흐름]
 * 페이지 로드 시 → API 호출로 데이터 가져오기 → 상태 업데이트 → 렌더링
 * "payleft:data-changed" 이벤트 수신 시 → 데이터 재조회 (import 페이지에서 저장 후 동기화)
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSummaryStats, InstallmentItem } from "@/lib/calc";
import SummaryCards from "@/components/SummaryCards";
import MonthlyChart from "@/components/MonthlyChart";
import InstallmentList from "@/components/InstallmentList";
import MonthlyDetailTable from "@/components/MonthlyDetailTable";
import EditableTitle from "@/components/EditableTitle";
import DashboardToolbar from "@/components/DashboardToolbar";
import { LayoutDashboard } from "lucide-react";

/** 대시보드 헤더에 표시하는 최신 이력 정보 */
interface LatestBatch {
  id: number;
  title: string;
}

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<InstallmentItem[]>([]);       // 할부 항목 목록
  const [latestBatch, setLatestBatch] = useState<LatestBatch | null>(null); // 최신 이력 정보
  const [isLoading, setIsLoading] = useState(true);
  const [interestEnabled, setInterestEnabled] = useState(false);   // 이자 계산 활성화 여부
  const [interestRate, setInterestRate] = useState("");             // 연 이자율 입력값

  /** 할부 항목 목록을 API에서 가져옵니다 */
  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/installments", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/login"); // 로그인이 필요한 경우 로그인 페이지로 이동
      return [];
    }
    return res.json();
  }, [router]);

  /** 가장 최근 이력(제목 표시용)을 API에서 가져옵니다 */
  const fetchLatestBatch = useCallback(async () => {
    const res = await fetch("/api/history/latest", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data ? { id: data.id, title: data.title } : null;
  }, []);

  useEffect(() => {
    // 페이지 로드 시 두 API를 동시에 호출합니다 (Promise.all = 병렬 처리)
    Promise.all([fetchItems(), fetchLatestBatch()]).then(([data, batch]) => {
      setItems(data);
      setLatestBatch(batch);
      setIsLoading(false);
    });

    // import 페이지에서 데이터를 저장하면 이 이벤트가 발생합니다
    // → 대시보드 데이터를 자동으로 새로고침합니다
    const handleDataChanged = () => {
      fetchItems().then((data) => setItems(data));
      fetchLatestBatch().then((batch) => setLatestBatch(batch));
    };
    window.addEventListener("payleft:data-changed", handleDataChanged);

    // 컴포넌트가 사라질 때 이벤트 리스너를 제거합니다 (메모리 누수 방지)
    return () => window.removeEventListener("payleft:data-changed", handleDataChanged);
  }, [fetchItems, fetchLatestBatch]);

  // 데이터 로딩 중 스피너 표시
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // 이자 미적용 시 0%, 적용 시 입력한 연 이자율(%)
  const annualRatePercent = interestEnabled ? Number(interestRate) || 0 : 0;
  // 모든 통계를 한 번에 계산합니다
  const stats = getSummaryStats(items, new Date(), annualRatePercent);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 영역 */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            {/* 이력이 있으면 편집 가능한 제목, 없으면 고정 제목 표시 */}
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

        {/* 우측 툴바: 이자율 설정 + 내보내기 */}
        <DashboardToolbar
          items={items}
          stats={stats}
          interestEnabled={interestEnabled}
          onInterestEnabledChange={setInterestEnabled}
          interestRate={interestRate}
          onInterestRateChange={setInterestRate}
          fileNamePrefix={latestBatch?.title || "PayLeft"}
        />
      </div>

      <div className="space-y-8">
        {/* 요약 카드 3개 */}
        <SummaryCards stats={stats} />

        {/* 차트(좌 2/3) + 월별 상세(우 1/3) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyChart summaries={stats.summaries} />
          </div>
          <div className="lg:col-span-1">
            <MonthlyDetailTable summaries={stats.summaries} />
          </div>
        </div>

        {/* 할부 항목 상세 테이블 */}
        <div className="grid grid-cols-1">
          <InstallmentList items={items} annualRatePercent={annualRatePercent} />
        </div>
      </div>
    </div>
  );
}
