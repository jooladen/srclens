"use client";

import { useRef } from "react";

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
}

export function CodeInput({ value, onChange }: CodeInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".tsx") && !file.name.endsWith(".ts")) {
      alert(".tsx 또는 .ts 파일만 지원합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div
        className="relative flex-1 min-h-[300px]"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={false}
          placeholder={`// page.tsx 코드를 여기에 붙여넣거나\n// 파일을 드래그&드롭 하세요\n\n'use client'\n\nimport { useState } from 'react'\n\nexport default function Page() {\n  return <div>Hello World</div>\n}`}
          className="w-full h-full min-h-[300px] p-4 font-mono text-sm bg-gray-950 text-gray-100 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 disabled:opacity-50"
          spellCheck={false}
        />
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">📄</div>
              <div className="text-sm">파일을 드래그하거나 코드를 붙여넣으세요</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".tsx,.ts"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={false}
          className="px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          파일 업로드
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={false}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            지우기
          </button>
        )}
        <span className="ml-auto text-xs text-gray-600">
          {value.length.toLocaleString()}자
        </span>
      </div>
    </div>
  );
}
