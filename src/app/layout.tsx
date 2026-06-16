/**
 * layout.tsx — 루트 레이아웃 (모든 페이지의 공통 틀)
 *
 * Next.js에서 layout.tsx는 해당 폴더 하위의 모든 페이지를 감싸는 공통 HTML 구조를 정의합니다.
 * 이 파일은 앱 전체에 적용되는 최상위 레이아웃으로:
 * - <html>, <body> 태그를 포함합니다
 * - 전역 폰트와 스타일을 설정합니다
 * - 모든 페이지 위에 표시되는 NavTabs(상단 네비게이션)를 포함합니다
 *
 * children: 현재 URL에 해당하는 실제 페이지 컴포넌트가 여기에 렌더링됩니다.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavTabs from "@/components/NavTabs";
import "./globals.css";

// Google Fonts를 Next.js가 최적화하여 제공합니다 (폰트 파일을 서버에서 직접 서빙)
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS 변수로 등록되어 Tailwind에서 사용 가능
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 브라우저 탭과 검색 엔진에 표시되는 메타 정보
export const metadata: Metadata = {
  title: "PayLeft - 할부금 관리",
  description: "할부 항목과 월별 납부금을 관리합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // 현재 페이지 컴포넌트
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        {/* 모든 페이지 상단에 고정되는 네비게이션 바 */}
        <NavTabs />
        {/* 실제 페이지 내용이 렌더링되는 영역 */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
