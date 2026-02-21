"use client";

interface AnalyzeButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export function AnalyzeButton({ onClick, loading, disabled }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          분석 중...
        </>
      ) : (
        <>
          <span>🔍</span>
          분석하기
        </>
      )}
    </button>
  );
}
