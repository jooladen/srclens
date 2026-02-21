"use client";

import { useRef, useState } from "react";
import { explainLine, findMatchingBracket } from "@/lib/analyzer";

interface Props {
  code: string;
}

export function LearnMode({ code }: Props) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lines = code.split("\n");

  const handleClick = (lineNum: number, line: string) => {
    if (!line.trim()) return;
    setSelectedLine(selectedLine === lineNum ? null : lineNum);
  };

  const scrollToMatch = (targetIndex: number) => {
    const targetLineNum = targetIndex + 1;
    setHighlightLine(targetLineNum);
    lineRefs.current[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightLine(null), 1500);
  };

  // 선택된 줄의 짝 중괄호 정보
  const matchInfo =
    selectedLine !== null ? findMatchingBracket(lines, selectedLine - 1) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-2 px-1 text-xs text-gray-500">
        <span className="text-yellow-400">📖</span>
        <span>줄을 클릭하면 설명이 나타납니다</span>
        {selectedLine && (
          <button
            onClick={() => setSelectedLine(null)}
            className="ml-auto text-gray-600 hover:text-gray-400 transition-colors"
          >
            ✕ 닫기
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-sm rounded-lg border border-gray-800 bg-gray-950">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isSelected = selectedLine === lineNum;
          const isHighlighted = highlightLine === lineNum;
          const isEmpty = !line.trim();
          const explanation = isSelected ? explainLine(line) : null;

          return (
            <div key={idx} ref={(el) => { lineRefs.current[idx] = el; }}>
              <button
                onClick={() => handleClick(lineNum, line)}
                disabled={isEmpty}
                className={`w-full text-left flex items-start gap-0 transition-colors group
                  ${isEmpty ? "cursor-default" : "hover:bg-gray-900"}
                  ${isSelected ? "bg-yellow-950/30 hover:bg-yellow-950/30" : ""}
                  ${isHighlighted ? "bg-cyan-950/40 ring-1 ring-inset ring-cyan-700/50" : ""}
                `}
              >
                {/* 줄 번호 */}
                <span
                  className={`select-none w-10 shrink-0 text-right pr-3 py-0.5 text-xs leading-6
                    ${isSelected ? "text-yellow-400" : ""}
                    ${isHighlighted ? "text-cyan-400" : ""}
                    ${!isSelected && !isHighlighted ? "text-gray-700 group-hover:text-gray-500" : ""}
                    ${isEmpty ? "group-hover:text-gray-700" : ""}
                  `}
                >
                  {lineNum}
                </span>

                {/* 줄 내용 */}
                <span
                  className={`flex-1 py-0.5 pr-4 leading-6 whitespace-pre
                    ${isSelected ? "text-yellow-200" : ""}
                    ${isHighlighted ? "text-cyan-200" : ""}
                    ${!isSelected && !isHighlighted ? "text-gray-300" : ""}
                    ${isEmpty ? "text-transparent select-none" : ""}
                    ${!isEmpty && !isSelected && !isHighlighted ? "group-hover:text-white" : ""}
                  `}
                >
                  {line || " "}
                </span>

                {/* 클릭 힌트 */}
                {!isEmpty && !isSelected && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 py-0.5 text-xs text-gray-600 leading-6 shrink-0">
                    클릭
                  </span>
                )}
              </button>

              {/* 설명 패널 (인라인 확장) */}
              {isSelected && explanation && (
                <div className="mx-2 mb-1 flex flex-col gap-1 px-3 py-2 bg-yellow-900/20 border border-yellow-800/40 rounded-lg text-xs text-yellow-200 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">💡</span>
                    <span>{explanation}</span>
                  </div>
                  {matchInfo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToMatch(matchInfo.matchLine);
                      }}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 transition-colors text-[11px] pl-5"
                    >
                      <span>{matchInfo.direction === "down" ? "↓" : "↑"}</span>
                      <span>
                        이 블록은{" "}
                        <strong className="text-cyan-300">{matchInfo.matchLine + 1}번 줄</strong>
                        에서 {matchInfo.direction === "down" ? "닫힙니다" : "열렸습니다"}
                      </span>
                      <span className="text-gray-500 ml-1">[이동]</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
