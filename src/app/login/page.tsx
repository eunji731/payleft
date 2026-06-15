import { CreditCard } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 inline-flex rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 p-3 text-white shadow-md shadow-indigo-200">
          <CreditCard className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-gray-900">PayLeft</h1>
        <p className="mt-1 mb-6 text-sm font-medium text-gray-500">
          로그인하여 할부 현황을 관리하세요.
        </p>
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
