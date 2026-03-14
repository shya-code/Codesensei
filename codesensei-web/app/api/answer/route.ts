// /api/answer — serves a teaching answer explanation after 3 failed attempts.
// Uses answerPrompt() from prompts.ts — NOT the diagnosis route.

import Groq from "groq-sdk";
import { answerPrompt } from "@/lib/prompts";

const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const task: string = body.task ?? "";
    const attempts: string[] = body.attempts ?? [];
    const mistakes: string[] = body.mistakes ?? [];

    if (!task) {
      return Response.json({ error: "task is required" }, { status: 400 });
    }

    const prompt = answerPrompt({ task, attempts, mistakes });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const streamResponse = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      max_tokens: 1200,
      temperature: 0.5,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            if (content) controller.enqueue(encoder.encode(content));
          }
        } catch (e: any) {
          console.error("Groq stream error in /api/answer:", e);
          controller.enqueue(encoder.encode(`\n\n[API Error: ${e.message || "Failed to generate answer"}]`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[/api/answer] Error:", error);
    return Response.json(
      { error: "Answer generation failed. Check your GROQ_API_KEY." },
      { status: 500 }
    );
  }
}
