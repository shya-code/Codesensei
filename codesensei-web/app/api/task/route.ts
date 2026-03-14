// Uses Groq — fast response for live demo feel

import Groq from "groq-sdk";
import { taskPrompt } from "@/lib/prompts";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 1024;

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const topic: string = body.topic ?? "";
    const level: string = body.level ?? "";
    const completedTopics: string[] = body.completedTopics ?? [];

    if (!topic || !level) {
      return Response.json({ error: "topic and level are required" }, { status: 400 });
    }

    const prompt = taskPrompt({ topic, level, completedTopics });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    let streamResponse;
    try {
      streamResponse = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: MAX_TOKENS,
      });
    } catch (error: any) {
      if (error?.status === 429) {
        console.warn("[/api/task] Rate limit hit on 70b, falling back to llama-3.1-8b-instant");
        streamResponse = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          stream: true,
          max_tokens: MAX_TOKENS,
        });
      } else {
        throw error;
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (e: any) {
          console.error("Groq stream error in /api/task:", e);
          controller.enqueue(encoder.encode(`\n\n[API Error: ${e.message || "Failed to generate task"}]`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[/api/task] Error:", error);
    return Response.json(
      { error: "Task generation failed. Verify your Groq API key in .env.local." },
      { status: 500 }
    );
  }
}
