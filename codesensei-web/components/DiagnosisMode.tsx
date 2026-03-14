"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamAnalysis, streamChunks } from "@/lib/streamParser";
import { getRecurringPatterns } from "@/lib/storage";
import { handleHintUsed } from "@/lib/xpEngine";
import ASTTree from "@/components/ASTTree";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type DiagTab = "structure" | "diagnosis";
interface DiagnosisModeProps { onXpChange: () => void; }

const PLACEHOLDER = `# Paste your Python code here
# CodeSensei will analyse it statically — no execution needed
# It will detect conceptual mistakes in how you think about the problem

def example(arr):
    for i in range(len(arr)):
        print(arr[i])
`;

export default function DiagnosisMode({ onXpChange }: DiagnosisModeProps) {
  const [code, setCode] = useState(PLACEHOLDER);
  const [description, setDescription] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [hasAnalysed, setHasAnalysed] = useState(false);
  const [astData, setAstData] = useState<{ nodes: unknown[]; edges: unknown[] } | null>(null);
  const [staticIssues, setStaticIssues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<DiagTab>("structure");
  const [diagnosisText, setDiagnosisText] = useState("");
  const [isDiagnosisStreaming, setIsDiagnosisStreaming] = useState(false);
  const [diagnosisUnlocked, setDiagnosisUnlocked] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const analyse = useCallback(async () => {
    if (!code.trim() || isAnalysing) return;
    setIsAnalysing(true); setAstData(null); setStaticIssues([]);
    setDiagnosisText(""); setDiagnosisUnlocked(false); setHints([]);
    setActiveTab("structure");
    try {
      const res = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, description, weaknessHistory: getRecurringPatterns() }) });
      await streamAnalysis(res,
        (ast, issues) => { setAstData(ast as { nodes: unknown[]; edges: unknown[] }); setStaticIssues(issues); setHasAnalysed(true); },
        () => {}
      );
    } catch { setStaticIssues(["⚠ Analysis failed. Check API keys."]); }
    setIsAnalysing(false);
  }, [code, description, isAnalysing]);

  const showDiagnosis = useCallback(async () => {
    setDiagnosisUnlocked(true); setActiveTab("diagnosis");
    setIsDiagnosisStreaming(true); setDiagnosisText("");
    try {
      const res = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, description, weaknessHistory: getRecurringPatterns() }) });
      await streamAnalysis(res, () => {}, (chunk) => setDiagnosisText((p) => p + chunk));
    } catch { setDiagnosisText("⚠ Diagnosis failed."); }
    setIsDiagnosisStreaming(false);
  }, [code, description]);

  const getHint = useCallback(async () => {
    if (isHintLoading) return;
    setIsHintLoading(true); handleHintUsed(); onXpChange();
    let hintText = "";
    const hintIndex = hints.length;
    setHints((p) => [...p, ""]);
    try {
      const res = await fetch("/api/hint", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: `Diagnose: ${code.slice(0, 200)}`, code, attemptNumber: hints.length + 1, previousHints: hints, astContext: staticIssues.join("; ") }) });
      for await (const chunk of streamChunks(res)) {
        hintText += chunk;
        setHints((p) => { const n = [...p]; n[hintIndex] = hintText; return n; });
      }
    } catch { setHints((p) => { const n = [...p]; n[hintIndex] = "⚠ Could not get hint."; return n; }); }
    setIsHintLoading(false);
  }, [isHintLoading, code, hints, staticIssues, onXpChange]);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative", zIndex: 1 }}>

      {/* Main: Monaco */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "var(--border)" }}>
        <div style={{
          padding: "0.5rem 0.9rem", borderBottom: "1px solid var(--bg-ruled)",
          background: "var(--bg-warm)", display: "flex", gap: "0.5rem", alignItems: "center",
        }}>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What were you trying to do? (optional context)"
            style={{
              flex: 1, fontFamily: "var(--font-body)", fontSize: "0.9rem",
              border: "1.5px solid var(--ink-faint)", borderRadius: 2,
              padding: "0.32rem 0.65rem", background: "var(--bg)", color: "var(--ink)",
              outline: "none",
            }}
          />
          <button className="btn-filled" style={{ fontSize: "0.88rem", padding: "0.33rem 0.9rem" }}
            onClick={hasAnalysed ? () => { setHasAnalysed(false); analyse(); } : analyse}
            disabled={isAnalysing}>
            {isAnalysing ? "Analysing…" : hasAnalysed ? "🔄 Re-analyse" : "🔍 Analyse Code"}
          </button>
        </div>

        <MonacoEditor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-light"
          options={{ fontSize: 14, minimap: { enabled: false }, fontFamily: "'Courier New', monospace",
            scrollBeyondLastLine: false, padding: { top: 12 } }}
        />
      </div>

      {/* Right Sidebar */}
      <div style={{ width: 400, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
        {!hasAnalysed ? (
          /* Pre-analysis instruction panel */
          <div style={{ flex: 1, overflowY: "auto", padding: "1.8rem" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>🧠 How it works</h2>
            {[
              { num: 1, text: "Paste your Python code in the editor" },
              { num: 2, text: "AST visualises your code structure instantly — no running required" },
              { num: 3, text: "AI diagnoses the conceptual gap in how you're thinking" },
            ].map(({ num, text }) => (
              <div key={num} style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start", marginBottom: "1.2rem" }}>
                <div style={{ width: 30, height: 30, background: "var(--ink)", color: "var(--bg)",
                  borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-head)", fontWeight: 700, flexShrink: 0, fontSize: "0.9rem",
                }}>{num}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "1rem", paddingTop: 4 }}>{text}</div>
              </div>
            ))}
            <div style={{ border: "1.5px dashed var(--ink-faint)", borderRadius: 2, padding: "0.8rem 1rem",
              fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--ink-faint)", marginTop: "0.5rem" }}>
              ✏ Works with buggy, incomplete, or any Python — the messier the better.
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", padding: "0.5rem 0.8rem 0", borderBottom: "var(--border)", gap: 4 }}>
              <button className={`tab${activeTab === "structure" ? " active" : ""}`} onClick={() => setActiveTab("structure")}>🌳 Structure</button>
              <button className={`tab${activeTab === "diagnosis" ? " active" : ""}${!diagnosisUnlocked ? " locked" : ""}`}
                onClick={() => { if (diagnosisUnlocked) setActiveTab("diagnosis"); }}>
                🧠 Diagnosis{!diagnosisUnlocked ? " 🔒" : ""}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {activeTab === "structure" ? (
                <>
                  <ASTTree
                    astData={astData as { nodes: { id:string;type:string;line:number|null;hasIssue:boolean;issueType:string|null;label:string }[];edges:{source:string;target:string}[] } | null}
                    staticIssues={staticIssues}
                    userCode={code}
                  />
                  {!diagnosisUnlocked
                    ? <button className="btn-filled" style={{ width: "100%" }} onClick={showDiagnosis}>Show Diagnosis →</button>
                    : <button className="btn" style={{ width: "100%" }} onClick={() => setActiveTab("diagnosis")}>View Diagnosis →</button>
                  }
                </>
              ) : (
                <>
                  <div className="md" style={{ fontSize: "0.95rem" }}>
                    {diagnosisText
                      ? <><ReactMarkdown remarkPlugins={[remarkGfm]}>{diagnosisText}</ReactMarkdown>
                          {isDiagnosisStreaming && <span className="cursor" />}</>
                      : <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-head)" }}>Analysing<span className="cursor" /></div>
                    }
                  </div>

                  {!isDiagnosisStreaming && diagnosisText && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div className="label" style={{ marginBottom: 6 }}>
                        Hints — {"●".repeat(hints.length)}{"○".repeat(Math.max(0, 5 - hints.length))}
                      </div>
                      {hints.map((h, i) => (
                        <div key={i} className="hint-bubble">
                          <div className="label" style={{ marginBottom: 3 }}>Hint {i+1} — −15 XP</div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem" }}>{h}</div>
                        </div>
                      ))}
                      {hints.length < 5 && (
                        <button className="btn" style={{ fontSize: "0.85rem", width: "100%", marginTop: 4 }}
                          onClick={getHint} disabled={isHintLoading}>
                          {isHintLoading ? "thinking…" : `💡 Show Hint ${hints.length + 1} (−15 XP)`}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
