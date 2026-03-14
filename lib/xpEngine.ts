// lib/xpEngine.ts
// XP calculation and level-up events for CodeSensei.
// All logic is client-safe. No API calls.

import { XP, LEVELS } from "./constants";
import { addXP, updateStreak, getProgress, saveProgress } from "./storage";

// ─── handleTaskSolved ─────────────────────────────────────────────────────────

export function handleTaskSolved(
  hintsUsed: number,
  attemptNumber: number
): {
  xpAwarded: number;
  hintsDeducted: number;
  leveledUp: boolean;
  newLevelName: string;
  totalXP: number;
} {
  // Base XP by attempt
  let base: number;
  if (attemptNumber === 1) {
    base = XP.SOLVE_FIRST_TRY;
  } else if (attemptNumber === 2) {
    base = XP.SOLVE_SECOND_TRY;
  } else if (attemptNumber === 3) {
    base = XP.SOLVE_THIRD_TRY;
  } else {
    base = XP.SOLVE_THIRD_TRY; // safe fallback
  }

  // Hint deduction — minimum 0
  const hintsDeducted = Math.max(0, hintsUsed * XP.HINT_PENALTY);

  // Final XP — always award at least 10 for trying
  const finalXP = Math.max(10, base - hintsDeducted);

  const { newXP, leveledUp, newLevelName } = addXP(finalXP);
  updateStreak();

  return {
    xpAwarded: finalXP,
    hintsDeducted,
    leveledUp,
    newLevelName,
    totalXP: newXP,
  };
}

// ─── handleAnswerRevealed ─────────────────────────────────────────────────────

export function handleAnswerRevealed(): {
  newXP: number;
  leveledUp: boolean;
  newLevelName: string;
} {
  return addXP(XP.ANSWER_REVEALED);
}

// ─── handleHintUsed ───────────────────────────────────────────────────────────

export function handleHintUsed(): { newXP: number } {
  const progress = getProgress();
  const newXP = Math.max(0, progress.xp - XP.HINT_PENALTY);
  saveProgress({ ...progress, xp: newXP });
  return { newXP };
}

// ─── getLevelProgress ─────────────────────────────────────────────────────────

export function getLevelProgress(): {
  currentXP: number;
  currentLevel: number;
  currentLevelName: string;
  nextLevelThreshold: number;
  nextLevelName: string;
  progressPercent: number;
} {
  const progress = getProgress();
  const currentXP = progress.xp;
  const currentLevel = progress.level;
  const currentLevelName = progress.levelName;

  const isMaxLevel = currentLevel >= LEVELS.length - 1;

  const currentThreshold = LEVELS[currentLevel].threshold;
  const nextLevelThreshold = isMaxLevel ? currentXP : LEVELS[currentLevel + 1].threshold;
  const nextLevelName = isMaxLevel ? "Maximum Level" : LEVELS[currentLevel + 1].name;

  let progressPercent: number;
  if (isMaxLevel) {
    progressPercent = 100;
  } else {
    const range = nextLevelThreshold - currentThreshold;
    const earned = currentXP - currentThreshold;
    progressPercent = range > 0 ? Math.round((earned / range) * 100) : 100;
    progressPercent = Math.max(0, Math.min(100, progressPercent));
  }

  return {
    currentXP,
    currentLevel,
    currentLevelName,
    nextLevelThreshold,
    nextLevelName,
    progressPercent,
  };
}
