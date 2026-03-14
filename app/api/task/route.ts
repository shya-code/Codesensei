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
    const streamResponse = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      max_tokens: MAX_TOKENS,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content ?? "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
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
