"use client";

import { useRef, useState } from "react";
import { explainLine, findMatchingBracket } from "@/lib/analyzer";

interface Props {
  code: string;
}

// 괄호 타입별 블록 스타일
const BLOCK_STYLE = {
  "{": {
    border: "border-cyan-600/50",
    bg: "bg-cyan-950/20",
    hoverBg: "hover:bg-cyan-950/30",
    lineNum: "text-cyan-500/80",
  },
  "(": {
    border: "border-violet-600/50",
    bg: "bg-violet-950/20",
    hoverBg: "hover:bg-violet-950/30",
    lineNum: "text-violet-500/80",
  },
  "[": {
    border: "border-emerald-600/50",
    bg: "bg-emerald-950/20",
    hoverBg: "hover:bg-emerald-950/30",
    lineNum: "text-emerald-500/80",
  },
} as const;

export function LearnMode({ code }: Props) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lines = code.split("\n");

  const handleClick = (lineNum: number, line: string) => {
    if (!line.trim()) return;
    setSelectedLine(selectedLine === lineNum ? null : lineNum);
  };

  const scrollToLine = (targetIndex: number) => {
    lineRefs.current[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // 짝 탐색
  const matchInfo =
    selectedLine !== null ? findMatchingBracket(lines, selectedLine - 1) : null;

  // 블록 범위 (1-based, inclusive)
  const blockStart =
    matchInfo?.direction === "up" ? matchInfo.matchLine + 1 : selectedLine;
  const blockEnd =
    matchInfo?.direction === "up"
      ? selectedLine
      : matchInfo
      ? matchInfo.matchLine + 1
      : null;

  const bs = matchInfo ? BLOCK_STYLE[matchInfo.bracketType] : null;

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
          const isEmpty = !line.trim();
          const explanation = isSelected ? explainLine(line) : null;

          const inBlock =
            blockStart !== null &&
            blockEnd !== null &&
            lineNum >= blockStart &&
            lineNum <= blockEnd;
          const isBoundary = lineNum === blockStart || lineNum === blockEnd;

          return (
            <div
              key={idx}
              ref={(el) => { lineRefs.current[idx] = el; }}
              className={
                inBlock && bs
                  ? `border-l-2 ${bs.border}`
                  : "border-l-2 border-transparent"
              }
            >
              <button
                onClick={() => handleClick(lineNum, line)}
                disabled={isEmpty}
                className={`w-full text-left flex items-start gap-0 transition-colors group
                  ${isEmpty ? "cursor-default" : ""}
                  ${
                    isSelected
                      ? "bg-yellow-950/30 hover:bg-yellow-950/30"
                      : inBlock && bs
                      ? `${bs.bg} ${bs.hoverBg}`
                      : "hover:bg-gray-900"
                  }
                `}
              >
                {/* 줄 번호 */}
                <span
                  className={`select-none w-10 shrink-0 text-right pr-3 py-0.5 text-xs leading-6
                    ${isSelected ? "text-yellow-400" : ""}
                    ${!isSelected && isBoundary && bs ? bs.lineNum : ""}
                    ${!isSelected && !isBoundary ? "text-gray-700 group-hover:text-gray-500" : ""}
                    ${isEmpty && !isSelected ? "group-hover:text-gray-700" : ""}
                  `}
                >
                  {lineNum}
                </span>

                {/* 줄 내용 */}
                <span
                  className={`flex-1 py-0.5 pr-4 leading-6 whitespace-pre
                    ${isSelected ? "text-yellow-200" : "text-gray-300"}
                    ${isEmpty ? "text-transparent select-none" : ""}
                    ${!isEmpty && !isSelected ? "group-hover:text-white" : ""}
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

              {/* 설명 패널 */}
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
                        scrollToLine(matchInfo.matchLine);
                      }}
                      className="flex items-center gap-1 pl-5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {matchInfo.direction === "down" ? "↓ 블록 끝으로" : "↑ 블록 시작으로"}
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
