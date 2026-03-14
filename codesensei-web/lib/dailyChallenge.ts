// lib/dailyChallenge.ts
// Manages the Daily Challenge — one task per day with 2× XP bonus.

const KEY = "cs_daily";

export interface DailyChallenge {
  date: string;        // YYYY-MM-DD
  topic: string;
  taskText: string;
  completed: boolean;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDailyChallenge(): DailyChallenge | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyChallenge;
    // Expire if from a previous day
    if (parsed.date !== today()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDailyChallenge(topic: string, taskText: string): DailyChallenge {
  const challenge: DailyChallenge = { date: today(), topic, taskText, completed: false };
  try {
    localStorage.setItem(KEY, JSON.stringify(challenge));
  } catch { /* silently fail */ }
  return challenge;
}

export function isDailyChallengeComplete(): boolean {
  return getDailyChallenge()?.completed === true;
}

export function markDailyChallengeComplete(): void {
  try {
    const challenge = getDailyChallenge();
    if (!challenge) return;
    localStorage.setItem(KEY, JSON.stringify({ ...challenge, completed: true }));
  } catch { /* silently fail */ }
}
