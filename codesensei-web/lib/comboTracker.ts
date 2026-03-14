// lib/comboTracker.ts
// Tracks consecutive correct solves (no hints) for the XP combo multiplier.

const KEY = "cs_combo";

interface ComboState {
  streak: number;
  multiplierActive: boolean;
}

const DEFAULT: ComboState = { streak: 0, multiplierActive: false };

export function getComboState(): ComboState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    return JSON.parse(raw) as ComboState;
  } catch {
    return { ...DEFAULT };
  }
}

function save(state: ComboState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* silently fail */ }
}

/** Call after a CORRECT solve with 0 hints used */
export function incrementCombo(): ComboState {
  const state = getComboState();
  const newStreak = state.streak + 1;
  const multiplierActive = newStreak >= 3;
  const next = { streak: newStreak, multiplierActive };
  save(next);
  return next;
}

/** Call after a INCORRECT solve or when a hint is used */
export function resetCombo(): void {
  save({ streak: 0, multiplierActive: false });
}

/** Returns 1.5 if combo is active, otherwise 1 */
export function getComboMultiplier(): number {
  return getComboState().multiplierActive ? 1.5 : 1;
}
