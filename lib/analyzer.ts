import type { AnalysisResult, AnalysisSection, AnalysisStats, CodeScore, Suggestion, TreeNode } from "@/types/analysis";

// ─── Import 설명 사전 ─────────────────────────────────────────────
const IMPORT_MAP: Record<string, string> = {
  react: "React 핵심 라이브러리 (필수)",
  "react-dom": "React를 브라우저 DOM에 연결하는 라이브러리",
  "next/navigation": "페이지 이동 기능 모음 (useRouter, redirect 등)",
  "next/link": "페이지 간 이동 링크 컴포넌트",
  "next/image": "이미지 자동 최적화 컴포넌트",
  "next/font/google": "Google 폰트 최적화 로더",
  "next/headers": "서버에서 HTTP 헤더/쿠키를 읽는 함수",
  "next/cache": "서버 캐시 제어 함수 (revalidatePath 등)",
  "next/server": "미들웨어 및 서버 유틸리티",
  "server-only": "이 파일이 서버에서만 실행됨을 보장",
  "client-only": "이 파일이 클라이언트에서만 실행됨을 보장",
};

// ─── Hook 설명 사전 ────────────────────────────────────────────────
const HOOK_MAP: Record<string, string> = {
  useState:
    "화면에 보여줄 데이터를 저장하는 상자. 값이 바뀌면 화면이 자동으로 다시 그려진다.",
  useEffect:
    "화면이 열릴 때, 또는 특정 값이 바뀔 때 자동으로 실행되는 코드 블록.",
  useRef:
    "DOM 요소를 직접 가리키거나, 화면을 다시 그리지 않고 값을 보관할 때 사용.",
  useCallback:
    "함수를 메모리에 저장해, 매 렌더링마다 함수가 새로 만들어지는 것을 방지.",
  useMemo:
    "계산 결과를 메모리에 저장해, 같은 값이면 재계산하지 않고 저장된 값을 사용.",
  useContext:
    "Context로 공유된 전역 값을 가져온다. props 없이 깊은 컴포넌트에 값 전달 가능.",
  useReducer:
    "복잡한 상태 변경 로직을 action/reducer 패턴으로 관리. useState의 고급 버전.",
  useRouter:
    "코드로 페이지를 이동하거나 URL을 조작할 때 사용. (next/navigation)",
  usePathname: "현재 URL 경로('/about' 등)를 읽는다. (next/navigation)",
  useSearchParams:
    "URL의 쿼리 파라미터(?key=value)를 읽는다. (next/navigation)",
  useParams: "URL의 동적 경로([id] 등)에서 파라미터 값을 읽는다.",
  useFormStatus: "부모 form의 제출 상태(pending 여부)를 읽는다.",
  useFormState: "서버 액션(Server Action)의 반환값과 상태를 관리.",
  useTransition:
    "상태 업데이트를 '전환(transition)'으로 표시해 UI 블로킹을 방지.",
  useDeferredValue: "값의 업데이트를 지연시켜 급하지 않은 렌더링을 후순위로 처리.",
  useId: "서버·클라이언트 간 일치하는 고유 ID를 생성. 접근성(aria) 속성에 활용.",
  useLayoutEffect:
    "useEffect와 유사하나, DOM 업데이트 직후(페인트 전)에 동기적으로 실행.",
  useInsertionEffect: "CSS-in-JS 라이브러리가 스타일을 DOM에 삽입할 때 사용.",
  useSyncExternalStore: "외부 스토어(Redux 등)를 React 렌더링과 동기화.",
  useImperativeHandle:
    "forwardRef와 함께 사용. 부모가 접근할 수 있는 ref 핸들을 커스터마이징.",
  useDebugValue: "React DevTools에서 커스텀 훅의 이름/값을 표시.",
};

// ─── JSX 태그 설명 사전 ────────────────────────────────────────────
const JSX_TAG_MAP: Record<string, string> = {
  div: "영역을 묶는 기본 박스",
  span: "텍스트 일부를 묶는 인라인 박스",
  p: "문단 텍스트",
  h1: "가장 큰 제목",
  h2: "두 번째 큰 제목",
  h3: "세 번째 제목",
  h4: "네 번째 제목",
  ul: "순서 없는 목록",
  ol: "순서 있는 목록",
  li: "목록 항목",
  a: "외부/내부 링크",
  button: "클릭 가능한 버튼",
  input: "텍스트·체크박스 등 입력 필드",
  form: "데이터 입력 양식",
  label: "입력 필드의 설명 텍스트",
  img: "이미지",
  table: "표",
  thead: "표 헤더 영역",
  tbody: "표 본문 영역",
  tr: "표의 행",
  th: "표의 헤더 셀",
  td: "표의 데이터 셀",
  section: "페이지의 독립적인 구획",
  article: "독립적인 콘텐츠 블록 (블로그 글 등)",
  header: "페이지 또는 섹션의 상단 영역",
  footer: "페이지 또는 섹션의 하단 영역",
  nav: "내비게이션 링크 모음",
  main: "페이지의 핵심 콘텐츠 영역",
  aside: "본문과 관련 있는 보조 콘텐츠",
  textarea: "여러 줄 텍스트 입력창",
  select: "드롭다운 선택 목록",
  option: "드롭다운의 선택 항목",
  dialog: "팝업 다이얼로그 창",
  details: "접었다 펼칠 수 있는 상세 내용",
  summary: "details의 제목(클릭으로 펼침)",
  strong: "굵게 강조된 텍스트",
  em: "기울임으로 강조된 텍스트",
  code: "코드 형태로 표시되는 텍스트",
  pre: "공백·줄바꿈을 그대로 유지하는 텍스트 블록",
};

// ─── 파서 ──────────────────────────────────────────────────────────
function extractImports(code: string) {
  const lines = code.split("\n");
  const results: { code: string; from: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^import\s+.+\s+from\s+['"](.+)['"]/);
    if (m) results.push({ code: line.trim(), from: m[1] });
  }
  return results;
}

function extractHooks(code: string) {
  const found: { name: string; line: string }[] = [];
  const seen = new Set<string>();
  // 변수 선언에서 훅 추출: const [x, setX] = useState(...) 또는 const x = useRouter()
  const hookLineRegex = /\b(use[A-Z]\w*)\s*[(<(]/g;
  let m: RegExpExecArray | null;
  while ((m = hookLineRegex.exec(code)) !== null) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      // 해당 훅이 포함된 줄 추출
      const lineStart = code.lastIndexOf("\n", m.index) + 1;
      const lineEnd = code.indexOf("\n", m.index);
      const line = code.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
      found.push({ name, line });
    }
  }
  return found;
}

function extractComponentName(code: string): string {
  const patterns = [
    /export\s+default\s+(?:async\s+)?function\s+(\w+)/,
    /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[\w<>,\s]+\s*)?=>/,
    /function\s+(\w+)\s*\([^)]*\)/,
  ];
  for (const p of patterns) {
    const m = code.match(p);
    if (m?.[1] && m[1] !== "async") return m[1];
  }
  return "Page";
}

