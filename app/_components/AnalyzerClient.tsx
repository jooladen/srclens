"use client";

import { useState, useTransition } from "react";
import { CodeInput } from "@/components/analyzer/CodeInput";
import { AnalyzeButton } from "@/components/analyzer/AnalyzeButton";
import { ResultPanel } from "@/components/analyzer/ResultPanel";
import { analyzeCode } from "@/lib/analyzer";
import type { AnalysisResult } from "@/types/analysis";

export function AnalyzerClient() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "result">("input");
  const [isPending, startTransition] = useTransition();

  const analyze = () => {
    if (!code.trim()) return;
    startTransition(() => {
      const res = analyzeCode(code);
      setResult(res);
      setActiveTab("result");
    });
  };

  return (
    <>
      {/* 모바일 탭 */}
      <div className="flex sm:hidden border-b border-gray-800 shrink-0">
        <button
          onClick={() => setActiveTab("input")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "input"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-500"
          }`}
        >
          코드 입력
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "result"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-500"
          }`}
        >
          분석 결과
          {result && (
            <span className="ml-1 w-2 h-2 bg-green-400 rounded-full inline-block" />
          )}
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 코드 입력 */}
        <div
          className={`flex flex-col gap-4 p-5 border-r border-gray-800 overflow-hidden
            sm:flex sm:w-1/2
            ${activeTab === "input" ? "flex w-full" : "hidden sm:flex"}
          `}
        >
          <div className="flex-1 overflow-hidden">
            <CodeInput value={code} onChange={setCode} />
          </div>
          <AnalyzeButton
            onClick={analyze}
            loading={isPending}
            disabled={!code.trim()}
          />
        </div>

        {/* 오른쪽: 분석 결과 */}
        <div
          className={`flex-1 p-5 overflow-y-auto
            sm:flex sm:flex-col
            ${activeTab === "result" ? "flex flex-col w-full" : "hidden sm:flex"}
          `}
        >
          <ResultPanel result={result} loading={isPending} error={null} />
        </div>
      </div>
    </>
  );
}
