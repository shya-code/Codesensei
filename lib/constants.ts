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

export const LEVELS: { threshold: number; name: string }[] = [
  { threshold: 0,    name: "Novice" },
  { threshold: 300,  name: "Apprentice" },
  { threshold: 700,  name: "Practitioner" },
  { threshold: 1300, name: "Developer" },
  { threshold: 2100, name: "Engineer" },
  { threshold: 3200, name: "Architect" },
  { threshold: 5000, name: "Master" },
  { threshold: 8000, name: "Legend" },
];

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
