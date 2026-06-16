# PayLeft — 할부금 관리 대시보드

카드사 앱에서 복사한 할부 납부 목록을 붙여넣으면, 남은 납부 일정과 완납 예정월을 자동으로 계산해주는 개인용 할부금 관리 웹 앱입니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| **카카오 로그인** | OAuth 2.0 기반 소셜 로그인 |
| **텍스트 파싱** | 신한카드 앱 할부 목록 텍스트를 자동 파싱 |
| **대시보드** | 다음달 납부액 / 총 잔여 할부금 / 완납 예정월 요약 |
| **월별 차트** | 월별 납부금 추이 막대 차트 |
| **이자 계산** | 연 이자율 입력 시 실제 납부액(원금+이자) 계산 |
| **저장 이력** | 과거 가져오기 이력 관리 및 시점별 대시보드 조회 |
| **이력 비교** | 두 시점의 할부 현황을 나란히 비교 |
| **내보내기** | PDF / Excel 파일로 다운로드 |

---

## 전체 플로우

### 1. 인증 플로우 (카카오 OAuth 2.0)

```
사용자 → "카카오로 로그인" 클릭
  → GET /auth/kakao
  → 카카오 로그인 페이지 (kauth.kakao.com)
  → 사용자 카카오 계정으로 로그인
  → GET /auth/callback?code=xxx (카카오가 인증 코드 전달)
  → 카카오 서버에서 액세스 토큰 교환
  → 카카오 프로필(닉네임, ID) 조회
  → Supabase에 사용자 생성 or 업데이트
  → 매직 링크 토큰으로 즉시 세션 발급
  → 대시보드(/) 리다이렉트
```

> 카카오 ID(숫자)는 UUID v5 알고리즘으로 Supabase 호환 UUID로 결정론적 변환됩니다.

---

### 2. 데이터 입력 플로우 (/import)

```
신한카드 앱 → "할부납부목록" 전체 복사
  → /import 페이지에 붙여넣기
  → "데이터 파싱하기" 클릭
  → parseInstallmentText() 함수로 텍스트 파싱
  → 파싱 결과를 테이블로 미리보기 (인라인 수정 가능)
  → 이력 제목 입력 후 "전체 저장하기" 클릭
  → POST /api/installments/bulk
      ├─ 기존 할부 데이터 전체 삭제
      ├─ 새 할부 항목들 일괄 생성
      └─ importBatch(이력)에 스냅샷 저장
  → payleft:data-changed 이벤트 발생
  → 대시보드(/) 자동 이동 및 데이터 갱신
```

**파싱 텍스트 형식 (신한카드 기준):**
```
분할납부(쿠팡)
2025.09.11 9/11회차
74,200원
74,200 원
```

---

### 3. 대시보드 플로우 (/)

```
페이지 로드
  → GET /api/installments   (현재 할부 항목 목록)
  → GET /api/history/latest (최신 이력 제목 표시용)
  → getSummaryStats() 계산
      ├─ 각 항목별 납부 스케줄 생성
      ├─ 월별 합계 집계
      ├─ 다음달 납부액 / 총 잔여 / 완납 예정월 계산
      └─ (이자율 > 0이면 원금 + 이자 합산)
  → SummaryCards / MonthlyChart / MonthlyDetailTable / InstallmentList 렌더링
```

---

### 4. 저장 이력 비교 플로우 (/history)

```
저장 이력 목록 표시 (GET /api/history)
  → 항목 최대 2개 체크박스 선택
  → "비교하기" 클릭
  → GET /api/history/:idA, GET /api/history/:idB (병렬 요청)
  → CompareModal에서 두 시점의 통계 비교
      ├─ 다음달 납부액 변화 (증가/감소)
      ├─ 총 잔여 할부금 변화
      ├─ 완납 예정월 변화 (N개월 단축/연장)
      ├─ 전체 건수 변화
      ├─ 완납/제거된 항목 목록
      └─ 신규 추가된 항목 목록
```

---

## 프로젝트 구조

