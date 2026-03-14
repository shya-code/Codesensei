// app/api/daily/route.ts
// Daily challenge endpoint — generates one task per day seeded by date.
// Picks topic deterministically from date so same topic all day.

import Groq from "groq-sdk";
import { taskPrompt } from "@/lib/prompts";
import { TOPICS } from "@/lib/topics-data";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 1024;

function getTopicForToday(): { topic: string; level: string } {
  // Seed by day-of-year for consistent daily topic
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const topic = TOPICS[dayOfYear % TOPICS.length];
  return { topic: topic.concept, level: topic.difficulty };
}

export async function POST(): Promise<Response> {
  try {
    const { topic, level } = getTopicForToday();
    const prompt = taskPrompt({ topic, level, completedTopics: [] });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let streamResponse;
    try {
      streamResponse = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: `DAILY CHALLENGE (2× XP reward):\n${prompt}` }],
        stream: true,
        max_tokens: MAX_TOKENS,
      });
    } catch (e: any) {
      if (e?.status === 429) {
        console.warn("[/api/daily] Rate limit hit on 70b, falling back to llama-3.1-8b-instant");
        streamResponse = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: `DAILY CHALLENGE (2× XP reward):\n${prompt}` }],
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
        // Prefix with topic metadata so client can display it
        controller.enqueue(encoder.encode(`__DAILY_TOPIC__${topic}__END_TOPIC__\n`));
        try {
          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            if (content) controller.enqueue(encoder.encode(content));
          }
        } catch (e: any) {
          controller.enqueue(encoder.encode(`\n\n[Error: ${e.message}]`));
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error) {
    console.error("[/api/daily] Error:", error);
    return Response.json({ error: "Daily challenge generation failed." }, { status: 500 });
  }
}