function extractProps(code: string, componentName: string): string[] {
  const patterns = [
    new RegExp(`function\\s+${componentName}\\s*\\(\\s*\\{([^}]+)\\}`),
    new RegExp(`${componentName}\\s*=\\s*(?:async\\s*)?\\(\\s*\\{([^}]+)\\}`),
    /export\s+default\s+(?:async\s+)?function\s+\w+\s*\(\s*\{([^}]+)\}/,
  ];
  for (const p of patterns) {
    const m = code.match(p);
    if (m?.[1]) {
      return m[1]
        .split(",")
        .map((s) => s.replace(/[:\s=\w<>[\]|?]+$/g, "").trim())
        .filter(Boolean);
    }
  }
  return [];
}

function extractTopLevelJSX(code: string): string[] {
  // return 이후 첫 번째 JSX 태그들 추출
  const returnMatch = code.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*[;}]/);
  if (!returnMatch) return [];
  const jsx = returnMatch[1];
  const tags: string[] = [];
  const tagRegex = /<([A-Za-z][A-Za-z0-9.]*)/g;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = tagRegex.exec(jsx)) !== null) {
    const tag = m[1];
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
    if (tags.length >= 8) break;
  }
  return tags;
}

function explainImport(from: string, code: string): string {
  // 정확히 매핑된 경우
  if (IMPORT_MAP[from]) return IMPORT_MAP[from];

  // import type 여부 감지
  const isTypeOnly = code.trimStart().startsWith("import type");

  // 파일명 추출 (경로의 마지막 세그먼트)
  const fileName = from.split("/").pop() ?? from;
  const fileNameLower = fileName.toLowerCase();

  // @/ 또는 ./ 상대경로 — 파일명으로 설명
  if (from.startsWith("@/") || from.startsWith("./") || from.startsWith("../")) {
    if (isTypeOnly) return `TypeScript 타입만 가져옴 (런타임에 영향 없음)`;

    // lib/ 경로 — 유틸 함수
    if (from.includes("/lib/") || from.includes("/utils/") || from.includes("/helpers/")) {
      if (fileNameLower.includes("parser")) return `'${fileName}' — 코드/텍스트를 분석하는 파서 함수`;
      if (fileNameLower.includes("extract")) return `'${fileName}' — 데이터를 추출하는 함수`;
      if (fileNameLower.includes("differ") || fileNameLower.includes("diff")) return `'${fileName}' — 두 값의 차이를 비교하는 함수`;
      if (fileNameLower.includes("format")) return `'${fileName}' — 데이터를 원하는 형식으로 변환하는 함수`;
      if (fileNameLower.includes("valid")) return `'${fileName}' — 값의 유효성을 검사하는 함수`;
      if (fileNameLower.includes("calc") || fileNameLower.includes("calculate")) return `'${fileName}' — 값을 계산하는 함수`;
      if (fileNameLower.includes("fetch") || fileNameLower.includes("api")) return `'${fileName}' — 서버/API 요청 함수`;
      if (fileNameLower.includes("auth")) return `'${fileName}' — 인증 관련 유틸 함수`;
      if (fileNameLower.includes("storage") || fileNameLower.includes("cache")) return `'${fileName}' — 데이터 저장/캐시 유틸 함수`;
      return `'${fileName}' — 유틸리티/헬퍼 함수 모음`;
    }

    // hooks/ 경로 — 커스텀 훅
    if (from.includes("/hooks/")) {
      return `'${fileName}' — 여러 컴포넌트에서 재사용하는 커스텀 훅`;
    }

    // store/ 경로 — 전역 상태
    if (from.includes("/store") || from.includes("/stores/") || fileNameLower.includes("store")) {
      return `'${fileName}' — 전역 상태 저장소 (여러 컴포넌트가 공유하는 데이터)`;
    }

    // types/ 경로 — 타입 정의
    if (from.includes("/types") || fileNameLower.includes("type") || fileNameLower.includes("interface")) {
      return `'${fileName}' — TypeScript 타입/인터페이스 정의`;
    }

    // constants/ 경로 — 상수
    if (from.includes("/constants") || fileNameLower.includes("constant") || fileNameLower.includes("config")) {
      return `'${fileName}' — 프로젝트 전체에서 사용하는 상수/설정값`;
    }

    // context/ 경로 — Context
    if (from.includes("/context") || fileNameLower.includes("context") || fileNameLower.includes("provider")) {
      return `'${fileName}' — React Context (전역 상태를 컴포넌트 트리에 공유)`;
    }

    // components/ 경로 — 컴포넌트 이름으로 설명
    if (from.includes("/components/") || from.includes("/ui/")) {
      if (fileNameLower.includes("button")) return `'${fileName}' — 클릭 가능한 버튼 컴포넌트`;
      if (fileNameLower.includes("input")) return `'${fileName}' — 텍스트 입력 컴포넌트`;
      if (fileNameLower.includes("modal") || fileNameLower.includes("dialog")) return `'${fileName}' — 팝업 모달/다이얼로그 컴포넌트`;
      if (fileNameLower.includes("toast") || fileNameLower.includes("alert") || fileNameLower.includes("notification")) return `'${fileName}' — 알림 메시지 컴포넌트`;
      if (fileNameLower.includes("upload") || fileNameLower.includes("dropzone") || fileNameLower.includes("filepicker")) return `'${fileName}' — 파일 업로드 컴포넌트`;
      if (fileNameLower.includes("table") || fileNameLower.includes("grid") || fileNameLower.includes("datagrid")) return `'${fileName}' — 표/그리드 컴포넌트`;
      if (fileNameLower.includes("list")) return `'${fileName}' — 목록을 표시하는 컴포넌트`;
      if (fileNameLower.includes("card")) return `'${fileName}' — 카드 형태의 UI 컴포넌트`;
      if (fileNameLower.includes("nav") || fileNameLower.includes("menu") || fileNameLower.includes("sidebar")) return `'${fileName}' — 내비게이션/메뉴 컴포넌트`;
      if (fileNameLower.includes("header")) return `'${fileName}' — 페이지 상단 헤더 컴포넌트`;
      if (fileNameLower.includes("footer")) return `'${fileName}' — 페이지 하단 푸터 컴포넌트`;
      if (fileNameLower.includes("layout") || fileNameLower.includes("split") || fileNameLower.includes("panel")) return `'${fileName}' — 화면 배치/레이아웃 컴포넌트`;
      if (fileNameLower.includes("loading") || fileNameLower.includes("spinner") || fileNameLower.includes("skeleton")) return `'${fileName}' — 로딩 중 표시 컴포넌트`;
      if (fileNameLower.includes("icon")) return `'${fileName}' — 아이콘 컴포넌트`;
      if (fileNameLower.includes("chart") || fileNameLower.includes("graph")) return `'${fileName}' — 차트/그래프 컴포넌트`;
      if (fileNameLower.includes("form")) return `'${fileName}' — 입력 폼 컴포넌트`;
      if (fileNameLower.includes("image") || fileNameLower.includes("avatar") || fileNameLower.includes("thumbnail")) return `'${fileName}' — 이미지/아바타 컴포넌트`;
      if (fileNameLower.includes("badge") || fileNameLower.includes("tag") || fileNameLower.includes("chip")) return `'${fileName}' — 배지/태그 컴포넌트`;
      if (fileNameLower.includes("toggle") || fileNameLower.includes("switch") || fileNameLower.includes("theme")) return `'${fileName}' — 토글/스위치 컴포넌트`;
      if (fileNameLower.includes("search")) return `'${fileName}' — 검색 UI 컴포넌트`;
      if (fileNameLower.includes("stat") || fileNameLower.includes("metrics") || fileNameLower.includes("dashboard")) return `'${fileName}' — 통계/지표 표시 컴포넌트`;
      if (fileNameLower.includes("progress") || fileNameLower.includes("bar")) return `'${fileName}' — 진행률 표시 컴포넌트`;
      if (fileNameLower.includes("select") || fileNameLower.includes("dropdown")) return `'${fileName}' — 드롭다운 선택 컴포넌트`;
      if (fileNameLower.includes("text") || fileNameLower.includes("label") || fileNameLower.includes("typo")) return `'${fileName}' — 텍스트/타이포그래피 컴포넌트`;
      if (fileNameLower.includes("error") || fileNameLower.includes("empty") || fileNameLower.includes("fallback")) return `'${fileName}' — 에러/빈 상태 표시 컴포넌트`;
      // 일반 컴포넌트
      return `'${fileName}' — 직접 만든 UI 컴포넌트`;
    }

    // 기타 내부 파일
    const folder = from.split("/").slice(-2, -1)[0] ?? "";
    return folder ? `'${fileName}' — ${folder}/ 폴더의 내부 모듈` : `'${fileName}' — 프로젝트 내부 모듈`;
  }

  // 외부 패키지 — 이름으로 추론
  if (from.includes("next/")) return "Next.js 내장 기능";
  if (from.includes("react")) return "React 관련 라이브러리";
  const named = code.match(/import\s+\{([^}]+)\}/)?.[1];
  if (named?.includes("Icon") || from.includes("icon")) return "아이콘 라이브러리";
  if (from.includes("zustand") || from.includes("redux") || from.includes("jotai") || from.includes("recoil")) return "전역 상태 관리 라이브러리";
  if (from.includes("axios") || from.includes("swr") || from.includes("react-query") || from.includes("tanstack")) return "서버 데이터 요청/캐싱 라이브러리";
  if (from.includes("zod") || from.includes("yup") || from.includes("joi")) return "데이터 유효성 검사 라이브러리";
  if (from.includes("date") || from.includes("dayjs") || from.includes("moment")) return "날짜/시간 처리 라이브러리";
  if (from.includes("motion") || from.includes("anime") || from.includes("gsap")) return "애니메이션 라이브러리";
  if (from.includes("socket") || from.includes("ws")) return "실시간 웹소켓 통신 라이브러리";
  if (from.includes("i18n") || from.includes("intl")) return "다국어(번역) 처리 라이브러리";
  if (from.includes("prisma") || from.includes("drizzle") || from.includes("mongoose")) return "데이터베이스 ORM 라이브러리";
  if (from.includes("stripe") || from.includes("payment")) return "결제 처리 라이브러리";
  return `외부 패키지 (${from})`;
}

