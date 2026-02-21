export type SectionType = "imports" | "hooks" | "component" | "jsx";

export interface AnalysisItem {
  code: string;
  explanation: string;
}

export interface AnalysisSection {
  type: SectionType;
  title: string;
  emoji: string;
  items: AnalysisItem[];
}

export interface AnalysisStats {
  importCount: number;
  hookCount: number;
  isClientComponent: boolean;
  isAsyncComponent: boolean;
  componentName: string;
}

export interface AnalysisResult {
  summary: string;
  sections: AnalysisSection[];
  stats: AnalysisStats;
}

export interface AnalyzeRequest {
  code: string;
}

export interface AnalyzeErrorResponse {
  error: string;
  code: "INVALID_CODE" | "TOO_LARGE" | "API_ERROR";
}

export type ParsedCode = {
  isClientComponent: boolean;
  isAsyncComponent: boolean;
  imports: string[];
  hooks: string[];
  componentName: string;
};
