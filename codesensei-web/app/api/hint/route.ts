// Uses Groq — hints must be near-instant for good UX
// Note: frontend should only call this after pyflakes passes (no syntax errors)

import Groq from "groq-sdk";
import { hintPrompt } from "@/lib/prompts";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 320; // hints are short — cap keeps them concise

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const task: string = body.task ?? "";
    const code: string = body.code ?? "";
    const attemptNumber: number = body.attemptNumber ?? 1;
    const previousHints: string[] = body.previousHints ?? [];
    const astContext: string = body.astContext ?? "";

    if (!task || !code) {
      return Response.json({ error: "task and code are required" }, { status: 400 });
    }

    const prompt = hintPrompt({ task, code, attemptNumber, previousHints, astContext });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
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
         console.warn("[/api/hint] Rate limit hit on 70b, falling back to llama-3.1-8b-instant");
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
          console.error("Groq stream error in /api/hint:", e);
          controller.enqueue(encoder.encode(`\n\n[API Error: ${e.message || "Failed to generate hint"}]`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[/api/hint] Error:", error);
    return Response.json(
      { error: "Hint generation failed. Verify your Groq API key in .env.local." },
      { status: 500 }
    );
  }
}