function explainHook(name: string): string {
  return HOOK_MAP[name] ?? `커스텀 훅 — ${name.replace("use", "")} 관련 로직을 재사용 가능하게 묶은 함수.`;
}

function generateSummary(
  componentName: string,
  isClient: boolean,
  isAsync: boolean,
  hooks: { name: string }[],
  imports: { from: string }[],
  props: string[]
): string {
  const parts: string[] = [];

  // 컴포넌트 유형
  if (isClient) {
    parts.push(`'${componentName}'는 클라이언트 컴포넌트입니다.`);
  } else if (isAsync) {
    parts.push(`'${componentName}'는 서버에서 데이터를 직접 가져오는 서버 컴포넌트입니다.`);
  } else {
    parts.push(`'${componentName}'는 정적인 화면을 보여주는 서버 컴포넌트입니다.`);
  }

  // 훅 특징
  const hookNames = hooks.map((h) => h.name);
  if (hookNames.includes("useState") && hookNames.includes("useEffect")) {
    parts.push("사용자 입력을 저장하고 데이터를 가져오는 기능을 갖추고 있습니다.");
  } else if (hookNames.includes("useState")) {
    parts.push("사용자 상호작용에 따라 화면이 바뀌는 기능이 있습니다.");
  } else if (hookNames.includes("useEffect")) {
    parts.push("화면이 열릴 때 자동으로 실행되는 초기화 로직이 포함되어 있습니다.");
  }

  // props
  if (props.length > 0) {
    parts.push(`부모 컴포넌트로부터 ${props.join(", ")} 값을 전달받습니다.`);
  }

  return parts.join(" ");
}

