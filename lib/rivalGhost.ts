// lib/rivalGhost.ts
// Rival ghost — compete against your own last week's performance.
// No API calls. Client-side only.

import { getProgress, saveProgress } from "./storage";

// ─── getRivalComparison ───────────────────────────────────────────────────────

export function getRivalComparison(): {
  lastWeek: { xp: number; topics: number; hints: number };
  thisWeek: { xp: number; topics: number; hints: number };
  isDoingBetter: boolean;
  message: string;
} {
  const progress = getProgress();

  const lastWeek = {
    xp: progress.rivalGhost.lastWeekXP,
    topics: progress.rivalGhost.lastWeekTopics,
    hints: progress.rivalGhost.lastWeekHints,
  };

  // thisWeek.topics = total topics completed
  const thisWeekTopics = progress.topicsCompleted.length;

  // thisWeek.hints = sum of all attempt counts in attemptHistory (rough proxy for hint usage)
  const thisWeekHints = Object.values(progress.attemptHistory).reduce(
    (sum, val) => sum + val,
    0
  );

  // thisWeek.xp = current total XP (approximate — good enough for hackathon)
  const thisWeekXP = progress.xp;

  const thisWeek = {
    xp: thisWeekXP,
    topics: thisWeekTopics,
    hints: thisWeekHints,
  };

  const isDoingBetter = thisWeek.topics >= lastWeek.topics;

  const topicDiff = thisWeek.topics - lastWeek.topics;
  let message: string;
  if (topicDiff > 0) {
    message = `↑ You've done ${topicDiff} more topic${topicDiff === 1 ? "" : "s"} than last week`;
  } else if (topicDiff === 0) {
    message = "↔ Matching last week's pace";
  } else {
    message = `↓ ${Math.abs(topicDiff)} fewer topic${Math.abs(topicDiff) === 1 ? "" : "s"} than last week — push through!`;
  }

  return { lastWeek, thisWeek, isDoingBetter, message };
}

// ─── snapshotWeeklyStats ──────────────────────────────────────────────────────

// Call this at start of each week or when user resets — for hackathon, call it manually or on a Monday check
export function snapshotWeeklyStats(): void {
  const progress = getProgress();

  const thisWeekTopics = progress.topicsCompleted.length;
  const thisWeekHints = Object.values(progress.attemptHistory).reduce(
    (sum, val) => sum + val,
    0
  );

  saveProgress({
    ...progress,
    rivalGhost: {
      lastWeekXP: progress.xp,
      lastWeekTopics: thisWeekTopics,
      lastWeekHints: thisWeekHints,
    },
  });
}
