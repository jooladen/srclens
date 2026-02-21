import { AnalyzerClient } from "./_components/AnalyzerClient";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 — Server Component (정적) */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">🔬 SrcLens</h1>
            <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs font-medium rounded-full">
              오프라인 분석
            </span>
          </div>
          <p className="text-xs text-gray-500">리액트 초보 프리랜서를 위한 즉시 코드 분석기</p>
        </div>
        <span className="text-xs text-gray-600 hidden sm:block">
          AI 없이 · 인터넷 없이 · 즉시 분석
        </span>
      </header>

      {/* 인터랙티브 영역 — Client Component 경계 */}
      <AnalyzerClient />
    </div>
  );
}