// ─── 점수 계산 ──────────────────────────────────────────────────────
function calculateScore(
  hooks: { name: string }[],
  imports: { from: string }[],
  isClient: boolean
): CodeScore {
  let score = 100;
  const hookNames = hooks.map((h) => h.name);

  // 감점 요소
  if (imports.length > 8) score -= 10;
  if (imports.length > 12) score -= 10;
  if (hooks.length > 5) score -= 10;
  if (hookNames.includes("useReducer")) score -= 5;
  if (hookNames.includes("useMemo")) score -= 5;
  if (hookNames.includes("useCallback")) score -= 5;
  if (hookNames.includes("useImperativeHandle")) score -= 10;
  if (isClient && hooks.length === 0) score -= 5; // use client인데 훅 없음
  if (hookNames.filter((n) => n === "useEffect").length > 1) score -= 5;

  // 가산 요소
  if (!isClient && hooks.length === 0) score = Math.min(100, score + 5);
  if (imports.length <= 2) score = Math.min(100, score + 5);

  score = Math.max(0, Math.min(100, score));

  const grade =
    score >= 90 ? "완벽" : score >= 70 ? "좋음" : score >= 50 ? "보통" : "개선필요";
  const gradeEmoji =
    score >= 90 ? "🏆" : score >= 70 ? "👍" : score >= 50 ? "😊" : "💪";
  const complexity =
    hooks.length + imports.length <= 4
      ? "낮음"
      : hooks.length + imports.length <= 8
      ? "보통"
      : "높음";
  const beginnerFriendly =
    !hookNames.some((n) => ["useReducer", "useMemo", "useCallback", "useImperativeHandle"].includes(n)) &&
    hooks.length <= 3
      ? "높음"
      : hooks.length <= 5
      ? "보통"
      : "낮음";

  const complexHooksList = ["useReducer", "useMemo", "useCallback", "useImperativeHandle"];
  const complexHookCount = hookNames.filter((n) => complexHooksList.includes(n)).length;
  const level: "초급" | "중급" | "고급" =
    complexHookCount >= 2 || hooks.length > 5 || imports.length > 10
      ? "고급"
      : complexHookCount >= 1 || hooks.length > 2 || imports.length > 5
      ? "중급"
      : "초급";

  return { score, grade, gradeEmoji, complexity, beginnerFriendly, level };
}

// ─── 개선 제안 ──────────────────────────────────────────────────────
function generateSuggestions(
  hooks: { name: string }[],
  isClient: boolean,
  code: string
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const hookNames = hooks.map((h) => h.name);

  if (isClient && hooks.length === 0) {
    suggestions.push({
      icon: "💡",
      title: "'use client' 제거 가능",
      description: "훅을 사용하지 않는다면 서버 컴포넌트로 바꿀 수 있어요. 더 빠른 페이지 로드!",
      level: "tip",
      beforeCode: `'use client'\n\nexport default function MyComponent() {\n  return <div>내용</div>\n}`,
      afterCode: `// 'use client' 제거 → 서버 컴포넌트\nexport default function MyComponent() {\n  return <div>내용</div>\n}`,
    });
  }

  const useStateCount = hookNames.filter((n) => n === "useState").length;
  if (useStateCount >= 3) {
    suggestions.push({
      icon: "⚡",
      title: "useState가 많아요",
      description: `useState가 ${useStateCount}개네요. useReducer로 묶으면 코드가 훨씬 깔끔해져요.`,
      level: "tip",
      beforeCode: `const [name, setName] = useState('')\nconst [age, setAge] = useState(0)\nconst [email, setEmail] = useState('')`,
      afterCode: `const [form, dispatch] = useReducer(formReducer, {\n  name: '',\n  age: 0,\n  email: ''\n})`,
    });
  }

  if (hookNames.includes("useEffect") && code.includes("fetch(")) {
    suggestions.push({
      icon: "🚀",
      title: "데이터 요청 최적화",
      description: "useEffect + fetch 조합은 SWR이나 React Query로 바꾸면 3줄로 줄어들고, 캐싱도 자동이에요!",
      level: "tip",
      beforeCode: `useEffect(() => {\n  fetch('/api/data')\n    .then(res => res.json())\n    .then(data => setData(data))\n}, [])`,
      afterCode: `import useSWR from 'swr'\n\n// 컴포넌트 안에서\nconst { data } = useSWR('/api/data', fetcher)`,
    });
  }

  if (!hookNames.includes("useCallback") && hookNames.includes("useState") && code.includes("onClick")) {
    suggestions.push({
      icon: "📝",
      title: "함수 최적화 팁",
      description: "자식 컴포넌트에 함수를 props로 넘긴다면 useCallback으로 감싸보세요.",
      level: "info",
      beforeCode: `// 렌더링마다 새 함수가 생성됨\nconst handleClick = () => {\n  doSomething()\n}\n\n<Child onClick={handleClick} />`,
      afterCode: `// 의존값이 바뀔 때만 새 함수 생성\nconst handleClick = useCallback(() => {\n  doSomething()\n}, [deps])\n\n<Child onClick={handleClick} />`,
    });
  }

  if (hookNames.includes("useEffect") && !code.includes("return ()")) {
    suggestions.push({
      icon: "🧹",
      title: "useEffect 정리(cleanup) 확인",
      description: "이벤트 리스너나 타이머를 쓴다면 return () => {} 로 정리해줘야 메모리 누수가 없어요.",
      level: "warning",
      beforeCode: `useEffect(() => {\n  window.addEventListener('resize', handler)\n}, [])`,
      afterCode: `useEffect(() => {\n  window.addEventListener('resize', handler)\n  return () => {\n    // 컴포넌트가 사라질 때 정리\n    window.removeEventListener('resize', handler)\n  }\n}, [])`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: "✨",
      title: "잘 작성된 코드예요!",
      description: "특별한 개선점이 없어요. 이 패턴을 유지하세요.",
      level: "info",
    });
  }

  return suggestions;
}

