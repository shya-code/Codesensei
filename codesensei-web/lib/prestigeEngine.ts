// lib/prestigeEngine.ts
// Prestige system — at Legend level, reset XP but keep badges/streak.
// Unlocks harder "prestige" task prompts and a star icon.

import { getProgress, saveProgress } from "./storage";
import { LEVELS } from "./constants";

const LEGEND_LEVEL = LEVELS.length - 1; // index of Legend

/** Returns true if the player is at max level and can prestige */
export function canPrestige(): boolean {
  try {
    return getProgress().level >= LEGEND_LEVEL;
  } catch {
    return false;
  }
}

/** Returns current prestige count (0 if never prestiged) */
export function getPrestigeCount(): number {
  try {
    const p = getProgress();
    return (p as any).prestige ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Resets XP to 0, increments prestige counter.
 * Preserves: badges, streak, topicsCompleted, history.
 */
export function applyPrestige(): void {
  try {
    const progress = getProgress();
    const newPrestige = ((progress as any).prestige ?? 0) + 1;
    saveProgress({
      ...progress,
      xp: 0,
      level: 0,
      levelName: LEVELS[0].name,
      prestige: newPrestige,
    } as any);
  } catch { /* silently fail */ }
}