```
PayLeft/
├── prisma/
│   └── schema.prisma          # DB 스키마 (Installment, ImportBatch)
│
└── src/
    ├── app/                   # Next.js App Router (폴더 = URL 경로)
    │   ├── layout.tsx         # 모든 페이지 공통 HTML 틀 (NavTabs 포함)
    │   ├── page.tsx           # 대시보드 (/)
    │   ├── login/
    │   │   └── page.tsx       # 로그인 페이지 (/login)
    │   ├── import/
    │   │   └── page.tsx       # 데이터 입력 (/import)
    │   ├── history/
    │   │   ├── page.tsx       # 저장 이력 목록 (/history)
    │   │   └── [id]/
    │   │       └── page.tsx   # 이력 상세 (/history/:id)
    │   ├── auth/
    │   │   ├── kakao/
    │   │   │   └── route.ts   # 카카오 OAuth 시작 (GET /auth/kakao)
    │   │   └── callback/
    │   │       └── route.ts   # 카카오 OAuth 콜백 (GET /auth/callback)
    │   └── api/
    │       ├── installments/
    │       │   ├── route.ts   # 할부 항목 조회 (GET)
    │       │   └── bulk/
    │       │       └── route.ts # 일괄 교체 (POST)
    │       └── history/
    │           ├── route.ts   # 이력 목록 (GET)
    │           ├── latest/
    │           │   └── route.ts # 최신 이력 (GET)
    │           └── [id]/
    │               └── route.ts # 이력 상세/수정 (GET, PATCH)
    │
    ├── components/            # 재사용 UI 컴포넌트
    │   ├── NavTabs.tsx        # 상단 네비게이션 바
    │   ├── SummaryCards.tsx   # 요약 카드 3개
    │   ├── MonthlyChart.tsx   # 월별 막대 차트 (recharts)
    │   ├── MonthlyDetailTable.tsx # 월별 아코디언 테이블
    │   ├── InstallmentList.tsx # 할부 항목 테이블
    │   ├── EditableTitle.tsx  # 인라인 편집 가능 제목
    │   ├── DashboardToolbar.tsx # 이자율 + 내보내기 툴바
    │   ├── InterestRateControl.tsx # 이자율 토글/입력
    │   ├── ExportMenu.tsx     # PDF/Excel 내보내기 드롭다운
    │   └── CompareModal.tsx   # 이력 비교 모달
    │
    ├── lib/                   # 비즈니스 로직 / 유틸리티
    │   ├── calc.ts            # 할부 계산 핵심 로직 (순수 함수)
    │   ├── parse.ts           # 카드사 텍스트 파싱
    │   ├── format.ts          # 금액/날짜 포맷팅 유틸리티
    │   ├── kakao.ts           # 카카오 ID → UUID 변환 (UUID v5)
    │   ├── prisma.ts          # Prisma 클라이언트 싱글톤
    │   ├── export.ts          # PDF/Excel 내보내기
    │   ├── pdfReport.ts       # PDF 리포트 DOM 생성기
    │   └── supabase/
    │       ├── client.ts      # 브라우저용 Supabase 클라이언트
    │       ├── server.ts      # 서버용 Supabase 클라이언트 (쿠키 기반)
    │       └── admin.ts       # 관리자 Supabase 클라이언트 (서비스 롤)
    │
    └── proxy.ts               # Next.js 미들웨어 (인증 게이트)
```

---

## 데이터베이스 스키마

```prisma
// 현재 활성 할부 항목 (데이터 입력 시 전체 교체)
model Installment {
  id                 Int      // 자동 증가 ID
  userId             String   // Supabase 사용자 UUID
  name               String   // 가맹점명
  payDate            String   // 거래일 (YYYY-MM-DD)
  currentInstallment Int      // 현재 회차
  totalInstallment   Int      // 전체 회차
  amount             Float    // 남은 원금 잔액
  createdAt          DateTime
  updatedAt          DateTime
}

// 가져오기 이력 (스냅샷 보관)
model ImportBatch {
  id        Int      // 자동 증가 ID
  userId    String   // Supabase 사용자 UUID
  title     String   // 이력 제목 (예: "2026년 6월 신한카드")
  itemCount Int      // 항목 수
  items     Json     // 가져온 시점의 할부 항목 스냅샷
  createdAt DateTime
}
```

---

## 기술 스택

### 프레임워크 & 런타임

| 기술 | 버전 | 용도 |
|---|---|---|
| **Next.js** | 16.2.9 | 풀스택 React 프레임워크 (App Router) |
| **React** | 19.2.4 | UI 컴포넌트 라이브러리 |
| **TypeScript** | ^5 | 정적 타입 시스템 |

### 인증 & 백엔드

| 기술 | 버전 | 용도 |
|---|---|---|
| **Supabase** | ^2.108.1 | 인증(Auth), PostgreSQL 호스팅 |
| **@supabase/ssr** | ^0.12.0 | Next.js 서버/브라우저 쿠키 기반 세션 관리 |
| **Prisma** | ^6.19.3 | TypeScript ORM (DB 쿼리 빌더) |
| **PostgreSQL** | — | 관계형 데이터베이스 (Supabase 호스팅) |
| **카카오 OAuth 2.0** | — | 소셜 로그인 (외부 API) |

