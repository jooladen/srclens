import type { ParsedCode } from "@/types/analysis";

export function parsePageTsx(code: string): ParsedCode {
  return {
    isClientComponent: code.includes("'use client'") || code.includes('"use client"'),
    isAsyncComponent: /export\s+default\s+async\s+function|export\s+default\s+async\s+\(/.test(code),
    imports: extractImports(code),
    hooks: extractHooks(code),
    componentName: extractComponentName(code),
  };
}

function extractImports(code: string): string[] {
  const importRegex = /^import\s+.+\s+from\s+['"].+['"]/gm;
  return code.match(importRegex) ?? [];
}

function extractHooks(code: string): string[] {
  const hookRegex = /\buse[A-Z]\w*\s*\(/g;
  const matches = code.match(hookRegex) ?? [];
  // 중복 제거 및 괄호 제거
  return [...new Set(matches.map((h) => h.replace("(", "").trim()))];
}

function extractComponentName(code: string): string {
  const patterns = [
    /export\s+default\s+function\s+(\w+)/,
    /function\s+(\w+)[^{]*\{[\s\S]*export\s+default\s+\1/,
    /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*\w+\s*)?=>/,
  ];
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "Page";
}
