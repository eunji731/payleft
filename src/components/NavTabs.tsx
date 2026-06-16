"use client";
/**
 * NavTabs.tsx — 상단 네비게이션 바 컴포넌트
 *
 * "use client"란?
 * Next.js는 기본적으로 컴포넌트를 서버에서 렌더링합니다.
 * 하지만 useEffect, useState, onClick 같은 브라우저 전용 기능을 쓰려면
 * 파일 맨 위에 "use client"를 선언해야 합니다.
 *
 * [이 컴포넌트가 하는 일]
 * - 현재 URL에 따라 활성 탭을 표시합니다 (usePathname 사용)
 * - 로그인한 사용자의 닉네임을 표시합니다 (Supabase 실시간 구독)
 * - 로그아웃 버튼을 제공합니다
 *
 * layout.tsx에서 모든 페이지 위에 공통으로 렌더링됩니다.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Database, History, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// 네비게이션 탭 목록 정의
const tabs = [
  { href: "/",        label: "대시보드",  icon: LayoutDashboard },
  { href: "/import",  label: "데이터 입력", icon: Database },
  { href: "/history", label: "저장 이력", icon: History },
];

export default function NavTabs() {
  const pathname = usePathname(); // 현재 페이지의 URL 경로 (예: "/history")
  const router = useRouter();     // 코드에서 페이지를 이동할 때 사용
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    // 브라우저용 Supabase 클라이언트로 현재 로그인 사용자를 가져옵니다
    const supabase = createClient();

    // 초기 로드 시 현재 로그인 상태 확인
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUserLabel(
        user
          ? (user.user_metadata?.name ?? user.user_metadata?.nickname ?? user.email ?? "사용자")
          : null
      );
    });

    // 로그인/로그아웃 이벤트를 실시간으로 감지하여 UI를 업데이트합니다
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserLabel(
        user
          ? (user.user_metadata?.name ?? user.user_metadata?.nickname ?? user.email ?? "사용자")
          : null
      );
    });

    // 컴포넌트가 사라질 때 구독을 해제합니다 (메모리 누수 방지)
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {/* 좌측: 로고 */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 p-1.5 text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-gray-900">PayLeft</span>
            </Link>

            <div className="hidden h-8 w-px bg-gray-100 sm:block" />

            {/* 탭 목록 */}
            <div className="flex h-16 items-center gap-1">
              {tabs.map((tab) => {
                // 루트("/")는 정확히 일치해야 활성화, 나머지는 startsWith로 처리
                const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all ${
                      active
                        ? "text-indigo-600"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                    {tab.label}
                    {/* 활성 탭 하단에 표시되는 파란색 인디케이터 */}
                    {active && (
                      <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-indigo-600 shadow-[0_-2px_8px_rgba(79,70,229,0.4)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 우측: 사용자 닉네임 + 로그아웃 버튼 */}
          <div className="flex items-center gap-3">
            {userLabel && (
              <span className="hidden text-xs font-bold text-gray-500 sm:inline">{userLabel}</span>
            )}
            {userLabel && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-500 border border-gray-100 hover:bg-gray-100 hover:text-gray-700 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                로그아웃
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
