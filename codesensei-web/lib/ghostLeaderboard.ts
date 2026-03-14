// lib/ghostLeaderboard.ts
// Manages a rolling history of weekly snapshots for the Ghost Leaderboard.
// Shows user ranked against their own past 4 weeks.

const KEY = "cs_weekly_history";
const MAX_ENTRIES = 4;

export interface WeekSnapshot {
  weekLabel: string; // e.g. "Mar 3 – Mar 9"
  xp: number;
  topics: number;
  hints: number;
}

export interface LeaderboardEntry extends WeekSnapshot {
  rank: number;
  isCurrentWeek: boolean;
}

export function getWeeklyHistory(): WeekSnapshot[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Push this week's snapshot into the rolling history. Call from snapshotWeeklyStats(). */
export function pushWeekSnapshot(snapshot: WeekSnapshot): void {
  try {
    const history = getWeeklyHistory();
    const updated = [snapshot, ...history].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch { /* silently fail */ }
}

/** Returns entries ranked by XP descending, current week labelled */
export function getGhostLeaderboard(currentWeekXP: number, currentWeekTopics: number): LeaderboardEntry[] {
  const history = getWeeklyHistory();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const label = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (This Week)`;

  const currentEntry: WeekSnapshot = {
    weekLabel: label,
    xp: currentWeekXP,
    topics: currentWeekTopics,
    hints: 0,
  };

  const allEntries = [currentEntry, ...history];
  const sorted = [...allEntries].sort((a, b) => b.xp - a.xp);

  return sorted.map((entry, i) => ({
    ...entry,
    rank: i + 1,
    isCurrentWeek: entry === allEntries[0],
  }));
}
