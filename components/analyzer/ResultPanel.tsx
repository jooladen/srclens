import type { AnalysisResult } from "@/types/analysis";
import { SummaryCard } from "./SummaryCard";
import { SectionCard } from "./SectionCard";

interface ResultPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export function ResultPanel({ result, loading, error }: ResultPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
        <div className="text-5xl animate-pulse">🔍</div>
        <p className="text-lg font-medium">코드를 분석하고 있어요...</p>
        <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
        <div className="text-5xl">⚠️</div>
        <p className="text-base font-medium">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-600">
        <div className="text-6xl">👈</div>
        <p className="text-lg font-medium text-gray-500">왼쪽에 코드를 붙여넣고</p>
        <p className="text-base text-gray-600">&quot;분석하기&quot; 버튼을 눌러주세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      <SummaryCard summary={result.summary} stats={result.stats} />
      {result.sections.map((section, i) => (
        <SectionCard key={i} section={section} />
      ))}
    </div>
  );
}
