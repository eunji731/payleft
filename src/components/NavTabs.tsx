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
import { CreditCard, Database, History, LayoutDashboard, LogOut, UserX, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";

// 네비게이션 탭 목록 정의
const tabs = [
  { href: "/",        label: "대시보드",  icon: LayoutDashboard },
  { href: "/import",  label: "데이터 입력", icon: Database },
  { href: "/history", label: "저장 이력", icon: History },
];

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUserLabel(
        user
          ? (user.user_metadata?.name ?? user.user_metadata?.nickname ?? user.email ?? "사용자")
          : null
      );
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserLabel(
        user
          ? (user.user_metadata?.name ?? user.user_metadata?.nickname ?? user.email ?? "사용자")
          : null
      );
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleWithdraw() {
    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/auth/withdraw", { method: "DELETE" });
      if (!res.ok) throw new Error("탈퇴 실패");
      window.location.replace("/login");
    } catch {
      alert("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setIsWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
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

            <div className="hidden h-8 w-px bg-gray-100 md:block" />

            {/* 데스크톱 탭 목록 (md 이상에서만 표시) */}
            <div className="hidden md:flex h-16 items-center gap-1">
              {tabs.map((tab) => {
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
                    {active && (
                      <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-indigo-600 shadow-[0_-2px_8px_rgba(79,70,229,0.4)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 우측 영역 */}
          <div className="flex items-center gap-2">
            {/* 데스크톱 전용: 사용자 정보 및 로그아웃/탈퇴 (md 이상) */}
            {userLabel && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 pr-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-600">{userLabel}</span>
                </div>
                
                <div className="flex items-center gap-1 rounded-2xl bg-gray-100/50 p-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    로그아웃
                  </button>
                  <button
                    onClick={() => setShowWithdrawConfirm(true)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    탈퇴
                  </button>
                </div>
              </div>
            )}

            {/* 모바일 메뉴 버튼 (md 미만) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 md:hidden"
              aria-expanded={isMenuOpen}
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isMenuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-gray-100 bg-white md:hidden animate-in slide-in-from-top duration-200">
          <div className="space-y-1 p-4">
            {tabs.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                  {tab.label}
                </Link>
              );
            })}

            {userLabel && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="mb-4 flex items-center gap-3 px-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold text-gray-900">{userLabel}</span>
                  <span className="text-xs font-medium text-gray-400">님 환영합니다</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                  <button
                    onClick={() => setShowWithdrawConfirm(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition-all"
                  >
                    <UserX className="h-4 w-4" />
                    탈퇴
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {mounted && showWithdrawConfirm && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900">정말 탈퇴하시겠어요?</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                탈퇴 시 모든 할부 데이터와 저장 이력이 <span className="font-bold text-red-600">즉시 영구 삭제</span>되며, 이 작업은 절대로 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex gap-3 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                disabled={isWithdrawing}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-md shadow-red-100 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isWithdrawing ? "탈퇴 처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
