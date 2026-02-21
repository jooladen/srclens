import type { AnalysisStats } from "@/types/analysis";

interface SummaryCardProps {
  summary: string;
  stats: AnalysisStats;
}

export function SummaryCard({ summary, stats }: SummaryCardProps) {
  return (
    <div className="bg-blue-950 border border-blue-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💡</span>
        <h2 className="font-bold text-blue-300">한줄 요약</h2>
      </div>
      <p className="text-white text-base leading-relaxed">{summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {stats.isClientComponent && (
          <span className="px-2 py-1 bg-purple-900 text-purple-200 text-xs rounded-full">
            클라이언트 컴포넌트
          </span>
        )}
        {!stats.isClientComponent && (
          <span className="px-2 py-1 bg-green-900 text-green-200 text-xs rounded-full">
            서버 컴포넌트
          </span>
        )}
        {stats.isAsyncComponent && (
          <span className="px-2 py-1 bg-yellow-900 text-yellow-200 text-xs rounded-full">
            비동기 컴포넌트
          </span>
        )}
        <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
          import {stats.importCount}개
        </span>
        {stats.hookCount > 0 && (
          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
            hook {stats.hookCount}개
          </span>
        )}
      </div>
    </div>
  );
}
