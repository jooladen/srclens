import type { Suggestion } from "@/types/analysis";

interface SuggestionsCardProps {
  suggestions: Suggestion[];
}

const levelStyle: Record<Suggestion["level"], string> = {
  tip: "border-blue-800 bg-blue-950",
  warning: "border-yellow-800 bg-yellow-950",
  info: "border-gray-700 bg-gray-900",
};

export function SuggestionsCard({ suggestions }: SuggestionsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💡</span>
        <h3 className="font-bold text-gray-200">이렇게 바꿔보세요!</h3>
        <span className="ml-auto text-xs text-gray-500">{suggestions.length}개</span>
      </div>
      <div className="flex flex-col gap-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`border rounded-lg p-3 ${levelStyle[s.level]}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-sm font-semibold text-gray-200">{s.title}</span>
            </div>
            <p className="text-sm text-gray-400 pl-6">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
