import { NextRequest, NextResponse } from "next/server";
import { parsePageTsx } from "@/lib/parser";
import { analyzeWithClaude } from "@/lib/claude";
import type { AnalyzeRequest, AnalyzeErrorResponse } from "@/types/analysis";

const MAX_CODE_LENGTH = 50_000;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: "코드를 입력해주세요.", code: "INVALID_CODE" },
        { status: 400 }
      );
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: "코드가 너무 깁니다. (최대 50,000자)", code: "TOO_LARGE" },
        { status: 400 }
      );
    }

    const parsed = parsePageTsx(code);
    const result = await analyzeWithClaude(code, parsed);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "분석 중 오류가 발생했습니다. 다시 시도해주세요.", code: "API_ERROR" },
      { status: 500 }
    );
  }
}
