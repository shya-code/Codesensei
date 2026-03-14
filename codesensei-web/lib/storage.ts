// lib/storage.ts
// ALL localStorage access lives here. No other file touches localStorage.

import { Progress, WeaknessProfile, MistakeEntry } from "./types";
import { XP, LEVELS, AST_PATTERN_FAILURE_THRESHOLD, STRENGTH_CONSECUTIVE_THRESHOLD } from "./constants";

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_PROGRESS: Progress = {
  language: "python",
  currentTopic: "",
  currentMode: "tutor",
  xp: 0,
  level: 0,
  levelName: "Novice",
  streak: 0,
  lastActiveDate: "",
  topicsCompleted: [],
  badges: [],
  attemptHistory: {},
  rivalGhost: {
    lastWeekXP: 0,
    lastWeekTopics: 0,
    lastWeekHints: 0,
  },
};

export const DEFAULT_WEAKNESS: WeaknessProfile = {
  concepts: {},
  recurringPatterns: [],
  astPatternFailures: {},
};

// ─── Progress ────────────────────────────────────────────────────────────────

export function getProgress(): Progress {
  try {
    const raw = localStorage.getItem("cs_progress");
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed: Partial<Progress> = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem("cs_progress", JSON.stringify(p));
  } catch {
    // silently fail
  }
}

// ─── Weakness ─────────────────────────────────────────────────────────────────

export function getWeakness(): WeaknessProfile {
  try {
    const raw = localStorage.getItem("cs_weakness");
    if (!raw) return { ...DEFAULT_WEAKNESS, concepts: {}, recurringPatterns: [] };
    return JSON.parse(raw) as WeaknessProfile;
  } catch {
    return { ...DEFAULT_WEAKNESS, concepts: {}, recurringPatterns: [] };
  }
}

export function saveWeakness(w: WeaknessProfile): void {
  try {
    localStorage.setItem("cs_weakness", JSON.stringify(w));
  } catch {
    // silently fail
  }
}

// ─── Mistakes ────────────────────────────────────────────────────────────────

export function getMistakes(): MistakeEntry[] {
  try {
    const raw = localStorage.getItem("cs_mistakes");
    if (!raw) return [];
    return JSON.parse(raw) as MistakeEntry[];
  } catch {
    return [];
  }
}

export function addMistake(entry: MistakeEntry): void {
  try {
    const existing = getMistakes();
    const updated = [entry, ...existing].slice(0, 50);
    localStorage.setItem("cs_mistakes", JSON.stringify(updated));
  } catch {
    // silently fail
  }
}

// ─── Lesson Cache ─────────────────────────────────────────────────────────────

export function getCachedLesson(topic: string): string | null {
  try {
    const raw = localStorage.getItem("cs_lessons");
    if (!raw) return null;
    const lessons: Record<string, string> = JSON.parse(raw);
    return lessons[topic] ?? null;
  } catch {
    return null;
  }
}

export function cacheLesson(topic: string, content: string): void {
  try {
    const raw = localStorage.getItem("cs_lessons");
    const lessons: Record<string, string> = raw ? JSON.parse(raw) : {};
    lessons[topic] = content;
    localStorage.setItem("cs_lessons", JSON.stringify(lessons));
  } catch {
    // silently fail
  }
}

// ─── XP ───────────────────────────────────────────────────────────────────────

