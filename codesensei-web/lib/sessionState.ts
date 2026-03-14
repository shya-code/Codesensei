// lib/sessionState.ts
// In-memory session state for the current browser tab. NOT localStorage.
// This module is designed to be used with React's useState hook.
//
// USAGE IN COMPONENT:
// import { SessionState, DEFAULT_SESSION_STATE, resetForNewTask, recordAttempt, recordHint } from '@/lib/sessionState'
// const [session, setSession] = useState<SessionState>(DEFAULT_SESSION_STATE)
// setSession(prev => recordAttempt(prev, code))
// All functions are pure — they take state and return new state. No mutation.

import { MAX_ATTEMPTS } from "./constants";

// ─── SessionState interface ───────────────────────────────────────────────────

export interface SessionState {
  mode: "tutor" | "diagnosis";
  currentTopic: string;
  currentTask: string;
  currentLesson: string;
  taskAttempts: number;
  hintsUsed: number;
  previousHints: string[];
  allAttemptCodes: string[];
  answerUnlocked: boolean; // true only after MAX_ATTEMPTS failures
  isStreaming: boolean; // true during any active API call
  lastReviewVerdict: "CORRECT" | "INCORRECT" | "PENDING" | null;
  diagnosisAstData: object | null; // D3 data from /api/analyse
  diagnosisIssues: string[]; // static issues from AST parser
  diagnosisDiagnosisText: string; // AI diagnosis text, streams in
  currentCode: string; // current editor content, synced on every edit
}

// ─── Default state ────────────────────────────────────────────────────────────

export const DEFAULT_SESSION_STATE: SessionState = {
  mode: "tutor",
  currentTopic: "",
  currentTask: "",
  currentLesson: "",
  taskAttempts: 0,
  hintsUsed: 0,
  previousHints: [],
  allAttemptCodes: [],
  answerUnlocked: false,
  isStreaming: false,
  lastReviewVerdict: null,
  diagnosisAstData: null,
  diagnosisIssues: [],
  diagnosisDiagnosisText: "",
  currentCode: "",
};

// ─── Pure state updaters ──────────────────────────────────────────────────────

export function resetForNewTask(state: SessionState): SessionState {
  return {
    ...state,
    taskAttempts: 0,
    hintsUsed: 0,
    previousHints: [],
    allAttemptCodes: [],
    answerUnlocked: false,
    lastReviewVerdict: null,
    currentTask: "",
    // Preserve: currentLesson, currentTopic, mode, currentCode
  };
}

export function recordAttempt(state: SessionState, code: string): SessionState {
  const newTaskAttempts = state.taskAttempts + 1;
  return {
    ...state,
    taskAttempts: newTaskAttempts,
    allAttemptCodes: [...state.allAttemptCodes, code],
    answerUnlocked: newTaskAttempts >= MAX_ATTEMPTS,
  };
}

export function recordHint(state: SessionState, hintText: string): SessionState {
  return {
    ...state,
    hintsUsed: state.hintsUsed + 1,
    previousHints: [...state.previousHints, hintText],
  };
}

export function setDiagnosisResults(
  state: SessionState,
  astData: object | null,
  issues: string[]
): SessionState {
  return {
    ...state,
    diagnosisAstData: astData,
    diagnosisIssues: issues,
  };
}

export function setStreaming(state: SessionState, isStreaming: boolean): SessionState {
  return { ...state, isStreaming };
}

export function setVerdict(
  state: SessionState,
  verdict: "CORRECT" | "INCORRECT" | "PENDING"
): SessionState {
  return { ...state, lastReviewVerdict: verdict };
}

export function updateCode(state: SessionState, code: string): SessionState {
  return { ...state, currentCode: code };
}
