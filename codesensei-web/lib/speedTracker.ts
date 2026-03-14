// lib/speedTracker.ts
// Tracks how long the student takes to solve a task.
// Stored in sessionStorage (not localStorage) — clears on tab close.

const KEY = "cs_task_start";

export function startTimer(): void {
  try {
    sessionStorage.setItem(KEY, Date.now().toString());
  } catch { /* silently fail */ }
}

export function getElapsedSeconds(): number {
  try {
    const start = sessionStorage.getItem(KEY);
    if (!start) return Infinity;
    return Math.floor((Date.now() - parseInt(start, 10)) / 1000);
  } catch {
    return Infinity;
  }
}

export function clearTimer(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch { /* silently fail */ }
}
