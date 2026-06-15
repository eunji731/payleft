"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Database, LayoutDashboard } from "lucide-react";

const tabs = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/import", label: "데이터 입력", icon: Database },
];

export default function NavTabs() {
  const pathname = usePathname();

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
                const active = pathname === tab.href;
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
             <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 border border-gray-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-gray-500">Live Sync</span>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
