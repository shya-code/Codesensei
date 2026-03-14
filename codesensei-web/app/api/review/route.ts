// Uses Groq — reviews submitted code in tutor mode
// IMPORTANT: First line of stream is always exactly:
//   VERDICT: CORRECT
//   or VERDICT: INCORRECT
// Frontend parses this line to determine which state to show

import Groq from "groq-sdk";
import { reviewPrompt } from "@/lib/prompts";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 1024;

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const task: string = body.task ?? "";
    const code: string = body.code ?? "";
    const weaknessHistory: string[] = body.weaknessHistory ?? [];

    if (!task || !code) {
      return Response.json({ error: "task and code are required" }, { status: 400 });
    }

    const prompt = reviewPrompt({ task, code, weaknessHistory });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          let streamResponse;
          try {
            streamResponse = await groq.chat.completions.create({
              model: GROQ_MODEL,
              messages: [{ role: "user", content: prompt }],
              stream: true,
              max_tokens: MAX_TOKENS,
            });
          } catch (e: any) {
             if (e?.status === 429) {
               console.warn("[/api/review] Rate limit hit on 70b, falling back to llama-3.1-8b-instant");
               streamResponse = await groq.chat.completions.create({
                 model: "llama-3.1-8b-instant",
                 messages: [{ role: "user", content: prompt }],
                 stream: true,
                 max_tokens: MAX_TOKENS,
               });
             } else {
               throw e;
             }
          }
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (e: any) {
          console.error("Groq stream error in /api/review:", e);
          controller.enqueue(encoder.encode(`\n\n[API Error: ${e.message || "Failed to generate review"}]`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[/api/review] Error:", error);
    return Response.json(
      { error: "Code review failed. Verify your Groq API key in .env.local." },
      { status: 500 }
    );
  }
}
