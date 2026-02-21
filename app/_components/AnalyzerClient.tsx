"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { CodeInput } from "@/components/analyzer/CodeInput";
import { AnalyzeButton } from "@/components/analyzer/AnalyzeButton";
import { ResultPanel } from "@/components/analyzer/ResultPanel";
import { ExampleButtons } from "@/components/analyzer/ExampleButtons";
import { LearnMode } from "@/components/analyzer/LearnMode";
import { analyzeCode } from "@/lib/analyzer";
import type { AnalysisResult, HistoryItem } from "@/types/analysis";

const HISTORY_KEY = "srclens_history";
const MAX_HISTORY = 5;
const DEBOUNCE_MS = 600;

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(item: HistoryItem) {
  const prev = loadHistory();
  const next = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function encodeCode(code: string): string {
  return btoa(encodeURIComponent(code));
}

function decodeCode(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return "";
  }
}

export function AnalyzerClient() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "result">("input");
  const [isPending, startTransition] = useTransition();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [learnMode, setLearnMode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL에서 코드 불러오기
  useEffect(() => {
    setHistory(loadHistory());
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("code");
    if (shared) {
      const decoded = decodeCode(shared);
      if (decoded) {
        setCode(decoded);
        startTransition(() => {
          const res = analyzeCode(decoded);
          setResult(res);
          setActiveTab("result");
        });
      }
    }
  }, []);

  const runAnalyze = useCallback((target: string) => {
    if (!target.trim()) return;
    startTransition(() => {
      const res = analyzeCode(target);
      setResult(res);
      setActiveTab("result");
      const item: HistoryItem = {
        id: Date.now().toString(),
        code: target,
        componentName: res.stats.componentName,
        score: res.score.score,
        date: new Date().toLocaleString("ko-KR", {
          month: "numeric", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      };
      saveHistory(item);
      setHistory(loadHistory());
    });
  }, []);

  // 실시간 분석 (디바운스)
  useEffect(() => {
    if (!liveMode || !code.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAnalyze(code), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code, liveMode, runAnalyze]);

  const handleShareLink = () => {
    const encoded = encodeCode(code);
    const url = `${window.location.origin}?code=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const loadFromHistory = (item: HistoryItem) => {
    setCode(item.code);
    setShowHistory(false);
    setActiveTab("input");
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
          {result && <span className="ml-1 w-2 h-2 bg-green-400 rounded-full inline-block" />}
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
          {/* 예제 버튼 */}
          <ExampleButtons onSelect={(c) => { setCode(c); setResult(null); }} />

          <div className="flex-1 overflow-hidden">
            {learnMode && code ? (
              <LearnMode code={code} />
            ) : (
              <CodeInput value={code} onChange={setCode} />
            )}
          </div>

          {/* 실시간 토글 + 학습 모드 + 버튼 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLiveMode(!liveMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                liveMode
                  ? "bg-green-900 border-green-700 text-green-300"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${liveMode ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
              {liveMode ? "실시간 ON" : "실시간 OFF"}
            </button>

            <button
              type="button"
              onClick={() => setLearnMode(!learnMode)}
              disabled={!code.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                learnMode
                  ? "bg-yellow-900/50 border-yellow-700 text-yellow-300"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300"
              }`}
            >
              <span>📖</span>
              학습 모드
            </button>

            {!liveMode && (
              <AnalyzeButton
                onClick={() => runAnalyze(code)}
                loading={isPending}
                disabled={!code.trim()}
              />
            )}

            {result && code && (
              <button
                type="button"
                onClick={handleShareLink}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-all"
              >
                {linkCopied ? "✅ 링크 복사됨!" : "🔗 공유 링크"}
              </button>
            )}
          </div>

          {/* 히스토리 */}
          {history.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showHistory ? "▲" : "▼"} 최근 분석 {history.length}개
              </button>
              {showHistory && (
                <div className="mt-2 flex flex-col gap-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="flex items-center justify-between px-3 py-2 text-xs bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-left transition-colors"
                    >
                      <span className="text-gray-300 font-medium">{item.componentName}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-blue-400">{item.score}점</span>
                        <span className="text-gray-600">{item.date}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
