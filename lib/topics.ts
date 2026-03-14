// lib/topics.ts
// Tutor mode topic bank — separate from diagnosis mode.

import { Topic } from "./types";

export const TOPICS: Topic[] = [
  {
    id: "loops_01",
    name: "Loops",
    concept: "loops",
    description: "Control flow using for and while",
    difficulty: "beginner",
    difficultyDots: 1,
  },
  {
    id: "functions_01",
    name: "Functions",
    concept: "functions",
    description: "Reusable blocks of code with parameters",
    difficulty: "beginner",
    difficultyDots: 1,
  },
  {
    id: "lists_01",
    name: "Lists & Arrays",
    concept: "lists",
    description: "Ordered collections and how to traverse them",
    difficulty: "beginner",
    difficultyDots: 1,
  },
  {
    id: "strings_01",
    name: "String Manipulation",
    concept: "string_indexing",
    description: "Working with text, indices, and slicing",
    difficulty: "beginner",
    difficultyDots: 2,
  },
  {
    id: "dicts_01",
    name: "Dictionaries",
    concept: "dictionaries",
    description: "Key-value pairs and lookup patterns",
    difficulty: "intermediate",
    difficultyDots: 2,
  },
  {
    id: "recursion_01",
    name: "Recursion",
    concept: "recursion",
    description: "Functions that call themselves to solve sub-problems",
    difficulty: "intermediate",
    difficultyDots: 2,
  },
  {
    id: "array_bound_01",
    name: "Array Boundaries",
    concept: "array_boundaries",
    description: "Indexing safely without off-by-one errors",
    difficulty: "intermediate",
    difficultyDots: 2,
  },
  {
    id: "sorting_01",
    name: "Sorting Algorithms",
    concept: "sorting",
    description: "Ordering elements — bubble, selection, merge",
    difficulty: "intermediate",
    difficultyDots: 2,
  },
  {
    id: "nested_01",
    name: "Nested Loops",
    concept: "nested_loops",
    description: "Loops within loops for 2D problems",
    difficulty: "advanced",
    difficultyDots: 3,
  },
  {
    id: "comprehensions_01",
    name: "Comprehensions",
    concept: "comprehensions",
    description: "Elegant one-line list and dict construction",
    difficulty: "advanced",
    difficultyDots: 3,
  },
];

export function getTopicsByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced"
): Topic[] {
  return TOPICS.filter((t) => t.difficulty === difficulty);
}
