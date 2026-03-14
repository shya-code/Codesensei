// Topics available in tutor mode
export interface TopicDef {
  id: string;
  name: string;
  concept: string;           // key used in /api/lesson, /api/task, prompts, etc.
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  difficultyDots: number;
  emoji: string;
  lessonFile?: string;       // filename inside content/lessons/ (optional — API auto-resolves)
}

export const TOPICS: TopicDef[] = [
  // ── Beginner ────────────────────────────────────────────────────────────────
  { id: "hello_world",   name: "Hello, World!",      concept: "hello_world",   description: "Your very first Python program",              difficulty: "beginner",     difficultyDots: 1, emoji: "👋", lessonFile: "hello_world.md" },
  { id: "variables",     name: "Variables & Types",  concept: "variables",     description: "Names that hold values in memory",            difficulty: "beginner",     difficultyDots: 1, emoji: "📦", lessonFile: "variables.md" },
  { id: "basic_ops",     name: "Basic Operators",    concept: "basic_operators",description: "Arithmetic, modulo, and concatenation",       difficulty: "beginner",     difficultyDots: 1, emoji: "➕", lessonFile: "basic_operators.md" },
  { id: "strings",       name: "Strings",            concept: "strings",       description: "Working with text data in Python",            difficulty: "beginner",     difficultyDots: 1, emoji: "🔤", lessonFile: "basic_string_operations.md" },
  { id: "string_fmt",    name: "String Formatting",  concept: "string_formatting",description: "Printing values with format specifiers",      difficulty: "beginner",     difficultyDots: 1, emoji: "🖨️", lessonFile: "string_formatting.md" },
  { id: "conditions",    name: "Conditions",         concept: "conditions",    description: "if, elif, else — making decisions",           difficulty: "beginner",     difficultyDots: 1, emoji: "🔀", lessonFile: "conditions.md" },
  { id: "loops",         name: "Loops",              concept: "loops",         description: "Repeating code the smart way",               difficulty: "beginner",     difficultyDots: 1, emoji: "🔁", lessonFile: "loops.md" },
  { id: "functions",     name: "Functions",          concept: "functions",     description: "Packaging code into reusable blocks",        difficulty: "beginner",     difficultyDots: 1, emoji: "🧩", lessonFile: "functions.md" },
  { id: "lists",         name: "Lists",              concept: "lists",         description: "Ordered collections you can modify",         difficulty: "beginner",     difficultyDots: 1, emoji: "📋", lessonFile: "lists.md" },
  { id: "dictionaries",  name: "Dictionaries",       concept: "dictionaries",  description: "Key-value stores for structured data",       difficulty: "beginner",     difficultyDots: 1, emoji: "📖", lessonFile: "dictionaries.md" },
  { id: "input_output",  name: "Input & Output",     concept: "input_and_output",description: "Reading input and printing formatted output", difficulty: "beginner",     difficultyDots: 1, emoji: "⌨️", lessonFile: "input_and_output.md" },
  { id: "classes",       name: "Classes & Objects",  concept: "classes",       description: "Templates for data + behaviour",             difficulty: "beginner",     difficultyDots: 2, emoji: "🏗️", lessonFile: "classes_and_objects.md" },
  // ── Intermediate ────────────────────────────────────────────────────────────
  { id: "string_idx",    name: "String Indexing",    concept: "string_indexing",description: "Slicing and indexing text",                  difficulty: "intermediate", difficultyDots: 2, emoji: "✂️", lessonFile: "string_indexing.md" },
  { id: "sets",          name: "Sets",               concept: "sets",          description: "Unique collections with set operations",     difficulty: "intermediate", difficultyDots: 2, emoji: "🔵", lessonFile: "sets.md" },
  { id: "generators",    name: "Generators",         concept: "generators",    description: "Lazy sequences that produce values on demand",difficulty: "intermediate", difficultyDots: 2, emoji: "⚙️", lessonFile: "generators.md" },
  { id: "lambda",        name: "Lambda Functions",   concept: "lambda",        description: "One-line anonymous functions",               difficulty: "intermediate", difficultyDots: 2, emoji: "λ",  lessonFile: "lambda.md" },
  { id: "exceptions",    name: "Exception Handling", concept: "exception_handling",description: "Gracefully catching and handling errors",   difficulty: "intermediate", difficultyDots: 2, emoji: "🚨", lessonFile: "exceptions.md" },
  { id: "searching",     name: "Searching",          concept: "searching",     description: "Finding items — linear and binary search",   difficulty: "intermediate", difficultyDots: 2, emoji: "🔍", lessonFile: "searching.md" },
  { id: "off_by_one",    name: "Off-By-One Errors",  concept: "off_by_one",    description: "The most common loop and index mistake",    difficulty: "intermediate", difficultyDots: 2, emoji: "🎯", lessonFile: "off_by_one.md" },
  { id: "sorting",       name: "Sorting",            concept: "sorting",       description: "Ordering data with algorithms",              difficulty: "intermediate", difficultyDots: 2, emoji: "📊", lessonFile: "sorting.md" },
  { id: "recursion",     name: "Recursion",          concept: "recursion",     description: "Functions that call themselves",             difficulty: "intermediate", difficultyDots: 2, emoji: "🌀", lessonFile: "recursion.md" },
  // ── Advanced ────────────────────────────────────────────────────────────────
  { id: "nested_loops",  name: "Nested Loops",       concept: "nested_loops",  description: "Loops inside loops — grids and matrices",   difficulty: "advanced",     difficultyDots: 3, emoji: "🔂", lessonFile: "nested_loops.md" },
  { id: "comprehensions",name: "Comprehensions",     concept: "comprehensions",description: "Pythonic one-liner list building",           difficulty: "advanced",     difficultyDots: 3, emoji: "⚡", lessonFile: "comprehensions.md" },
  { id: "base_cases",    name: "Base Cases",         concept: "base_cases",    description: "Stopping recursive functions correctly",    difficulty: "advanced",     difficultyDots: 3, emoji: "🛑", lessonFile: "recursion.md" },
];
