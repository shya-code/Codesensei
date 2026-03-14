// lib/types.ts
// All TypeScript interfaces for CodeSensei. All named exports.

export interface Progress {
  language: string;
  currentTopic: string;
  currentMode: "tutor" | "diagnosis";
  xp: number;
  level: number;
  levelName: string;
  streak: number;
  lastActiveDate: string;
  topicsCompleted: string[];
  badges: string[];
  attemptHistory: Record<string, number>;
  rivalGhost: {
    lastWeekXP: number;
    lastWeekTopics: number;
    lastWeekHints: number;
  };
}

export interface WeaknessProfile {
  concepts: Record<
    string,
    {
      attempts: number;
      failures: number;
      consecutiveCorrect: number;   // reset to 0 on any failure; 3+ → "strong"
      trend: "strong" | "improving" | "stuck";
      lastMistake: string;
      tasksSolved?: number;
      tasksFailed?: number;
    }
  >;
  recurringPatterns: string[];       // concept keys that have hit the failure threshold
  astPatternFailures: Record<string, number>; // e.g. { "boundary": 4, "bare_except": 2 }
}

export interface MistakeEntry {
  date: string;
  topic: string;
  code: string;
  mistake: string;
  explanation: string;
}

export interface Topic {
  id: string;
  name: string;
  concept: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  difficultyDots: number; // 1, 2, or 3
}

export interface ASTNode {
  id: string;
  type: string;
  line: number | null;
  hasIssue: boolean;
  issueType: string | null;
  label: string;
}

export interface ASTData {
  nodes: ASTNode[];
  edges: Array<{ source: string; target: string }>;
  issues: string[];
}

export interface DiagnosisResult {
  astData: ASTData;
  diagnosisText: string; // empty until AI call, populated after
}

export interface ReviewResult {
  verdict: "CORRECT" | "INCORRECT" | "PENDING";
  reviewText: string;
  astData: ASTData;
}
