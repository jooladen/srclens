"use client";

import { useState } from "react";
import { explainLine } from "@/lib/analyzer";

interface Props {
  code: string;
}

export function LearnMode({ code }: Props) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const lines = code.split("\n");

  const handleClick = (lineNum: number, line: string) => {
    if (!line.trim()) return;
    setSelectedLine(selectedLine === lineNum ? null : lineNum);
  };

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

          return (
            <div key={idx}>
              <button
                onClick={() => handleClick(lineNum, line)}
                disabled={isEmpty}
                className={`w-full text-left flex items-start gap-0 transition-colors group
                  ${isEmpty ? "cursor-default" : "hover:bg-gray-900"}
                  ${isSelected ? "bg-yellow-950/30 hover:bg-yellow-950/30" : ""}
                `}
              >
                {/* 줄 번호 */}
                <span
                  className={`select-none w-10 shrink-0 text-right pr-3 py-0.5 text-xs leading-6
                    ${isSelected ? "text-yellow-400" : "text-gray-700 group-hover:text-gray-500"}
                    ${isEmpty ? "group-hover:text-gray-700" : ""}
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

              {/* 설명 패널 (인라인 확장) */}
              {isSelected && explanation && (
                <div className="mx-2 mb-1 flex items-start gap-2 px-3 py-2 bg-yellow-900/20 border border-yellow-800/40 rounded-lg text-xs text-yellow-200 leading-relaxed">
                  <span className="shrink-0 mt-0.5">💡</span>
                  <span>{explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
