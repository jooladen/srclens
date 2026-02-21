"use client";

import { useState } from "react";
import type { Suggestion } from "@/types/analysis";

interface SuggestionsCardProps {
  suggestions: Suggestion[];
}

const levelStyle: Record<Suggestion["level"], string> = {
  tip: "border-blue-800 bg-blue-950",
  warning: "border-yellow-800 bg-yellow-950",
  info: "border-gray-700 bg-gray-900",
};

function BeforeAfter({ beforeCode, afterCode }: { beforeCode: string; afterCode: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-700">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs font-semibold text-red-400 mb-1.5">❌ Before</div>
          <pre className="bg-red-950/30 border border-red-900/40 rounded-lg p-2.5 text-xs text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            <code>{beforeCode}</code>
          </pre>
        </div>
        <div>
          <div className="text-xs font-semibold text-green-400 mb-1.5">✅ After</div>
          <pre className="bg-green-950/30 border border-green-900/40 rounded-lg p-2.5 text-xs text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            <code>{afterCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function SuggestionsCard({ suggestions }: SuggestionsCardProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💡</span>
        <h3 className="font-bold text-gray-200">이렇게 바꿔보세요!</h3>
        <span className="ml-auto text-xs text-gray-500">{suggestions.length}개</span>
      </div>
      <div className="flex flex-col gap-3">
        {suggestions.map((s, i) => {
          const hasExample = !!(s.beforeCode && s.afterCode);
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`border rounded-lg p-3 ${levelStyle[s.level]}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{s.icon}</span>
                <span className="text-sm font-semibold text-gray-200">{s.title}</span>
                {hasExample && (
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-gray-700/60 hover:bg-gray-600/60 text-gray-400 hover:text-gray-200 border border-gray-600/50 transition-all"
                  >
                    {isOpen ? "▲ 닫기" : "코드 예시 ▼"}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-400 pl-6">{s.description}</p>
              {hasExample && isOpen && (
                <BeforeAfter beforeCode={s.beforeCode!} afterCode={s.afterCode!} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
