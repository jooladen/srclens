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

export interface CodeScore {
  score: number;
  grade: "완벽" | "좋음" | "보통" | "개선필요";
  gradeEmoji: string;
  complexity: "낮음" | "보통" | "높음";
  beginnerFriendly: "높음" | "보통" | "낮음";
  level: "초급" | "중급" | "고급";
}

export interface Suggestion {
  icon: string;
  title: string;
  description: string;
  level: "tip" | "warning" | "info";
  beforeCode?: string;
  afterCode?: string;
}

export interface HistoryItem {
  id: string;
  code: string;
  componentName: string;
  score: number;
  date: string;
}

export interface AnalysisResult {
  summary: string;
  sections: AnalysisSection[];
  stats: AnalysisStats;
  score: CodeScore;
  suggestions: Suggestion[];
  componentTree: TreeNode;
}

export interface AnalyzeRequest {
  code: string;
}

export interface AnalyzeErrorResponse {
  error: string;
  code: "INVALID_CODE" | "TOO_LARGE" | "API_ERROR";
}

export interface TreeNode {
  tag: string;
  isComponent: boolean;
  children: TreeNode[];
}

export type ParsedCode = {
  isClientComponent: boolean;
  isAsyncComponent: boolean;
  imports: string[];
  hooks: string[];
  componentName: string;
};