### UI & 스타일

| 기술 | 버전 | 용도 |
|---|---|---|
| **Tailwind CSS** | ^4 | 유틸리티 기반 CSS 프레임워크 |
| **lucide-react** | ^1.18.0 | SVG 아이콘 라이브러리 |
| **recharts** | ^3.8.1 | React용 차트 라이브러리 (막대 차트) |

### 파일 내보내기

| 기술 | 버전 | 용도 |
|---|---|---|
| **jsPDF** | ^4.2.1 | 브라우저에서 PDF 생성 |
| **html2canvas-pro** | ^2.0.4 | DOM 요소를 캔버스 이미지로 변환 |
| **xlsx** | ^0.18.5 | Excel(.xlsx) 파일 생성 |

---

## Next.js App Router 핵심 개념

이 프로젝트에서 사용된 Next.js 개념들을 간략히 설명합니다.

### 파일 기반 라우팅

```
app/
├── page.tsx          →  /
├── login/page.tsx    →  /login
├── import/page.tsx   →  /import
├── history/page.tsx  →  /history
├── history/[id]/page.tsx  →  /history/:id  (동적 경로)
└── api/installments/route.ts  →  GET /api/installments
```

### Server vs Client 컴포넌트

```
"use client" 없음  →  서버 컴포넌트 (HTML을 서버에서 생성, 빠름)
"use client" 있음  →  클라이언트 컴포넌트 (브라우저에서 실행, 상호작용 가능)
```

- **서버 컴포넌트**: `LoginPage`, `SummaryCards`, `layout.tsx`
- **클라이언트 컴포넌트**: `NavTabs`, `MonthlyChart`, `InstallmentList`, 대부분의 페이지

### 미들웨어 (proxy.ts)

모든 HTTP 요청이 페이지/API에 도달하기 전에 실행됩니다.
로그인 여부를 확인하여 미인증 사용자를 `/login`으로 리다이렉트합니다.

---

## 핵심 계산 로직 (`src/lib/calc.ts`)

### 월 납부액 계산

```
월 납부 원금 = 남은 원금 ÷ 남은 회차 (균등 분할)
              마지막 회차에 나눗셈 나머지 합산

월 이자       = 현재 원금 잔액 × (연 이자율 ÷ 12)

월 납부액     = 월 납부 원금 + 월 이자
```

### 완납 예정월

남은 모든 납부 일정 중 가장 마지막 달 = 완납 예정월

---

## 환경 변수

`.env` 파일에 아래 변수를 설정해야 합니다.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...          # 공개 키 (브라우저 노출 가능)
SUPABASE_SERVICE_ROLE_KEY=eyJh...              # 비밀 키 (서버 전용, 절대 노출 금지)

# 데이터베이스
DATABASE_URL=postgresql://...                  # Prisma 연결 문자열

# 카카오 OAuth
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret   # 선택사항
```

---

## 로컬 개발 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 위의 환경 변수 값 입력

# 3. DB 마이그레이션 (최초 1회)
npx prisma migrate dev

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 카카오 앱 설정

카카오 Developers 콘솔에서 다음을 설정해야 합니다.

1. **플랫폼**: Web, `http://localhost:3000` 등록
2. **카카오 로그인** 활성화
3. **Redirect URI 등록**: `http://localhost:3000/auth/callback`
4. **동의 항목**: 닉네임 수집 활성화

---

## 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

Vercel 배포 시 환경 변수를 Vercel 대시보드에서 설정하고,
카카오 Redirect URI에 프로덕션 도메인을 추가합니다.

---

## 아키텍처 설계 결정

| 결정 | 이유 |
|---|---|
| **할부 데이터를 전체 교체 방식으로 저장** | 카드사 앱 데이터가 이미 최신 상태이므로, 개별 수정보다 전체 교체가 단순하고 정확함 |
| **ImportBatch에 JSON 스냅샷 저장** | 나중에 Installment 테이블이 바뀌어도 과거 이력을 정확히 재현할 수 있음 |
| **카카오 ID를 UUID v5로 변환** | Supabase Auth는 UUID를 요구하고, 동일한 카카오 ID는 항상 동일한 UUID가 되어야 함 |
| **계산 로직을 순수 함수로 분리** | 서버/클라이언트 어디서나 재사용 가능하고, 테스트하기 쉬움 |
| **PDF를 HTML→Canvas→PDF 방식으로 생성** | 한글 폰트 지원이 쉽고, 기존 HTML 스타일을 그대로 활용 가능 |
| **jsPDF/xlsx를 lazy import로 처리** | 내보내기 시에만 로드하여 초기 번들 크기 감소 |
