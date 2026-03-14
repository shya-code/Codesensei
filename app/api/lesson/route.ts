// Uses Gemini — lessons need quality and depth
// Check quota at aistudio.google.com/apikey

import { GoogleGenerativeAI } from "@google/generative-ai";
import { lessonPrompt } from "@/lib/prompts";

const GEMINI_MODEL = "gemini-2.0-flash";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const topic: string = body.topic ?? "";
    const level: string = body.level ?? "";
    const weaknessPatterns: string[] = body.weaknessPatterns ?? [];

    if (!topic || !level) {
      return Response.json({ error: "topic and level are required" }, { status: 400 });
    }

    const prompt = lessonPrompt({ topic, level, weaknessPatterns });

    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
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
      { error: "Lesson generation failed. Verify your Gemini API key in .env.local." },
      { status: 500 }
    );
  }
}
