// lib/skillTree.ts
// Defines the prerequisite dependency graph for the Skill Tree view.
// Each entry: { from: prerequisite concept, to: unlocks concept }

export interface SkillEdge {
  from: string;
  to: string;
}

/** Prerequisite relationships between concepts */
export const SKILL_TREE_EDGES: SkillEdge[] = [
  { from: "variables",       to: "strings" },
  { from: "variables",       to: "lists" },
  { from: "variables",       to: "loops" },
  { from: "strings",         to: "string_indexing" },
  { from: "lists",           to: "array_boundaries" },
  { from: "lists",           to: "sorting" },
  { from: "lists",           to: "searching" },
  { from: "loops",           to: "nested_loops" },
  { from: "loops",           to: "comprehensions" },
  { from: "loops",           to: "off_by_one" },
  { from: "variables",       to: "conditions" },
  { from: "conditions",      to: "functions" },
  { from: "functions",       to: "recursion" },
  { from: "recursion",       to: "base_cases" },
  { from: "variables",       to: "dictionaries" },
  { from: "strings",         to: "string_formatting" },
];

/** Root concepts (no prerequisites) */
export const SKILL_ROOTS = ["variables"];

/**
 * Given a list of completed concept IDs, returns which concepts are currently unlocked.
 * A concept is unlocked if:
 *   - it's a root concept, OR
 *   - at least one of its prerequisites is completed
 */
export function getUnlockedConcepts(completed: string[]): string[] {
  const completedSet = new Set(completed);
  const unlockedByEdge = new Set(SKILL_ROOTS);

  for (const edge of SKILL_TREE_EDGES) {
    if (completedSet.has(edge.from)) {
      unlockedByEdge.add(edge.to);
    }
  }

  return Array.from(unlockedByEdge);
}

/** Returns all concept IDs referenced in the tree */
export function getAllTreeConcepts(): string[] {
  const all = new Set<string>(SKILL_ROOTS);
  for (const edge of SKILL_TREE_EDGES) {
    all.add(edge.from);
    all.add(edge.to);
  }
  return Array.from(all);
}
