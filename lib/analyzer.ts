import type { AnalysisResult, AnalysisSection, AnalysisStats } from "@/types/analysis";

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
  };
}
