import type { AnalysisSection } from "@/types/analysis";

interface SectionCardProps {
  section: AnalysisSection;
}

export function SectionCard({ section }: SectionCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{section.emoji}</span>
        <h3 className="font-bold text-gray-200">{section.title}</h3>
        <span className="ml-auto text-xs text-gray-500">{section.items.length}개</span>
      </div>
      <div className="flex flex-col gap-3">
        {section.items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <code className="text-xs bg-gray-800 text-green-300 px-3 py-1.5 rounded-md font-mono break-all">
              {item.code}
            </code>
            <p className="text-sm text-gray-300 pl-1">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