export function addXP(
  amount: number
): { newXP: number; leveledUp: boolean; newLevelName: string } {
  const progress = getProgress();
  const newXP = Math.max(0, progress.xp + amount);

  let newLevel = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i].threshold <= newXP) newLevel = i;
    else break;
  }

  const leveledUp = newLevel > progress.level;
  const newLevelName = LEVELS[newLevel].name;

  saveProgress({
    ...progress,
    xp: newXP,
    level: newLevel,
    levelName: newLevelName,
  });

  return { newXP, leveledUp, newLevelName };
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export function updateStreak(): void {
  const progress = getProgress();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if (progress.lastActiveDate === today) return;

  let streak = progress.streak;

  if (progress.lastActiveDate) {
    const last = new Date(progress.lastActiveDate);
    const now = new Date(today);
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
      addXP(XP.STREAK_BONUS);
    } else if (diffDays >= 3) {
      streak = 1;
      addXP(XP.COMEBACK_BONUS);
    } else {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  // Re-fetch progress after potential addXP mutations
  const refreshed = getProgress();
  saveProgress({ ...refreshed, streak, lastActiveDate: today });
}

// ─── Weakness Update ──────────────────────────────────────────────────────────

/**
 * Call this after EVERY task review (both CORRECT and INCORRECT).
 *
 * @param concept       — topic concept key (e.g. "loops", "recursion")
 * @param passed        — true if verdict was CORRECT
 * @param mistake       — short description of the error (from review text)
 * @param astPatterns   — AST pattern IDs detected this attempt (e.g. ["boundary", "bare_except"])
 */
export function updateWeakness(
  concept: string,
  passed: boolean,
  mistake?: string,
  astPatterns?: string[]
): void {
  try {
    const weakness = getWeakness();

    // ── Per-concept tracking ───────────────────────────────────────────────────
    const existing = weakness.concepts[concept] ?? {
      attempts: 0,
      failures: 0,
      consecutiveCorrect: 0,
      trend: "improving" as const,
      lastMistake: "",
    };

    existing.attempts += 1;

    if (passed) {
      existing.consecutiveCorrect = (existing.consecutiveCorrect ?? 0) + 1;
      // 3+ consecutive correct → force "strong" regardless of historical rate
      if (existing.consecutiveCorrect >= STRENGTH_CONSECUTIVE_THRESHOLD) {
        existing.trend = "strong";
      }
    } else {
      existing.failures += 1;
      existing.consecutiveCorrect = 0; // reset streak on any failure
      if (mistake) existing.lastMistake = mistake;
    }

    // Re-compute trend from failure rate (only if haven't hit consecutive threshold)
    if (existing.consecutiveCorrect < STRENGTH_CONSECUTIVE_THRESHOLD) {
      const failureRate = existing.attempts > 0
        ? existing.failures / existing.attempts
        : 0;
      if (failureRate < 0.3) {
        existing.trend = "strong";
      } else if (failureRate > 0.6) {
        existing.trend = "stuck";
      } else {
        existing.trend = "improving";
      }
    }

    weakness.concepts[concept] = existing;

    // Add concept to recurringPatterns if failure rate is high enough
    if (
      existing.failures >= 3 &&
      existing.trend === "stuck" &&
      !weakness.recurringPatterns.includes(concept)
    ) {
      weakness.recurringPatterns.push(concept);
    }
    // Remove from recurringPatterns if they've turned it around
    if (existing.trend === "strong") {
      weakness.recurringPatterns = weakness.recurringPatterns.filter(
        (p) => p !== concept
      );
    }

    // ── Per-AST-pattern tracking ───────────────────────────────────────────────
    if (!passed && astPatterns && astPatterns.length > 0) {
      weakness.astPatternFailures = weakness.astPatternFailures ?? {};
      for (const pattern of astPatterns) {
        const current = (weakness.astPatternFailures[pattern] ?? 0) + 1;
        weakness.astPatternFailures[pattern] = current;
        // Auto-add pattern to recurringPatterns when threshold hit
        if (
          current >= AST_PATTERN_FAILURE_THRESHOLD &&
          !weakness.recurringPatterns.includes(pattern)
        ) {
          weakness.recurringPatterns.push(pattern);
        }
      }
    }

    saveWeakness(weakness);

    // Record activity for the heatmap
    recordActivity();

    // ── Auto-log mistake entry ─────────────────────────────────────────────────
    if (!passed && mistake) {
      addMistake({
        date: new Date().toISOString(),
        topic: concept,
        code: "",  // code is passed separately by caller when available
        mistake: mistake.slice(0, 300),
        explanation: astPatterns?.join("; ") ?? "",
      });
    }
  } catch {
    // silently fail
  }
}

/**
 * Convenience: log a full mistake with the student's code.
 * Call this from TutorMode when you have the code available.
 */
export function logMistakeWithCode(
  concept: string,
  code: string,
  mistake: string,
  astPatterns: string[]
): void {
  try {
    addMistake({
      date: new Date().toISOString(),
      topic: concept,
      code: code.slice(0, 1000),
      mistake: mistake.slice(0, 300),
      explanation: astPatterns.join("; "),
    });
  } catch {
    // silently fail
  }
}

// ─── Activity Tracker ─────────────────────────────────────────────────────────

export function getActivityHeatmap(): Record<string, number> {
  try {
    const raw = localStorage.getItem("cs_activity");
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function recordActivity(): void {
  try {
    const activity = getActivityHeatmap();
    const today = new Date().toISOString().split("T")[0];
    activity[today] = (activity[today] || 0) + 1;
    localStorage.setItem("cs_activity", JSON.stringify(activity));
  } catch {
    // silently fail
  }
}

// ─── Recurring Patterns ───────────────────────────────────────────────────────

export function getRecurringPatterns(): string[] {
  return getWeakness().recurringPatterns;
}
