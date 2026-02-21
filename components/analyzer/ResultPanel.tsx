"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";
import { SummaryCard } from "./SummaryCard";
import { SectionCard } from "./SectionCard";
import { ScoreCard } from "./ScoreCard";
import { SuggestionsCard } from "./SuggestionsCard";
import { ComponentTree } from "./ComponentTree";

interface ResultPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export function ResultPanel({ result, loading, error }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `=== SrcLens 분석 결과 ===`,
      `컴포넌트: ${result.stats.componentName}`,
      `점수: ${result.score.score}점 (${result.score.grade} ${result.score.gradeEmoji})`,
      ``,
      `📋 요약`,
      result.summary,
      ``,
      `💡 개선 제안`,
      ...result.suggestions.map((s) => `${s.icon} ${s.title}: ${s.description}`),
      ``,
      ...result.sections.map((sec) =>
        [
          `${sec.emoji} ${sec.title}`,
          ...sec.items.map((item) => `  • ${item.code}\n    → ${item.explanation}`),
        ].join("\n")
      ),
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">분석 완료</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-all"
        >
          {copied ? "✅ 복사됨!" : "📋 결과 복사"}
        </button>
      </div>
      <ScoreCard score={result.score} />
      <SummaryCard summary={result.summary} stats={result.stats} />
      <SuggestionsCard suggestions={result.suggestions} />
      <ComponentTree root={result.componentTree} />
      {result.sections.map((section, i) => (
        <SectionCard key={i} section={section} />
      ))}
    </div>
  );
}
