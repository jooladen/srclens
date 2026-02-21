# Plan: App Router 최적화 + React 19

> 현재 전체 `"use client"` 구조를 App Router 패턴에 맞게 재구성하고 React 19 최신 기능 활용

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 기능명 | AppRouter최적화 |
| 작성일 | 2026-02-21 |
| 현재 스택 | Next.js 16.1.6 / React 19.2.4 / Tailwind v4 |
| 상태 | Plan |

---

## 2. 문제 정의

현재 `app/page.tsx` 상단에 `"use client"` 선언으로 **전체 페이지가 클라이언트 컴포넌트**로 실행 중.

```
현재 구조 (비효율)
────────────────────────────────
app/page.tsx  →  "use client" (전체)
  ├── CodeInput       (클라이언트 필요 O)
  ├── AnalyzeButton   (클라이언트 필요 O)
  ├── ResultPanel     (클라이언트 필요 X → 서버 가능)
  ├── SummaryCard     (클라이언트 필요 X → 서버 가능)
  └── SectionCard     (클라이언트 필요 X → 서버 가능)
```

**목표**: 상호작용이 필요한 컴포넌트만 클라이언트로, 나머지는 서버로 분리

---

## 3. App Router 최적화 원칙

### 3-1. 컴포넌트 분류 기준

| 기준 | Server Component | Client Component |
|------|:---:|:---:|
| 브라우저 이벤트(onClick, onChange) | X | O |
| useState / useEffect 훅 사용 | X | O |
| 브라우저 API (localStorage, window) | X | O |
| 데이터 표시만 (props 렌더링) | O | X |
| 정적 레이아웃 | O | X |

### 3-2. 목표 구조

```
app/
├── layout.tsx          Server Component (메타데이터, 전역 레이아웃)
├── page.tsx            Server Component (정적 껍데기만)
└── _components/
    └── AnalyzerClient.tsx  "use client" (상태 관리 통합)

components/analyzer/
├── CodeInput.tsx       "use client" (onChange, 파일 업로드)
├── AnalyzeButton.tsx   "use client" (onClick)
├── ResultPanel.tsx     Server Component (결과 표시만)
├── SummaryCard.tsx     Server Component (결과 표시만)
└── SectionCard.tsx     Server Component (결과 표시만)
```

---

## 4. React 19 활용 포인트

### 현재 미활용 중인 React 19 기능

| 기능 | 설명 | SrcLens 적용 위치 |
|------|------|------------------|
| `use()` Hook | Promise/Context를 직접 unwrap | 분석 결과 비동기 처리 |
| `useTransition` | UI 블로킹 없는 상태 전환 | 분석 버튼 클릭 시 |
| `useOptimistic` | 낙관적 UI 업데이트 | 분석 즉시 피드백 |
| `ref` as prop | forwardRef 없이 ref 전달 | CodeInput ref 전달 |
| `use client` 경계 최소화 | 번들 사이즈 감소 | 전체 구조 |

### 주요 적용: `useTransition`

```typescript
// Before (React 18 방식)
const [loading, setLoading] = useState(false)
const analyze = () => {
  setLoading(true)
  const res = analyzeCode(code)
  setResult(res)
  setLoading(false)
}

// After (React 19 방식)
const [isPending, startTransition] = useTransition()
const analyze = () => {
  startTransition(() => {
    const res = analyzeCode(code)
    setResult(res)
  })
}
// isPending으로 로딩 상태 자동 처리, UI 블로킹 없음
```

---

## 5. 핵심 변경 사항

### P0 (필수)

| # | 변경 | 설명 |
|---|------|------|
| C1 | page.tsx → Server Component | `"use client"` 제거, 정적 레이아웃만 |
| C2 | AnalyzerClient.tsx 생성 | 상태 관리 전담 클라이언트 컴포넌트 |
| C3 | ResultPanel → Server Component | props만 받아 렌더링, 상호작용 없음 |
| C4 | SummaryCard → Server Component | 동일 |
| C5 | SectionCard → Server Component | 동일 |
| C6 | useTransition 도입 | AnalyzeButton 로딩 상태 개선 |

### P1 (개선)

| # | 변경 | 설명 |
|---|------|------|
| C7 | React 19 ref-as-prop | CodeInput에서 forwardRef 제거 |
| C8 | metadata 강화 | layout.tsx OpenGraph, viewport 추가 |

---

## 6. 기대 효과

| 항목 | 전 | 후 |
|------|---|---|
| 클라이언트 번들 | 전체 페이지 | CodeInput + AnalyzeButton만 |
| 초기 로드 | 클라이언트 hydration 전체 | 서버 렌더링 + 부분 hydration |
| React 버전 활용도 | React 19 설치만 | React 19 기능 실제 사용 |
| 코드 구조 | 모놀리식 클라이언트 | 명확한 서버/클라이언트 경계 |

---

## 7. 변경 없는 항목 (범위 외)

- `lib/analyzer.ts` — 로직 변경 없음
- `types/analysis.ts` — 타입 변경 없음
- Tailwind v4 CSS — 변경 없음
- UI 디자인 — 변경 없음 (기능적 리팩토링만)

---

## 8. 다음 단계

- [ ] Design 문서 작성 (`/pdca design AppRouter최적화`)
- [ ] 컴포넌트 분리 구현
- [ ] 빌드 검증
