// lib/streamParser.ts
// Parses streamed responses from CodeSensei API routes.
// No external library imports. Pure functions only. All JSON.parse calls are try/catch protected.
//
// Import: import { parseAnalysisStream, parseReviewVerdict, getReviewBody, streamChunks, streamToString, streamAnalysis } from '@/lib/streamParser'

// These constants match the ones defined in app/api/analyse/route.ts
// If you change them there, change them here too.
const AST_DATA_PREFIX = "__AST_DATA__";
const AST_DATA_SUFFIX = "__END_AST__";

// ─── parseAnalysisStream ──────────────────────────────────────────────────────

export function parseAnalysisStream(fullText: string): {
  astData: object | null;
  staticIssues: string[];
  diagnosisText: string;
} {
  if (!fullText.includes(AST_DATA_PREFIX)) {
    // No AST chunk present — treat entire text as diagnosis text
    return { astData: null, staticIssues: [], diagnosisText: fullText };
  }

  try {
    const prefixIndex = fullText.indexOf(AST_DATA_PREFIX);
    const suffixIndex = fullText.indexOf(AST_DATA_SUFFIX);

    if (prefixIndex === -1 || suffixIndex === -1) {
      return { astData: null, staticIssues: [], diagnosisText: fullText };
    }

    const jsonStr = fullText.slice(
      prefixIndex + AST_DATA_PREFIX.length,
      suffixIndex
    );

    const parsed = JSON.parse(jsonStr) as {
      astData: object;
      staticIssues: string[];
    };

    // Everything after the suffix (strip leading newline)
    const diagnosisText = fullText
      .slice(suffixIndex + AST_DATA_SUFFIX.length)
      .replace(/^\n/, "");

    return {
      astData: parsed.astData ?? null,
      staticIssues: Array.isArray(parsed.staticIssues) ? parsed.staticIssues : [],
      diagnosisText,
    };
  } catch {
    // Malformed JSON — return nulls and full text as fallback
    return { astData: null, staticIssues: [], diagnosisText: fullText };
  }
}

// ─── parseReviewVerdict ───────────────────────────────────────────────────────

export function parseReviewVerdict(
  streamText: string
): "CORRECT" | "INCORRECT" | "PENDING" {
  const lines = streamText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.includes("VERDICT: CORRECT")) return "CORRECT";
    if (trimmed.includes("VERDICT: INCORRECT")) return "INCORRECT";
    // Stop scanning after the first non-empty line
    break;
  }
  return "PENDING";
}

// ─── getReviewBody ────────────────────────────────────────────────────────────

/**
 * Returns everything after the VERDICT line so the frontend can render
 * review content without the verdict prefix appearing in the body text.
 * If no VERDICT line is found yet, returns the full text.
 */
export function getReviewBody(streamText: string): string {
  const verdictIndex = streamText.indexOf("VERDICT:");
  if (verdictIndex === -1) return streamText;

  const newlineAfterVerdict = streamText.indexOf("\n", verdictIndex);
  if (newlineAfterVerdict === -1) return ""; // still streaming the verdict line

  return streamText.slice(newlineAfterVerdict).trimStart();
}

// ─── streamChunks ─────────────────────────────────────────────────────────────

/**
 * Async generator that yields decoded string chunks from a streamed Response.
 * Usage:
 *   for await (const chunk of streamChunks(res)) { ... }
 */
export async function* streamChunks(response: Response): AsyncGenerator<string> {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

// ─── streamToString ───────────────────────────────────────────────────────────

/**
 * Reads the entire response body into a single string.
 * Useful when you need the full text before processing (e.g. non-streaming paths).
 */
export async function streamToString(response: Response): Promise<string> {
  let result = "";
  for await (const chunk of streamChunks(response)) {
    result += chunk;
  }
  return result;
}

// ─── streamAnalysis ───────────────────────────────────────────────────────────

/**
 * Live streaming parser for /api/analyse responses.
 * Fires onAstReady the moment __END_AST__ lands in the buffer (~200ms),
 * then forwards diagnosis text chunk-by-chunk via onDiagnosisChunk.
 *
 * Usage:
 *   await streamAnalysis(response,
 *     (astData, staticIssues) => { /* render D3 tree *\/ },
 *     (chunk) => setDiagnosisText(prev => prev + chunk)
 *   )
 */
export async function streamAnalysis(
  response: Response,
  onAstReady: (astData: object, staticIssues: string[]) => void,
  onDiagnosisChunk: (chunk: string) => void
): Promise<void> {
  let buffer = "";
  let astParsed = false;

  for await (const chunk of streamChunks(response)) {
    buffer += chunk;

    if (!astParsed && buffer.includes(AST_DATA_SUFFIX)) {
      // The full AST envelope has arrived — parse it once
      const { astData, staticIssues, diagnosisText } = parseAnalysisStream(buffer);

      if (astData !== null) {
        onAstReady(astData, staticIssues);
        astParsed = true;
      }

      // Forward whatever diagnosis text is already in the buffer
      if (diagnosisText) {
        onDiagnosisChunk(diagnosisText);
      }
    } else if (astParsed) {
      // AST already handled — stream diagnosis chunks directly, no re-parsing
      onDiagnosisChunk(chunk);
    }
    // If neither: still accumulating the AST chunk, wait for next iteration
  }
}
