/**
 * prisma.ts — Prisma 데이터베이스 클라이언트 싱글톤
 *
 * Prisma는 TypeScript로 DB를 조작할 수 있게 해주는 ORM(Object-Relational Mapping) 라이브러리입니다.
 * SQL을 직접 쓰지 않고 `prisma.installment.findMany()` 같은 방식으로 DB에 접근합니다.
 *
 * [왜 글로벌 싱글톤을 사용하나요?]
 * Next.js 개발 서버는 파일 변경 시 코드를 핫 리로드(hot reload)합니다.
 * 이때 매번 새 PrismaClient를 생성하면 DB 연결이 누적되어 "too many connections" 오류가 발생합니다.
 * globalThis에 인스턴스를 저장해두면 핫 리로드 후에도 기존 연결을 재사용합니다.
 * 프로덕션 환경에서는 서버가 재시작되지 않으므로 globalThis 저장이 불필요합니다.
 */

import { PrismaClient } from "@prisma/client";

// globalThis: 서버 재시작 없이 모듈이 다시 로드되어도 살아있는 전역 객체
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 개발 중에는 경고/에러를 콘솔에 출력하고, 프로덕션에서는 에러만 출력합니다
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// 개발 환경에서만 글로벌에 저장 (프로덕션은 한 번 생성 후 계속 사용)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
