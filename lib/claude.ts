import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, ParsedCode } from "@/types/analysis";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `당신은 리액트를 처음 배우는 한국인 개발자를 도와주는 친절한 선생님입니다.
주어진 Next.js page.tsx 코드를 분석하고, 초등학생도 이해할 수 있는 쉬운 말로 설명해주세요.

규칙:
- 전문 용어는 반드시 쉬운 말로 풀어서 설명할 것
- 예시: useState → "화면에 보여줄 정보를 저장하는 서랍"
- 예시: useEffect → "화면이 처음 열릴 때 자동으로 실행되는 코드"
- 예시: import → "다른 곳에서 만들어진 기능을 가져오기"
- 각 설명은 1-2문장으로 간결하게
- 반드시 유효한 JSON 형식으로만 응답할 것 (마크다운 코드블록 없이)`;

export async function analyzeWithClaude(
  code: string,
  parsed: ParsedCode
): Promise<AnalysisResult> {
  const userPrompt = `다음 page.tsx 코드를 분석해주세요.

[사전 파싱 정보]
- 클라이언트 컴포넌트: ${parsed.isClientComponent ? "예 ('use client' 있음)" : "아니오 (서버 컴포넌트)"}
- 비동기 컴포넌트: ${parsed.isAsyncComponent ? "예" : "아니오"}
- 컴포넌트 이름: ${parsed.componentName}
- import 수: ${parsed.imports.length}개
- 사용된 hook: ${parsed.hooks.length > 0 ? parsed.hooks.join(", ") : "없음"}

[코드]
\`\`\`tsx
${code}
\`\`\`

다음 JSON 형식으로 정확히 응답해주세요:
{
  "summary": "이 파일이 하는 일을 2-3문장으로 설명 (초보자도 이해할 수 있게)",
  "sections": [
    {
      "type": "imports",
      "title": "불러오기 (Imports)",
      "emoji": "📦",
      "items": [
        { "code": "import React from 'react'", "explanation": "React 기본 기능을 가져옵니다." }
      ]
    },
    {
      "type": "hooks",
      "title": "훅 (Hooks)",
      "emoji": "🪝",
      "items": [
        { "code": "const [count, setCount] = useState(0)", "explanation": "숫자를 저장하는 서랍을 만듭니다." }
      ]
    },
    {
      "type": "component",
      "title": "컴포넌트",
      "emoji": "🧩",
      "items": [
        { "code": "export default function Page()", "explanation": "화면을 만드는 함수입니다." }
      ]
    },
    {
      "type": "jsx",
      "title": "화면 구성 (JSX)",
      "emoji": "🖼️",
      "items": [
        { "code": "<h1>제목</h1>", "explanation": "큰 제목 텍스트를 화면에 보여줍니다." }
      ]
    }
  ]
}

hooks가 없으면 hooks 섹션은 포함하지 마세요. imports가 없으면 imports 섹션도 포함하지 마세요.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const result = JSON.parse(content.text) as Omit<AnalysisResult, "stats">;

  return {
    ...result,
    stats: {
      importCount: parsed.imports.length,
      hookCount: parsed.hooks.length,
      isClientComponent: parsed.isClientComponent,
      isAsyncComponent: parsed.isAsyncComponent,
      componentName: parsed.componentName,
    },
  };
}
