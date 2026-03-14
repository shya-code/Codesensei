// lib/duelEngine.ts
// Manages Code Duel state — racing against an AI ghost time.

const KEY = "cs_duel_start";

export interface DuelResult {
  won: boolean;
  elapsedSeconds: number;
  ghostSeconds: number;
  timeDiff: number; // positive = faster than ghost, negative = slower
}

/** Start the duel timer (call when task is loaded) */
export function startDuel(): void {
  try {
    sessionStorage.setItem(KEY, Date.now().toString());
  } catch { /* silently fail */ }
}

/** End the duel and return result */
export function endDuel(ghostSeconds: number): DuelResult {
  try {
    const start = sessionStorage.getItem(KEY);
    const elapsedSeconds = start
      ? Math.floor((Date.now() - parseInt(start, 10)) / 1000)
      : Infinity;
    sessionStorage.removeItem(KEY);
    const won = elapsedSeconds < ghostSeconds;
    return {
      won,
      elapsedSeconds,
      ghostSeconds,
      timeDiff: ghostSeconds - elapsedSeconds,
    };
  } catch {
    return { won: false, elapsedSeconds: 0, ghostSeconds, timeDiff: -1 };
  }
}

/** Get elapsed seconds without ending the duel */
export function getDuelElapsed(): number {
  try {
    const start = sessionStorage.getItem(KEY);
    if (!start) return 0;
    return Math.floor((Date.now() - parseInt(start, 10)) / 1000);
  } catch {
    return 0;
  }
}

/** Returns the ghost time in seconds based on difficulty */
export function getGhostTime(difficulty: "beginner" | "intermediate" | "advanced"): number {
  if (difficulty === "beginner") return 180;    // 3 min
  if (difficulty === "intermediate") return 300; // 5 min
  return 480;                                    // 8 min
}
