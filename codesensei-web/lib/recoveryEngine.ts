// lib/recoveryEngine.ts
// Identifies "Unfinished Business" topics where the student has failed 3+ times
// and the concept trend is still NOT "strong".

import { getWeakness } from "./storage";

export interface UnfinishedTopic {
  concept: string;
  failures: number;
  trend: "stuck" | "improving";
}

/** Returns topics with 3+ failures that haven't been mastered yet */
export function getUnfinishedTopics(): UnfinishedTopic[] {
  try {
    const weakness = getWeakness();
    return Object.entries(weakness.concepts)
      .filter(([, data]) => data.failures >= 3 && data.trend !== "strong")
      .map(([concept, data]) => ({
        concept,
        failures: data.failures,
        trend: data.trend as "stuck" | "improving",
      }))
      .sort((a, b) => b.failures - a.failures);
  } catch {
    return [];
  }
}

const RECOVERED_KEY = "cs_recovered";

/** Marks a concept as recovered (student solved in recovery mode) */
export function markRecovered(concept: string): void {
  try {
    const raw = localStorage.getItem(RECOVERED_KEY);
    const recovered: string[] = raw ? JSON.parse(raw) : [];
    if (!recovered.includes(concept)) {
      recovered.push(concept);
      localStorage.setItem(RECOVERED_KEY, JSON.stringify(recovered));
    }
  } catch { /* silently fail */ }
}

export function getRecoveredConcepts(): string[] {
  try {
    const raw = localStorage.getItem(RECOVERED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
