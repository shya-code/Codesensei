// lib/constants.ts
// All configurable values for CodeSensei. Import from here — never hardcode elsewhere.

export const XP = {
  SOLVE_FIRST_TRY: 150,
  SOLVE_SECOND_TRY: 100,
  SOLVE_THIRD_TRY: 60,
  HINT_PENALTY: 15,
  ANSWER_REVEALED: 10,
  STREAK_BONUS: 25,
  COMEBACK_BONUS: 75,
} as const;

export const LEVELS: { threshold: number; name: string; icon: string }[] = [
  { threshold: 0,    name: "Novice",       icon: "🌱" },
  { threshold: 300,  name: "Apprentice",   icon: "📖" },
  { threshold: 700,  name: "Practitioner", icon: "⚙️" },
  { threshold: 1300, name: "Developer",    icon: "💻" },
  { threshold: 2100, name: "Engineer",     icon: "🔧" },
  { threshold: 3200, name: "Architect",    icon: "🏗️" },
  { threshold: 5000, name: "Master",       icon: "🎓" },
  { threshold: 8000, name: "Legend",       icon: "🏆" },
];

// Logging & tracking thresholds
export const AST_PATTERN_FAILURE_THRESHOLD = 5;  // hits before pattern → recurringPattern
export const STRENGTH_CONSECUTIVE_THRESHOLD = 3; // correct answers in a row → "strong"

export const CONCEPTS: string[] = [
  "variables",
  "loops",
  "functions",
  "lists",
  "strings",
  "dictionaries",
  "recursion",
  "sorting",
  "searching",
  "array_boundaries",
  "string_indexing",
  "off_by_one",
  "base_cases",
  "nested_loops",
  "comprehensions",
];

export const MAX_ATTEMPTS = 3;
export const HINT_COST = 15;

// ─ Gamification Expansion Constants ──────────────────────────────────

// Feature 2: Speed Bonus
export const SPEED_BONUS_XP = 20;
export const SPEED_BONUS_THRESHOLD_SECONDS = 300; // 5 minutes

// Feature 3: Combo Multiplier
export const COMBO_THRESHOLD = 3;
export const COMBO_MULTIPLIER = 1.5;

// Feature 7: Hint Token Economy
export const DAILY_HINT_TOKENS = 3;

// Feature 1: Daily Challenge
export const DAILY_BONUS_MULTIPLIER = 2;
export const DAILY_XP_SOLVE = 300; // 2x SOLVE_FIRST_TRY

// Feature 6: Mistake Recovery
export const RECOVERY_BONUS_XP = 50;

// Feature 10: Prestige
export const LEGEND_LEVEL_INDEX = 7; // LEVELS[7] = Legend
