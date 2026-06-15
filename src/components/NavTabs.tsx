"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Database, History, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/import", label: "데이터 입력", icon: Database },
  { href: "/history", label: "저장 이력", icon: History },
];

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUserLabel(
        user ? (user.user_metadata?.name ?? user.user_metadata?.nickname ?? user.email ?? "사용자") : null
      );
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserLabel(
        user ? (user.user_metadata?.name ?? user.user_metadata?.nickname ?? user.email ?? "사용자") : null
      );
    });

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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 p-1.5 text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-gray-900">PayLeft</span>
            </Link>

            <div className="hidden h-8 w-px bg-gray-100 sm:block" />

            <div className="flex h-16 items-center gap-1">
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
