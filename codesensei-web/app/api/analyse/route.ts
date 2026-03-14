// DIAGNOSIS MODE — STATIC ANALYSIS ONLY
// This route does NOT execute student code. Ever.
// Flow:
//   1. POST to Railway Python backend → receives AST tree + static pattern findings
//   2. POST to Groq with the code + AST findings → streams conceptual diagnosis
//   3. Returns combined stream: first chunk = AST JSON, then AI diagnosis text
//
// Response stream format:
//   Chunk 1: __AST_DATA__{"astData":{...},"staticIssues":[...]}__END_AST__\n
//   Chunks 2..N: streaming AI diagnosis text
//
// If Railway is unreachable: continue with AI-only diagnosis (no AST data, empty issues)
// Partial results are better than a failure screen.

import Groq from "groq-sdk";
import { diagnosisPrompt } from "@/lib/prompts";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 700;
const BACKEND_TIMEOUT_MS = 6000;
const AST_DATA_PREFIX = "__AST_DATA__";
const AST_DATA_SUFFIX = "__END_AST__";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const code: string = body.code ?? "";
    const description: string = body.description ?? "";
    const weaknessHistory: string[] = body.weaknessHistory ?? [];

    if (!code) {
      return Response.json({ error: "code is required" }, { status: 400 });
    }

    // ── STEP 1: Call Railway backend for AST data ─────────────────────────────
    let astData: { nodes: unknown[]; edges: unknown[] } = { nodes: [], edges: [] };
    let staticIssues: string[] = [];

    try {
      const backendResponse = await fetch(
        `${process.env.RAILWAY_BACKEND_URL}/analyse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, description }),
          signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
        }
      );

      if (backendResponse.ok) {
        const backendJson = await backendResponse.json();
        astData = backendJson.ast_data ?? { nodes: [], edges: [] };
        staticIssues = backendJson.static_issues ?? [];
      }
    } catch (backendError) {
      // Railway backend unreachable — continuing with AI-only diagnosis.
      // Empty AST data means the D3 tree shows nothing, but the AI can still
      // diagnose from the code text alone — partial results beat a failure screen.
      console.warn(
        "Railway backend unreachable — continuing with AI-only diagnosis",
        backendError
      );
    }

    // ── STEP 2: Build diagnosis prompt ────────────────────────────────────────
    const prompt = diagnosisPrompt({
      code,
      description,
      astIssues: staticIssues,
      weaknessHistory,
    });

    // ── STEP 3: Build combined ReadableStream ─────────────────────────────────
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // First chunk: AST payload — must arrive before AI text so the frontend
        // can render the D3 tree instantly while AI streams in.
        const astPayload =
          AST_DATA_PREFIX +
          JSON.stringify({ astData, staticIssues }) +
          AST_DATA_SUFFIX +
          "\n";
        controller.enqueue(encoder.encode(astPayload));

        // Subsequent chunks: streaming Groq diagnosis
        try {
          const streamResponse = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            stream: true,
            max_tokens: MAX_TOKENS,
          });

          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (e: any) {
          console.error("Groq stream error in /api/analyse:", e);
          controller.enqueue(encoder.encode(`\n\n[API Error: ${e.message || "Failed to generate diagnosis"}]`));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[/api/analyse] Error:", error);
    return Response.json(
      { error: "Analysis failed. Check API keys and Railway deployment status." },
      { status: 500 }
    );
  }
}
