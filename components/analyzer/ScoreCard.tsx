import type { CodeScore } from "@/types/analysis";

interface ScoreCardProps {
  score: CodeScore;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const barColor =
    score.score >= 90
      ? "bg-green-500"
      : score.score >= 70
      ? "bg-blue-500"
      : score.score >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📊</span>
        <h3 className="font-bold text-gray-200">코드 건강 점수</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl font-black text-white">{score.score}</div>
        <div>
          <div className="text-2xl">{score.gradeEmoji}</div>
          <div className="text-sm font-bold text-gray-300">{score.grade}</div>
        </div>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${score.score}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">복잡도</div>
          <div className="text-sm font-medium text-gray-200">{score.complexity}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">초보자 친화도</div>
          <div className="text-sm font-medium text-gray-200">{score.beginnerFriendly}</div>
        </div>
      </div>
    </div>
  );
}
