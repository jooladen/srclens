# Design: function-pair-highlight

**Feature**: 소스창 함수/블록 짝 라인 표시
**Version**: v0.6.0
**Created**: 2026-02-21
**Status**: Design

---

## 1. 컴포넌트 설계

### 변경 파일 요약

```
lib/analyzer.ts                         ← findMatchingBracket() 추가 (export)
components/analyzer/LearnMode.tsx       ← 짝 표시 UI + 스크롤 로직 추가
CLAUDE.md                               ← 버전 히스토리 업데이트
```

---

## 2. lib/analyzer.ts — findMatchingBracket

### 시그니처

```ts
export function findMatchingBracket(
  lines: string[],
  lineIndex: number  // 0-based
): { matchLine: number; direction: "down" | "up" } | null
```

### 알고리즘

**판단 기준 (해당 줄 분류)**:

```
줄에서 문자열/주석을 제거한 후
  unmatched_open  = '{' 개수 - '}' 개수

  unmatched_open > 0  → 케이스 A: 아래로 스캔 (짝 } 찾기)
  unmatched_open < 0  → 케이스 B: 위로 스캔   (짝 { 찾기)
  unmatched_open == 0 → null 반환 (self-contained 또는 일반 코드)
```

**문자열/주석 제거 전처리 (`stripStringsAndComments`)**:

```
처리 순서:
1. 한 줄 주석 제거: // 부터 끝까지
2. 문자열 제거: "...", '...', `...` (이스케이프 \' \" 처리)
→ 중괄호만 안전하게 추출
```

**케이스 A — 아래로 스캔**:

```
depth = unmatched_open (현재 줄의 열린 중괄호 수)
for i = lineIndex+1 ~ lines.length-1:
  line = stripStringsAndComments(lines[i])
  depth += countChar(line, '{') - countChar(line, '}')
  if depth <= 0:
    return { matchLine: i, direction: "down" }
return null
```

**케이스 B — 위로 스캔**:

```
depth = abs(unmatched_open)  (현재 줄의 닫힌 중괄호 초과 수)
for i = lineIndex-1 ~ 0:
  line = stripStringsAndComments(lines[i])
  depth += countChar(line, '}') - countChar(line, '{')
  if depth <= 0:
    return { matchLine: i, direction: "up" }
return null
```

### 엣지 케이스

| 상황 | 처리 |
|------|------|
| `const x = { a: 1 }` | unmatched=0 → null |
| `interface Foo {` | A케이스 → 정상 탐지 |
| `// { fake brace` | 주석 제거 → 무시 |
| `const s = "{"` | 문자열 제거 → 무시 |
| 짝 없음 (파일 끝/시작 초과) | null |

---

## 3. LearnMode.tsx — UI 설계

### 상태 추가

```ts
const lines = code.split("\n");
// 기존
const [selectedLine, setSelectedLine] = useState<number | null>(null);
// 추가
const [highlightLine, setHighlightLine] = useState<number | null>(null);
// 스크롤 대상 ref
const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
```

### 짝 정보 계산 (렌더 시점)

```ts
// selectedLine이 있을 때만 계산
const matchInfo = selectedLine !== null
  ? findMatchingBracket(lines, selectedLine - 1)  // 1-based → 0-based
  : null;
// matchInfo: { matchLine: number(0-based), direction: "down"|"up" } | null
```

### 설명 패널 UI (기존 + 추가)

```tsx
{isSelected && explanation && (
  <div className="mx-2 mb-1 ...">
    {/* 기존: 설명 텍스트 */}
    <span className="shrink-0 mt-0.5">💡</span>
    <span>{explanation}</span>

    {/* 추가: 짝 정보 줄 */}
    {matchInfo && (
      <button
        onClick={() => scrollToMatch(matchInfo.matchLine)}
        className="mt-1 flex items-center gap-1 text-cyan-400 hover:text-cyan-200
                   text-xs transition-colors underline-offset-2 hover:underline"
      >
        <span>{matchInfo.direction === "down" ? "↓" : "↑"}</span>
        <span>
          이 블록은 <strong>{matchInfo.matchLine + 1}번 줄</strong>에서{" "}
          {matchInfo.direction === "down" ? "닫힙니다" : "열렸습니다"}
        </span>
        <span className="text-gray-500 text-[10px]">[이동]</span>
      </button>
    )}
  </div>
)}
```

### 짝 줄 하이라이트 스타일

```tsx
// 각 줄 button의 className에 추가:
${highlightLine === lineNum ? "bg-cyan-950/40 ring-1 ring-cyan-700/50" : ""}
```

### scrollToMatch 함수

```ts
const scrollToMatch = (targetIndex: number) => {  // 0-based
  const targetLineNum = targetIndex + 1;  // 1-based
  setHighlightLine(targetLineNum);
  lineRefs.current[targetIndex]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  // 1.5초 후 하이라이트 제거
  setTimeout(() => setHighlightLine(null), 1500);
};
```

---

## 4. 렌더링 흐름

```
사용자 클릭 (N번 줄)
  └→ setSelectedLine(N)
  └→ matchInfo = findMatchingBracket(lines, N-1)

  설명 박스 렌더:
    ├─ 💡 explainLine 설명
    └─ (matchInfo 있으면) ↓/↑ M번 줄에서 닫힘/열림 [이동]

사용자가 [이동] 클릭
  └→ scrollToMatch(matchInfo.matchLine)
       ├─ setHighlightLine(matchInfo.matchLine + 1)
       ├─ lineRefs[matchInfo.matchLine].scrollIntoView(smooth)
       └─ 1.5초 후 setHighlightLine(null)
```

---

## 5. 구현 순서

1. `lib/analyzer.ts` — `stripStringsAndComments` 헬퍼 + `findMatchingBracket` 추가 (export)
2. `components/analyzer/LearnMode.tsx` — `findMatchingBracket` import + 상태/ref 추가 + UI 수정
3. `CLAUDE.md` — 버전 히스토리 업데이트
4. `npm run build` 빌드 확인

---

## 6. 검증 시나리오

| 입력 코드 | 클릭 줄 | 기대 결과 |
|-----------|---------|----------|
| `export default function Foo() {` | 해당 줄 | "↓ N번 줄에서 닫힙니다" |
| `const handler = () => {` | 해당 줄 | "↓ N번 줄에서 닫힙니다" |
| `if (cond) {` | 해당 줄 | "↓ N번 줄에서 닫힙니다" |
| 단독 `}` 줄 | 해당 줄 | "↑ N번 줄에서 열렸습니다" |
| `const x = { a: 1 }` | 해당 줄 | 짝 표시 없음 (기존 설명만) |
| `// { comment` | 해당 줄 | 짝 표시 없음 |
