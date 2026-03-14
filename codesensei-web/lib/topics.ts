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

// ─── Curriculum map ───────────────────────────────────────────────────────────

export const CURRICULUM_ORDER: string[] = [
  "variables",
  "lists",
  "loops",
  "functions",
  "string_indexing",
  "dictionaries",
  "array_boundaries",
  "sorting",
  "recursion",
  "nested_loops",
  "comprehensions",
];

export const ALLOWED_SYNTAX: Record<string, string[]> = {
  variables: [
    "variable assignment with =",
    "print() with comma-separated values",
    "string values with quotes",
    "integer and float values",
    "basic arithmetic: + - * /",
    "NO f-strings",
    "NO string formatting",
    "NO functions",
    "NO loops",
    "NO lists",
  ],
  lists: [
    "everything from variables",
    "list creation with []",
    "list indexing with [0], [1] etc",
    "len() function",
    "list.append()",
    "NO loops yet — access items by index only",
    "NO f-strings",
    "NO functions",
  ],
  loops: [
    "everything from variables and lists",
    "for item in list",
    "for i in range(n)",
    "while condition",
    "print() inside loops",
    "basic counter variables",
    "NO functions",
    "NO f-strings",
    "NO list comprehensions",
  ],
  functions: [
    "everything from variables, lists, loops",
    "def function_name(parameters):",
    "return statement",
    "calling a function",
    "NO default arguments",
    "NO *args or **kwargs",
    "NO lambda",
    "NO decorators",
  ],
  string_indexing: [
    "everything from variables, lists, loops, functions",
    "string[index] to get a character",
    "string[start:end] slicing",
    "len() on strings",
    "string + string concatenation",
    "f-strings: f'Hello {name}'",
    "str.upper(), str.lower(), str.strip()",
    "NO regex",
    "NO string.format()",
  ],
  dictionaries: [
    "everything up to string_indexing",
    "dict creation with {}",
    "dict[key] to get a value",
    "dict[key] = value to add/update",
    "key in dict to check existence",
    "for key in dict to loop over keys",
    "NO nested dicts for beginner",
    "NO dict comprehensions",
  ],
  array_boundaries: [
    "everything up to dictionaries",
    "list indexing and slicing",
    "range(len(list)) and why to avoid it",
    "enumerate() for index + value",
    "list[-1] for last element",
  ],
  sorting: [
    "everything up to array_boundaries",
    "list.sort()",
    "sorted(list)",
    "sorted(list, reverse=True)",
    "NO key= parameter for beginner",
    "NO lambda in sort",
  ],
  recursion: [
    "everything up to sorting",
    "def function that calls itself",
    "base case with if",
    "recursive case",
    "NO memoization for beginner",
    "NO mutual recursion",
  ],
  nested_loops: [
    "everything up to recursion",
    "for loop inside a for loop",
    "two loop variables",
    "break and continue",
    "NO more than 2 levels of nesting",
  ],
  comprehensions: [
    "everything up to nested_loops",
    "list comprehension: [x for x in list]",
    "filtered comprehension: [x for x in list if condition]",
    "dict comprehension: {k: v for k, v in items}",
    "NO nested comprehensions for beginner",
  ],
};

export const TOPIC_PREREQUISITES: Record<string, string[]> = {
  variables:        [],
  lists:            ["variables"],
  loops:            ["variables", "lists"],
  functions:        ["variables", "loops"],
  string_indexing:  ["variables", "loops", "functions"],
  dictionaries:     ["variables", "loops", "functions"],
  array_boundaries: ["variables", "lists", "loops"],
  sorting:          ["lists", "loops", "array_boundaries"],
  recursion:        ["functions", "loops"],
  nested_loops:     ["loops", "functions"],
  comprehensions:   ["loops", "lists", "functions"],
};

export const CONCEPT_TASK_SHAPES: Record<string, string> = {
  variables:
    "Store 2-4 values in variables using = and print them with print(). No functions, no loops, no f-strings, no lists.",
  lists:
    "Create a list, access items by index, use len() or append(). No loops — access items directly by position.",
  loops:
    "Print a sequence, count something, or process a list with a for loop. No functions required.",
  functions:
    "Write one function with 1-2 parameters that returns or prints one result. Call it once with example values.",
  string_indexing:
    "Get characters from a string by index, slice a part of it, or use f-strings to format output. Use a hardcoded string.",
  dictionaries:
    "Create a dictionary, look up a value by key, add a new key, or loop over keys. No nesting.",
  array_boundaries:
    "Access items in a list safely — get the first, last, or a range of items without going out of bounds.",
  sorting:
    "Sort a small hardcoded list using sort() or sorted(). Print the before and after.",
  recursion:
    "Write a function that calls itself to solve factorial or countdown. Include a clear base case.",
  nested_loops:
    "Print a grid, pattern, or multiplication table using two for loops.",
  comprehensions:
    "Take a simple for loop that builds a list and rewrite it as a one-line list comprehension.",
};