// ─── 컴포넌트 트리 파서 ───────────────────────────────────────────
function extractReturnJSX(code: string): string {
  const returnMatch = code.match(/\breturn\s*\(/);
  if (!returnMatch || returnMatch.index === undefined) {
    const simpleMatch = code.match(/\breturn\s+(<)/);
    if (!simpleMatch || simpleMatch.index === undefined) return "";
    return code.slice(simpleMatch.index + simpleMatch[0].length - 1);
  }
  const start = returnMatch.index + returnMatch[0].length;
  let depth = 1;
  let i = start;
  while (i < code.length && depth > 0) {
    if (code[i] === "(") depth++;
    else if (code[i] === ")") depth--;
    i++;
  }
  return code.slice(start, i - 1);
}

function buildJSXTree(code: string, rootName: string): TreeNode {
  const root: TreeNode = { tag: rootName, isComponent: true, children: [] };
  const jsx = extractReturnJSX(code);
  if (!jsx) return root;

  const stack: TreeNode[] = [root];
  let pos = 0;
  const MAX_DEPTH = 4;
  const MAX_CHILDREN = 8;

  while (pos < jsx.length) {
    const ltPos = jsx.indexOf("<", pos);
    if (ltPos === -1) break;

    if (jsx[ltPos + 1] === "/") {
      // Closing tag </Tag> or </>
      const gtPos = jsx.indexOf(">", ltPos);
      if (gtPos === -1) break;
      if (jsx[ltPos + 2] === ">") {
        if (stack.length > 1 && stack[stack.length - 1].tag === "Fragment") stack.pop();
      } else {
        const tagName = jsx.slice(ltPos + 2, gtPos).trim().split(/\s/)[0];
        if (stack.length > 1 && stack[stack.length - 1].tag === tagName) stack.pop();
      }
      pos = gtPos + 1;
    } else if (jsx[ltPos + 1] === ">") {
      // Fragment <>
      const fragNode: TreeNode = { tag: "Fragment", isComponent: false, children: [] };
      if (stack.length <= MAX_DEPTH) {
        const parent = stack[stack.length - 1];
        if (parent.children.length < MAX_CHILDREN) parent.children.push(fragNode);
        stack.push(fragNode);
      }
      pos = ltPos + 2;
    } else {
      // Opening or self-closing tag — find > while tracking {}
      let depth = 0;
      let gtPos = -1;
      for (let i = ltPos + 1; i < jsx.length; i++) {
        if (jsx[i] === "{") depth++;
        else if (jsx[i] === "}") depth--;
        else if (jsx[i] === ">" && depth === 0) { gtPos = i; break; }
      }
      if (gtPos === -1) break;

      const tagContent = jsx.slice(ltPos + 1, gtPos);
      const tagNameMatch = tagContent.match(/^([A-Za-z][A-Za-z0-9.]*)/);
      if (!tagNameMatch) { pos = gtPos + 1; continue; }

      const tagName = tagNameMatch[1];
      const isSelfClosing = jsx[gtPos - 1] === "/";
      const newNode: TreeNode = { tag: tagName, isComponent: /^[A-Z]/.test(tagName), children: [] };

      if (stack.length <= MAX_DEPTH) {
        const parent = stack[stack.length - 1];
        if (parent.children.length < MAX_CHILDREN) parent.children.push(newNode);
        if (!isSelfClosing) stack.push(newNode);
      }
      pos = gtPos + 1;
    }
  }

  return root;
}

// ─── 줄별 설명 (학습 모드) ─────────────────────────────────────────
export function explainLine(line: string): string {
  const t = line.trim();

  if (!t) return "";

  // ── 주석 ──────────────────────────────────────────────────────────
  if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") || t.startsWith("*/")) {
    return "주석 — 실행되지 않는 메모입니다. 코드에 설명을 남길 때 사용합니다.";
  }

  // ── use client / use server ────────────────────────────────────────
  if (t === "'use client'" || t === '"use client"') {
    return "이 파일이 브라우저(클라이언트)에서 실행됨을 선언합니다. useState, onClick 같은 기능을 쓰려면 필수입니다.";
  }
  if (t === "'use server'" || t === '"use server"') {
    return "이 파일이 서버에서만 실행됩니다. 데이터베이스 조회, 파일 읽기 등 서버 작업에 사용합니다.";
  }

  // ── import ────────────────────────────────────────────────────────
  if (t.startsWith("import ")) {
    const m = t.match(/from\s+['"](.+)['"]/);
    if (m) return `불러오기(import) — ${explainImport(m[1], t)}`;
    return "다른 파일이나 라이브러리에서 코드를 불러옵니다.";
  }

  // ── export ────────────────────────────────────────────────────────
  const exportFnMatch = t.match(/^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/);
  if (exportFnMatch) {
    const isAsync = t.includes("async");
    return `'${exportFnMatch[1]}' ${isAsync ? "비동기 " : ""}컴포넌트(함수)를 정의하고 다른 파일에서 가져다 쓸 수 있게 내보냅니다.`;
  }
  if (t.match(/^export\s+default\s+/) && !t.includes("function")) {
    return "이 파일의 기본 내보내기입니다. 다른 곳에서 import MyComponent 형태로 가져옵니다.";
  }
  if (t.match(/^export\s+\{/)) {
    return "여러 값을 한번에 이름 붙여 내보냅니다(named export). import { A, B } 형태로 가져옵니다.";
  }
  if (t.match(/^export\s+const\s+/)) {
    const name = t.match(/^export\s+const\s+(\w+)/)?.[1];
    return `'${name ?? ""}' 상수/함수를 내보냅니다. 다른 파일에서 import { ${name ?? ""} } 로 가져올 수 있어요.`;
  }

  // ── useState 스마트 파싱 ───────────────────────────────────────────
  const useStateMatch = t.match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState\(([^)]*)\)/);
  if (useStateMatch) {
    const [, val, setter, init] = useStateMatch;
    const initDesc = init.trim() === "" ? "undefined" : `\`${init.trim()}\``;
    return `\`${val}\` 값을 저장하는 상태 변수예요. \`${setter}(새값)\`으로 바꾸면 화면이 자동으로 새로 그려집니다. 처음 값은 ${initDesc}이에요.`;
  }

  // ── useEffect 의존성 배열 분석 ─────────────────────────────────────
  const useEffectMatch = t.match(/useEffect\s*\(/);
  if (useEffectMatch) {
    const depsMatch = t.match(/,\s*\[([^\]]*)\]\s*\)/);
    if (depsMatch) {
      const deps = depsMatch[1].trim();
      if (deps === "") {
        return "useEffect — 컴포넌트가 화면에 처음 나타날 때 딱 한 번만 실행돼요. 빈 배열 [] 이 '처음 한 번만'을 의미합니다.";
      }
      return `useEffect — \`${deps}\`가 바뀔 때마다 자동으로 실행돼요. 의존성 배열 [${deps}]에 적힌 값이 바뀌면 다시 실행됩니다.`;
    }
    if (t.endsWith(");") || t.endsWith(")")) {
      return "useEffect — 렌더링될 때마다 실행돼요. ⚠️ 의존성 배열이 없으면 매번 실행되어 성능 문제가 생길 수 있어요.";
    }
    return "useEffect — 화면이 그려진 후 자동으로 실행되는 코드 블록입니다. 의존성 배열로 실행 타이밍을 제어해요.";
  }

  // ── 기타 훅 ───────────────────────────────────────────────────────
  const hookMatch = t.match(/\b(use[A-Z]\w*)\s*[(<]/);
  if (hookMatch) return explainHook(hookMatch[1]);

  // ── const/let/var 선언 ────────────────────────────────────────────
  const varKw = t.match(/^(const|let|var)\s+/);
  if (varKw) {
    const kw = varKw[1];

    // 함수 선언 (화살표)
    const arrowFnMatch = t.match(/^(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/);
    if (arrowFnMatch && t.includes("=>")) {
      const name = arrowFnMatch[1];
      const isAsync = t.includes("async");
      return `\`${name}\` ${isAsync ? "비동기 " : ""}함수를 만듭니다. 아래에서 \`${name}()\`으로 호출할 수 있어요.`;
    }

    // router.push 패턴
    if (t.includes("useRouter") || t.includes("router")) {
      return "Next.js 라우터를 가져옵니다. `router.push('/경로')`로 페이지를 이동할 수 있어요.";
    }

    // 구조 분해 할당 (객체)
    if (t.match(/^(?:const|let|var)\s+\{/)) {
      const srcMatch = t.match(/}\s*=\s*(.+)/);
      const src = srcMatch?.[1]?.replace(/;$/, "").trim();
      return src
        ? `\`${src}\`에서 필요한 값들만 골라서 변수로 꺼냅니다(객체 구조 분해).`
        : "객체에서 필요한 값들만 골라서 변수로 만듭니다(구조 분해 할당).";
    }

    // 구조 분해 할당 (배열)
    if (t.match(/^(?:const|let|var)\s+\[/)) {
      return "배열에서 값을 순서대로 꺼내 변수로 만듭니다(배열 구조 분해).";
    }

    // .map() 배열 렌더링
    if (t.includes(".map(")) {
      const arrMatch = t.match(/(\w+)\.map\(/);
      const arr = arrMatch?.[1];
      return arr
        ? `\`${arr}\` 배열의 각 항목을 JSX로 변환해서 목록을 그립니다. React에서 리스트를 만드는 기본 방법이에요.`
        : "배열의 각 항목을 JSX로 변환해서 목록을 그립니다.";
    }

    // .filter()
    if (t.includes(".filter(")) {
      return "배열에서 조건에 맞는 항목만 골라 새 배열을 만듭니다. 원본 배열은 바뀌지 않아요.";
    }

    // await fetch
    if (t.includes("await fetch(") || t.includes("await axios")) {
      const urlMatch = t.match(/fetch\(['"]([^'"]+)['"]/);
      return urlMatch
        ? `\`${urlMatch[1]}\` API에 요청을 보내고 결과를 기다립니다.`
        : "서버 API에 요청을 보내고 응답을 기다립니다.";
    }

    // process.env
    if (t.includes("process.env.")) {
      const envMatch = t.match(/process\.env\.(\w+)/);
      return envMatch
        ? `환경변수 \`${envMatch[1]}\`를 읽어옵니다. .env 파일에 저장된 비밀 설정값(API 키, URL 등)이에요.`
        : "환경변수를 읽어옵니다. .env 파일에 저장된 설정값이에요.";
    }

    const keyword = kw === "const" ? "변하지 않는 값" : "나중에 바꿀 수 있는 값";
    return `${keyword}을 저장할 변수를 선언합니다.`;
  }

  // ── return ────────────────────────────────────────────────────────
  if (t === "return (" || t === "return(" || t === "return (") {
    return "화면에 보여줄 JSX를 반환합니다. 이 아래가 실제로 화면에 그려지는 부분입니다.";
  }
  if (t === "return null;" || t === "return null") {
    return "아무것도 렌더링하지 않고 반환합니다. 조건에 따라 화면에 아무것도 보여주지 않을 때 씁니다.";
  }

  // ── JSX 인라인 패턴 ───────────────────────────────────────────────
  // 조건부 렌더링: {cond && <X>}
  const condAndMatch = t.match(/^\{(\w[\w.]*)\s*&&\s*(<\w)/);
  if (condAndMatch) {
    return `조건부 렌더링 — \`${condAndMatch[1]}\`이 참(true)일 때만 화면에 나타납니다. 거짓이면 아무것도 그려지지 않아요.`;
  }
  // 조건부 렌더링: {cond ? <A> : <B>}
  const ternaryJsxMatch = t.match(/^\{(\w[\w.]*)\s*\?/);
  if (ternaryJsxMatch) {
    return `삼항 연산자 렌더링 — \`${ternaryJsxMatch[1]}\`이 참이면 ? 앞, 거짓이면 : 뒤의 내용을 보여줍니다.`;
  }

  // key prop
  if (t.match(/\bkey=\{/) || t.match(/\bkey="/)) {
    return "리스트 아이템의 고유 식별자(key)예요. React가 목록 변경을 추적하는 데 꼭 필요합니다. ⚠️ 없으면 경고가 떠요.";
  }

  // JSX 열기 태그
  const jsxOpenMatch = t.match(/^<([A-Za-z][A-Za-z0-9.]*)/);
  if (jsxOpenMatch) {
    const tag = jsxOpenMatch[1];
    if (/^[A-Z]/.test(tag)) return `<${tag}> — 직접 만들었거나 외부에서 가져온 컴포넌트를 화면에 배치합니다.`;
    const desc = JSX_TAG_MAP[tag.toLowerCase()];
    return desc ? `<${tag}> — ${desc}` : `HTML <${tag}> 태그를 렌더링합니다.`;
  }

  // JSX 닫기 태그
  if (t.match(/^<\/[A-Za-z]/)) return "JSX 요소를 닫는 태그입니다.";

  // ── .map() 단독 (변수 선언 없이) ──────────────────────────────────
  if (t.includes(".map(")) {
    const arrMatch = t.match(/(\w+)\.map\(/);
    const arr = arrMatch?.[1];
    return arr
      ? `\`${arr}\` 배열의 각 항목을 JSX로 변환해서 목록을 그립니다.`
      : "배열의 각 항목을 JSX로 변환해서 목록을 그립니다.";
  }

  // ── async/await ───────────────────────────────────────────────────
  if (t.startsWith("await fetch(") || t.startsWith("const res = await")) {
    const urlMatch = t.match(/fetch\(['"]([^'"]+)['"]/);
    return urlMatch
      ? `\`${urlMatch[1]}\` API에 요청을 보내고 응답을 기다립니다.`
      : "서버에 요청을 보내고 응답을 기다립니다.";
  }
  if (t.startsWith("await ") || t.includes(" await ")) {
    return "await — 비동기 작업(API 호출, DB 조회 등)이 끝날 때까지 기다립니다. async 함수 안에서만 사용 가능해요.";
  }
  if (t.startsWith("async ")) return "async 함수 — 내부에서 await를 사용할 수 있는 비동기 함수입니다.";

  // ── 조건문 ────────────────────────────────────────────────────────
  if (t.match(/^if\s*\(/)) return "조건문 — 조건이 참(true)일 때만 아래 코드를 실행합니다.";
  if (t.startsWith("} else if")) return "앞의 if가 거짓일 때 이 조건을 추가로 확인합니다.";
  if (t === "} else {" || t === "else {") return "앞의 조건이 모두 거짓일 때 실행되는 블록입니다.";

  // ── try/catch ─────────────────────────────────────────────────────
  if (t === "try {") return "try 블록 — 에러가 날 수 있는 코드를 안전하게 실행합니다. 에러 발생 시 catch로 이동합니다.";
  if (t.startsWith("catch")) return "catch 블록 — try 안에서 에러가 발생하면 여기서 처리합니다.";
  if (t === "finally {") return "finally 블록 — 에러 여부와 상관없이 항상 마지막에 실행됩니다.";

  // ── 이벤트 핸들러 props ───────────────────────────────────────────
  if (t.includes("onClick=")) return "onClick — 사용자가 이 요소를 클릭했을 때 실행할 함수를 지정합니다.";
  if (t.includes("onChange=")) return "onChange — 입력값이 바뀔 때마다 실행합니다. e.target.value로 현재 값을 꺼낼 수 있어요.";
  if (t.includes("onSubmit=")) return "onSubmit — 폼이 제출될 때 실행합니다. e.preventDefault()로 페이지 새로고침을 막아야 해요.";
  if (t.includes("onKeyDown=") || t.includes("onKeyUp=")) return "키보드 키를 눌렀을 때 실행할 함수를 지정합니다.";
  if (t.includes("onFocus=")) return "onFocus — 이 요소에 포커스가 올 때(클릭 or 탭 이동) 실행됩니다.";
  if (t.includes("onBlur=")) return "onBlur — 포커스가 이 요소에서 떠날 때 실행됩니다. 유효성 검사에 자주 씁니다.";

  // ── e.target.value ────────────────────────────────────────────────
  if (t.includes("e.target.value") || t.includes("event.target.value")) {
    return "이벤트가 발생한 input 요소의 현재 입력 값을 가져옵니다. onChange 핸들러에서 자주 씁니다.";
  }

  // ── 옵셔널 체이닝 / null 병합 ────────────────────────────────────
  if (t.includes("?.")) {
    return "옵셔널 체이닝(?.) — 앞의 값이 null이나 undefined여도 에러가 나지 않아요. 없으면 그냥 undefined를 반환합니다.";
  }
  if (t.includes("??")) {
    return "null 병합 연산자(??) — 앞의 값이 null이나 undefined일 때만 ?? 뒤의 기본값을 사용합니다. 0이나 빈 문자열은 그대로 사용해요.";
  }

  // ── 스프레드 연산자 ───────────────────────────────────────────────
  if (t.includes("{...") || t.includes("[...")) {
    const spreadMatch = t.match(/\{\.\.\.(\w+)\}/);
    if (spreadMatch) {
      return `스프레드 연산자 — \`${spreadMatch[1]}\`의 모든 속성을 한번에 펼쳐서 전달합니다. 일일이 쓰는 것보다 훨씬 간결해요.`;
    }
    return "스프레드 연산자 — 배열이나 객체의 모든 항목을 한번에 펼칩니다.";
  }

  // ── 삼항 연산자 ──────────────────────────────────────────────────
  if (t.includes(" ? ") && t.includes(" : ")) {
    return "삼항 연산자 — `조건 ? 참일 때 값 : 거짓일 때 값` 형태예요. if-else를 한 줄로 쓰는 방법입니다.";
  }

  // ── router.push ───────────────────────────────────────────────────
  const routerPushMatch = t.match(/router\.push\(['"]([^'"]+)['"]/);
  if (routerPushMatch) {
    return `\`${routerPushMatch[1]}\` 페이지로 이동합니다. 뒤로 가기 버튼이 생겨요.`;
  }
  const routerReplaceMatch = t.match(/router\.replace\(['"]([^'"]+)['"]/);
  if (routerReplaceMatch) {
    return `\`${routerReplaceMatch[1]}\` 페이지로 이동합니다. router.push와 달리 뒤로 가기 기록이 남지 않아요.`;
  }

  // ── process.env ───────────────────────────────────────────────────
  if (t.includes("process.env.")) {
    const envMatch = t.match(/process\.env\.(\w+)/);
    return envMatch
      ? `환경변수 \`${envMatch[1]}\`를 읽어옵니다. .env 파일에 저장된 비밀 설정값(API 키 등)이에요. 코드에 직접 적으면 안 되는 것들!`
      : "환경변수를 읽어옵니다. .env 파일에 저장된 설정값이에요.";
  }

  // ── className ────────────────────────────────────────────────────
  if (t.startsWith("className=") || t.includes(" className=")) {
    if (t.includes("${") || t.includes("` ")) {
      return "className — 템플릿 리터럴로 동적 CSS 클래스를 만들어요. 조건에 따라 다른 스타일을 적용할 수 있습니다.";
    }
    return "className — 이 요소에 적용할 CSS 클래스를 지정합니다. HTML의 class 속성과 같습니다.";
  }

  // ── disabled prop ─────────────────────────────────────────────────
  if (t.includes("disabled={")) {
    return "disabled — 조건이 참일 때 이 요소를 비활성화합니다. 클릭이나 입력이 막혀요.";
  }

  // ── style prop ───────────────────────────────────────────────────
  if (t.includes("style={{")) {
    return "인라인 스타일 — 직접 CSS를 지정합니다. 간단한 경우엔 좋지만, 보통은 className(Tailwind)이 더 유지보수하기 쉬워요.";
  }

  // ── interface/type ───────────────────────────────────────────────
  const typeMatch = t.match(/^(?:export\s+)?(?:interface|type)\s+(\w+)/);
  if (typeMatch) {
    return `TypeScript 타입 \`${typeMatch[1]}\` 정의 — 데이터가 어떤 모양이어야 하는지 설계도를 그립니다. 실행에는 영향 없고, 실수를 미리 잡아줘요.`;
  }

  // ── 괄호/중괄호만 ────────────────────────────────────────────────
  if (/^[{}\[\]();<>]+$/.test(t)) return "코드 블록이나 구문을 여닫는 기호입니다.";

  // ── for/while ────────────────────────────────────────────────────
  if (t.match(/^for\s*\(/)) return "반복문 — 조건이 참인 동안 블록 안의 코드를 반복 실행합니다. React에서는 보통 .map()을 더 많이 씁니다.";
  if (t.match(/^while\s*\(/)) return "while 반복문 — 조건이 참인 동안 계속 반복합니다.";

  // ── switch ────────────────────────────────────────────────────────
  if (t.match(/^switch\s*\(/)) return "switch문 — 값에 따라 여러 경우 중 하나를 실행합니다. if-else가 많을 때 깔끔하게 쓸 수 있어요.";
  if (t.startsWith("case ")) return "case — switch문에서 이 값과 일치할 때 실행할 코드 블록입니다.";

  // ── throw / new Error ─────────────────────────────────────────────
  if (t.startsWith("throw ")) return "에러를 강제로 발생시킵니다. catch 블록이나 에러 바운더리에서 잡을 수 있어요.";

  return "코드의 일부입니다. 위아래 맥락과 함께 읽어보세요.";
}

// ─── 짝 중괄호 탐색 ───────────────────────────────────────────────
function stripStringsAndComments(line: string): string {
  let result = "";
  let i = 0;
  let inString: string | null = null;

  while (i < line.length) {
    const ch = line[i];

    if (inString) {
      if (ch === "\\" && i + 1 < line.length) {
        i += 2; // 이스케이프 문자 건너뜀
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }

    // 한 줄 주석 — 이후 전부 무시
    if (ch === "/" && line[i + 1] === "/") break;

    // 문자열/템플릿 리터럴 시작
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      i++;
      continue;
    }

    result += ch;
    i++;
  }
  return result;
}

export function findMatchingBracket(
  lines: string[],
  lineIndex: number // 0-based
): { matchLine: number; direction: "down" | "up"; bracketType: "{" | "(" | "[" } | null {
  const stripped = stripStringsAndComments(lines[lineIndex]);
  const count = (s: string, ch: string) => s.split(ch).length - 1;

  // 우선순위: {} → () → []
  const pairs: Array<[string, string, "{" | "(" | "["]> = [
    ["{", "}", "{"],
    ["(", ")", "("],
    ["[", "]", "["],
  ];

  for (const [open, close, type] of pairs) {
    const unmatched = count(stripped, open) - count(stripped, close);

    if (unmatched > 0) {
      // 아래로 스캔: 닫는 짝 찾기
      let depth = unmatched;
      for (let i = lineIndex + 1; i < lines.length; i++) {
        const s = stripStringsAndComments(lines[i]);
        depth += count(s, open) - count(s, close);
        if (depth <= 0) return { matchLine: i, direction: "down", bracketType: type };
      }
    } else if (unmatched < 0) {
      // 위로 스캔: 여는 짝 찾기
      let depth = -unmatched;
      for (let i = lineIndex - 1; i >= 0; i--) {
        const s = stripStringsAndComments(lines[i]);
        depth += count(s, close) - count(s, open);
        if (depth <= 0) return { matchLine: i, direction: "up", bracketType: type };
      }
    }
  }

  return null;
}

// ─── 메인 분석 함수 ────────────────────────────────────────────────
export function analyzeCode(code: string): AnalysisResult {
  const isClient =
    code.includes("'use client'") || code.includes('"use client"');
  const isAsync =
    /export\s+default\s+async\s+function|export\s+default\s+async\s+\(/.test(
      code
    );
  const componentName = extractComponentName(code);
  const rawImports = extractImports(code);
  const rawHooks = extractHooks(code);
  const props = extractProps(code, componentName);
  const jsxTags = extractTopLevelJSX(code);

  const sections: AnalysisSection[] = [];

  // 1. Imports 섹션
  if (rawImports.length > 0) {
    sections.push({
      type: "imports",
      title: "불러오기 (Imports)",
      emoji: "📦",
      items: rawImports.map((imp) => ({
        code: imp.code.length > 60 ? imp.code.slice(0, 60) + "…" : imp.code,
        explanation: explainImport(imp.from, imp.code),
      })),
    });
  }

  // 2. 컴포넌트 정보 섹션
  const componentItems = [];
  if (isClient) {
    componentItems.push({
      code: "'use client'",
      explanation:
        "이 파일은 브라우저(클라이언트)에서 실행됩니다. 버튼 클릭, 입력 등 사용자 상호작용이 가능합니다.",
    });
  } else {
    componentItems.push({
      code: "Server Component (기본값)",
      explanation:
        "이 파일은 서버에서 실행됩니다. 'use client' 선언이 없으면 자동으로 서버 컴포넌트입니다.",
    });
  }
  if (isAsync) {
    componentItems.push({
      code: "async function " + componentName,
      explanation:
        "async 함수는 서버에서 데이터를 기다렸다가 가져올 수 있습니다. await를 사용한 DB/API 요청이 가능합니다.",
    });
  }
  if (props.length > 0) {
    componentItems.push({
      code: `{ ${props.join(", ")} }`,
      explanation: `부모 컴포넌트가 이 컴포넌트에 넘겨주는 값(props)입니다.`,
    });
  }
  sections.push({
    type: "component",
    title: "컴포넌트 정보",
    emoji: "🧩",
    items: componentItems,
  });

  // 3. Hooks 섹션
  if (rawHooks.length > 0) {
    sections.push({
      type: "hooks",
      title: "훅 (Hooks)",
      emoji: "🪝",
      items: rawHooks.map((h) => ({
        code: h.line.length > 60 ? h.line.slice(0, 60) + "…" : h.line,
        explanation: explainHook(h.name),
      })),
    });
  }

  // 4. JSX 구조 섹션
  if (jsxTags.length > 0) {
    sections.push({
      type: "jsx",
      title: "화면 구성 요소 (JSX)",
      emoji: "🖼️",
      items: jsxTags.map((tag) => {
        const isComponent = tag[0] === tag[0].toUpperCase();
        return {
          code: `<${tag}>`,
          explanation: isComponent
            ? `${tag} — 직접 만든 컴포넌트 또는 외부 UI 컴포넌트`
            : (JSX_TAG_MAP[tag.toLowerCase()] ?? `HTML ${tag} 태그`),
        };
      }),
    });
  }

  const stats: AnalysisStats = {
    importCount: rawImports.length,
    hookCount: rawHooks.length,
    isClientComponent: isClient,
    isAsyncComponent: isAsync,
    componentName,
  };

  return {
    summary: generateSummary(
      componentName,
      isClient,
      isAsync,
      rawHooks,
      rawImports,
      props
    ),
    sections,
    stats,
    score: calculateScore(rawHooks, rawImports, isClient),
    suggestions: generateSuggestions(rawHooks, isClient, code),
    componentTree: buildJSXTree(code, componentName),
  };
}
