// lib/hintTokens.ts
// Daily hint token economy. 3 tokens per day, refill at midnight.

const KEY = "cs_hint_tokens";
const DAILY_TOKENS = 3;

interface HintTokenState {
  count: number;
  date: string; // YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function getState(): HintTokenState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { count: DAILY_TOKENS, date: today() };
    return JSON.parse(raw) as HintTokenState;
  } catch {
    return { count: DAILY_TOKENS, date: today() };
  }
}

function save(state: HintTokenState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* silently fail */ }
}

/** Call on mount — refills tokens if it's a new day */
export function refillIfNewDay(): void {
  const state = getState();
  if (state.date !== today()) {
    save({ count: DAILY_TOKENS, date: today() });
  }
}

/** Returns current token count */
export function getHintTokens(): number {
  refillIfNewDay();
  return getState().count;
}

/**
 * Tries to consume one hint token.
 * Returns true if successful, false if no tokens remaining.
 */
export function useHintToken(): boolean {
  refillIfNewDay();
  const state = getState();
  if (state.count <= 0) return false;
  save({ ...state, count: state.count - 1 });
  return true;
}
