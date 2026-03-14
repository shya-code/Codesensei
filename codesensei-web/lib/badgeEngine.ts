// lib/badgeEngine.ts
// Badge checking and awarding for CodeSensei.
// No API calls. Never crashes on missing/malformed progress data.

import { getProgress, saveProgress, getWeakness } from "./storage";

// ─── Badge definitions (not exported) ────────────────────────────────────────

const BADGE_DISPLAY: Record<string, { name: string; emoji: string }> = {
  first_solve:         { name: "First Blood",         emoji: "🩸" },
  no_hints_5:          { name: "No Lifelines",        emoji: "🎯" },
  streak_7:            { name: "Week Warrior",         emoji: "📅" },
  streak_30:           { name: "Month Master",         emoji: "🗓" },
  comeback:            { name: "Comeback Kid",         emoji: "🔄" },
  loop_lord:           { name: "Loop Lord",            emoji: "🔁" },
  recursion_survivor:  { name: "Recursion Survivor",   emoji: "🌀" },
  concept_cleaner:     { name: "Concept Cleaner",      emoji: "🧹" },
  // Gamification Expansion
  ghost_slayer:        { name: "Ghost Slayer",          emoji: "👻" },
  prestige_1:          { name: "First Prestige",        emoji: "⭐" },
  prestige_3:          { name: "Ascended",              emoji: "🌟" },
  beginner_cert:       { name: "Beginner Graduate",     emoji: "🎓" },
  intermediate_cert:   { name: "Intermediate Scholar",  emoji: "🏫" },
  advanced_cert:       { name: "Advanced Master",       emoji: "🏆" },
  flash_solver:        { name: "Flash Solver",          emoji: "⚡" },
  combo_master:        { name: "Combo Master",          emoji: "🔥" },
  comeback_kid:        { name: "Comeback Kid",          emoji: "💪" },
};

// ─── checkAndAwardBadges ──────────────────────────────────────────────────────

export function checkAndAwardBadges(): string[] {
  try {
    const progress = getProgress();
    const weakness = getWeakness();
    const existing = new Set(progress.badges);
    const newlyAwarded: string[] = [];

    const award = (id: string) => {
      if (!existing.has(id)) {
        newlyAwarded.push(id);
        existing.add(id);
      }
    };

    // first_solve — exactly one topic completed (just got their first)
    if (progress.topicsCompleted.length === 1) {
      award("first_solve");
    }

    // streak_7
    if (progress.streak >= 7) {
      award("streak_7");
    }

    // streak_30
    if (progress.streak >= 30) {
      award("streak_30");
    }

    // loop_lord — both loops and array_boundaries are "strong"
    const loopsConcept = weakness.concepts["loops"];
    const boundariesConcept = weakness.concepts["array_boundaries"];
    if (
      loopsConcept?.trend === "strong" &&
      boundariesConcept?.trend === "strong"
    ) {
      award("loop_lord");
    }

    // recursion_survivor — recursion is now strong but had failures (was struggling)
    const recursionConcept = weakness.concepts["recursion"];
    if (
      recursionConcept?.trend === "strong" &&
      recursionConcept?.failures >= 2
    ) {
      award("recursion_survivor");
    }

    // concept_cleaner — at least 5 concepts are "strong"
    const strongCount = Object.values(weakness.concepts).filter(
      (c) => c.trend === "strong"
    ).length;
    if (strongCount >= 5) {
      award("concept_cleaner");
    }

    // Save if anything new was awarded
    if (newlyAwarded.length > 0) {
      saveProgress({ ...progress, badges: Array.from(existing) });
    }

    return newlyAwarded;
  } catch {
    return [];
  }
}

// ─── awardBadge ──────────────────────────────────────────────────────────────

/**
 * Manually award a badge by ID.
 * Used for complex trigger conditions like "no_hints_5" and "comeback"
 * that require context the auto-checker doesn't have.
 * Returns false if the badge was already awarded.
 */
export function awardBadge(badgeId: string): boolean {
  try {
    const progress = getProgress();
    if (progress.badges.includes(badgeId)) return false;
    saveProgress({ ...progress, badges: [...progress.badges, badgeId] });
    return true;
  } catch {
    return false;
  }
}

// ─── getBadgeDisplay ─────────────────────────────────────────────────────────

export function getBadgeDisplay(badgeId: string): { name: string; emoji: string } {
  return BADGE_DISPLAY[badgeId] ?? { name: "Unknown Badge", emoji: "🏅" };
}
