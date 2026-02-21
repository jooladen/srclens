"use client";

import { useState } from "react";
import { CodeInput } from "@/components/analyzer/CodeInput";
import { AnalyzeButton } from "@/components/analyzer/AnalyzeButton";
import { ResultPanel } from "@/components/analyzer/ResultPanel";
import type { AnalysisResult } from "@/types/analysis";

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "result">("input");

  const analyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setActiveTab("result");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "분석 실패");
        setResult(null);
      } else {
        setResult(data as AnalysisResult);
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              🔬 SrcLens
            </h1>
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
              AI검색버전
            </span>
          </div>
          <p className="text-xs text-gray-500">리액트 초보를 위한 코드 분석기</p>
        </div>
        <span className="text-xs text-gray-600 hidden sm:block">
          page.tsx를 붙여넣으면 1분 안에 이해할 수 있어요
        </span>
      </header>

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
        {/* 왼쪽: 코드 입력 (데스크톱 항상 표시, 모바일은 탭) */}
        <div
          className={`flex flex-col gap-4 p-5 border-r border-gray-800 overflow-hidden
            sm:flex sm:w-1/2
            ${activeTab === "input" ? "flex w-full" : "hidden sm:flex"}
          `}
        >
          <div className="flex-1 overflow-hidden">
            <CodeInput value={code} onChange={setCode} disabled={loading} />
          </div>
          <AnalyzeButton
            onClick={analyze}
            loading={loading}
            disabled={!code.trim()}
          />
        </div>

        {/* 오른쪽: 분석 결과 (데스크톱 항상 표시, 모바일은 탭) */}
        <div
          className={`flex-1 p-5 overflow-y-auto
            sm:flex sm:flex-col
            ${activeTab === "result" ? "flex flex-col w-full" : "hidden sm:flex"}
          `}
        >
          <ResultPanel result={result} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
