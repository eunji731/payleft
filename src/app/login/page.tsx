/**
 * login/page.tsx — 로그인 페이지 (/login)
 *
 * Next.js에서 폴더 이름이 URL 경로가 됩니다:
 * src/app/login/page.tsx → /login 경로
 *
 * 이 페이지는 순수 서버 컴포넌트입니다 ("use client" 없음).
 * 상태 관리나 이벤트 핸들러가 없기 때문에 서버에서 HTML을 생성해 전송합니다.
 *
 * [로그인 흐름]
 * "카카오로 로그인" 버튼 클릭 → /auth/kakao → 카카오 인증 페이지 → /auth/callback → 메인 페이지
 */

import { CreditCard } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        {/* 앱 로고 아이콘 */}
        <div className="mx-auto mb-4 inline-flex rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 p-3 text-white shadow-md shadow-indigo-200">
          <CreditCard className="h-6 w-6" />
        </div>

        <h1 className="text-xl font-black tracking-tight text-gray-900">PayLeft</h1>
        <p className="mt-1 mb-6 text-sm font-medium text-gray-500">
          로그인하여 할부 현황을 관리하세요.
        </p>

        {/* 카카오 로그인 버튼: /auth/kakao API Route로 이동 */}
        <a
          href="/auth/kakao"
          className="block w-full rounded-xl bg-[#FEE500] px-6 py-3 text-sm font-bold text-[#191919] transition-all hover:brightness-95 active:scale-95"
        >
          카카오로 로그인
        </a>
      </div>
    </div>
  );
}
