// Lesson route — serves STATIC markdown from content/lessons/ first.
// Falls back to Groq AI generation only if no static file exists for the topic.

import { readFile } from "fs/promises";
import path from "path";
import Groq from "groq-sdk";
import { lessonPrompt } from "@/lib/prompts";

const GROQ_MODEL = "llama-3.3-70b-versatile";

// Map from topic concept key → filename in content/lessons/
const LESSON_FILE_MAP: Record<string, string> = {
  // ── Basics ──────────────────────────────────────────────
  hello_world:           "hello_world.md",
  variables:             "variables.md",
  lists:                 "lists.md",
  basic_operators:       "basic_operators.md",
  string_formatting:     "string_formatting.md",
  basic_string_ops:      "basic_string_operations.md",
  strings:               "basic_string_operations.md",  // alias
  conditions:            "conditions.md",
  loops:                 "loops.md",
  functions:             "functions.md",
  classes:               "classes_and_objects.md",
  classes_and_objects:   "classes_and_objects.md",
  dictionaries:          "dictionaries.md",
  modules:               "modules.md",
  modules_and_packages:  "modules.md",
  input_and_output:      "input_and_output.md",
  // ── Intermediate ────────────────────────────────────────
  string_indexing:       "string_indexing.md",
  array_boundaries:      "array_boundaries.md",
  off_by_one:            "off_by_one.md",
  sorting:               "sorting.md",
  searching:             "searching.md",
  recursion:             "recursion.md",
  base_cases:            "recursion.md",  // base cases are covered in recursion lesson
  exceptions:            "exceptions.md",
  exception_handling:    "exceptions.md",
  sets:                  "sets.md",
  generators:            "generators.md",
  lambda:                "lambda.md",
  // ── Advanced ────────────────────────────────────────────
  nested_loops:          "nested_loops.md",
  comprehensions:        "comprehensions.md",
  list_comprehensions:   "comprehensions.md",
};

// Clean up scraped content: strip ad banner images and duplicate H1 titles
function sanitizeLesson(content: string, topicName: string): string {
  return content
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)\n?/g, "")  // strip ad banners
    .replace(/\r\n/g, "\n")                            // normalise line endings
    .trim();
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const topic: string = body.topic ?? "";
    const level: string = body.level ?? "";
    const weaknessPatterns: string[] = body.weaknessPatterns ?? [];

    if (!topic || !level) {
      return Response.json({ error: "topic and level are required" }, { status: 400 });
    }

    // ── 1. Try to serve a static lesson file ──────────────────
    const filename = LESSON_FILE_MAP[topic] ?? `${topic}.md`;
    const lessonPath = path.join(process.cwd(), "content", "lessons", filename);

    try {
      const raw = await readFile(lessonPath, "utf-8");
      const cleaned = sanitizeLesson(raw, topic);

      // Return as a plain text response (no streaming needed for static content)
      return new Response(cleaned, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch {
      // File not found — fall through to AI generation
      console.warn(`[/api/lesson] No static file for "${topic}" (tried: ${filename}). Falling back to AI.`);
    }

    // ── 2. AI fallback (only when no static file exists) ──────
    const prompt = lessonPrompt({ topic, level, weaknessPatterns });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let streamResponse;
    try {
      streamResponse = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 1500,
        temperature: 0.7,
      });
    } catch (e: any) {
      if (e?.status === 429) {
        console.warn("[/api/lesson] Rate limit hit on 70b, falling back to llama-3.1-8b-instant");
        streamResponse = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          stream: true,
          max_tokens: 1500,
          temperature: 0.7,
        });
      } else {
        throw e;
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            if (content) controller.enqueue(encoder.encode(content));
          }
        } catch (e: any) {
          console.error("Groq stream error in /api/lesson:", e);
          controller.enqueue(encoder.encode(`\n\n[API Error: ${e.message || "Failed to generate lesson"}]`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error("[/api/lesson] Error:", error);
    return Response.json(
      { error: "Lesson generation failed. Check your GROQ_API_KEY in .env.local." },
      { status: 500 }
    );
  }
}
