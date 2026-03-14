"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface ASTNode { id: string; type: string; line: number | null; hasIssue: boolean; issueType: string | null; label: string; }
interface ASTEdge { source: string; target: string; }
interface ASTData { nodes: ASTNode[]; edges: ASTEdge[]; }
interface WalkthroughModalProps { astData: ASTData; onClose: () => void; userCode?: string; }

interface ExecutionStep {
  id: string; type: string; line: number | null;
  hasIssue: boolean; issueType: string | null;
  label: string; explanation: string; depth: number;
}

/* ─── Constants ───────────────────────────────────────────────────────────── */
const TRIVIAL = new Set(["Load", "Store", "Del", "AugLoad", "AugStore", "Param"]);

const ISSUE_TRANSLATIONS: Record<string, string> = {
  boundary:          "Possible off-by-one error",
  missing_base_case: "Base case may be missing",
  bare_except:       "Catches ALL exceptions — dangerous",
  mutable_default:   "Shared mutable default argument",
};


/* ─── Plain label ─────────────────────────────────────────────────────────── */
function getPlainLabel(node: ASTNode): string {
  const map: Record<string, string> = {
    Module: "Program Start",
    FunctionDef: "Define function",
    AsyncFunctionDef: "Define async function",
    ClassDef: "Define class",
    Return: "Return value",
    Assign: "Assign variable",
    AugAssign: "Update variable",
    AnnAssign: "Annotate variable",
    For: "For loop",
    AsyncFor: "Async for loop",
    While: "While loop",
    If: "If condition",
    With: "With block",
    Raise: "Raise exception",
    Try: "Try block",
    Import: "Import module",
    ImportFrom: "Import from module",
    Expr: "Execute expression",
    Call: "Call function",
    BinaryOp: "Calculate",
    Compare: "Compare values",
    BoolOp: "Boolean check",
  };
  return map[node.type] ?? node.type.toLowerCase();
}

/* ─── Explanation ─────────────────────────────────────────────────────────── */
function getExplanation(node: ASTNode): string {
  const map: Record<string, string> = {
    Module:      "Python begins reading your file from the very first line",
    FunctionDef: "A new function is being defined — its body is stored but not run yet",
    Return:      "The function finishes and hands back a result",
    Assign:      "A value is calculated and stored into a named variable",
    AugAssign:   "A variable is updated — its old value is modified in place",
    For:         "A loop begins — Python will repeat the block for each item",
    While:       "A loop begins — Python keeps repeating while the condition is true",
    If:          "Python checks a condition — only one branch will actually run",
    Call:        "A function is being called with the given arguments",
    BinaryOp:    "Two values are combined using an operator like +, -, *, /",
    Compare:     "Two values are compared to produce true or false",
    Import:      "An external module is loaded into the program",
    Expr:        "An expression is evaluated — often a function call like print()",
    Try:         "Python attempts the block — if it fails, the except runs instead",
    Raise:       "An exception is deliberately thrown here",
  };
  const base = map[node.type] ?? `Python processes this ${node.type.toLowerCase()}`;
  return node.hasIssue ? base + " — ⚠ a conceptual issue was detected here" : base;
}

/* ─── Step colour helper ──────────────────────────────────────────────────── */
function stepBorder(step: ExecutionStep): string {
  if (step.hasIssue) return "#f87171";
  if (step.type === "FunctionDef" || step.type === "ClassDef") return "#a78bfa";
  if (step.type === "For" || step.type === "While" || step.type === "AsyncFor") return "#6ee7f7";
  return "#2a2a3a";
}
function stepLabelColor(step: ExecutionStep): string {
  if (step.hasIssue) return "#f87171";
  if (step.type === "FunctionDef" || step.type === "ClassDef") return "#a78bfa";
  if (step.type === "For" || step.type === "While" || step.type === "AsyncFor") return "#6ee7f7";
  return "#e2e8f0";
}

/* ─── Build execution sequence with depths ────────────────────────────────── */
function buildSequence(astData: ASTData): ExecutionStep[] {
  const { nodes, edges } = astData;
  if (nodes.length === 0) return [];

  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();
  nodes.forEach((n) => children.set(n.id, []));
  edges.forEach((e) => { hasParent.add(e.target); children.get(e.source)?.push(e.target); });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const root = nodes.find((n) => !hasParent.has(n.id)) ?? nodes[0];

  const result: ExecutionStep[] = [];
  const visit = (id: string, depth: number) => {
    const n = nodeMap.get(id);
    if (!n) return;
    if (!TRIVIAL.has(n.type)) {
      result.push({ id: n.id, type: n.type, line: n.line, hasIssue: n.hasIssue, issueType: n.issueType, label: getPlainLabel(n), explanation: getExplanation(n), depth: Math.min(depth, 4) });
    }
    (children.get(id) ?? []).forEach((c) => visit(c, depth + 1));
  };
  visit(root.id, 0);
  return result.length > 0 ? result : nodes.filter((n) => !TRIVIAL.has(n.type)).map((n) => ({ id: n.id, type: n.type, line: n.line, hasIssue: n.hasIssue, issueType: n.issueType, label: getPlainLabel(n), explanation: getExplanation(n), depth: 0 }));
}

/* ─── CSS keyframes injected once ────────────────────────────────────────── */
const STYLE_ID = "__walkthrough_styles__";
function injectStyles() {
  if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes wt-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes wt-enter { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
    `;
    document.head.appendChild(s);
  }
}

/* ─── Modal ───────────────────────────────────────────────────────────────── */
export default function WalkthroughModal({ astData, onClose, userCode }: WalkthroughModalProps) {
  injectStyles();

  const sequence = useMemo(() => buildSequence(astData), [astData]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rightOpacity, setRightOpacity] = useState(1);
  const [cursorTop, setCursorTop] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftColRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStep = useRef(-1);

  /* Entry animation handled by CSS @keyframes wt-enter on the modal box */

  /* Right panel fade on step change */
  useEffect(() => {
    if (prevStep.current === currentStep) { prevStep.current = currentStep; return; }
    prevStep.current = currentStep;
    setRightOpacity(0);
    const t = setTimeout(() => setRightOpacity(1), 150);
    return () => clearTimeout(t);
  }, [currentStep]);

  /* Cursor position: follows currentStep's ref */
  useEffect(() => {
    const el = stepRefs.current[currentStep];
    const col = leftColRef.current;
    if (!el || !col) return;
    const colTop = col.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top;
    const relTop = elTop - colTop + col.scrollTop + el.offsetHeight / 2 - 7; // centre 14px dot
    setCursorTop(relTop);
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentStep]);

  /* Auto-play */
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= sequence.length - 1) { setIsPlaying(false); return s; }
          return s + 1;
        });
      }, 1800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, sequence.length]);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  if (sequence.length === 0) { onClose(); return null; }
  const step = sequence[currentStep];
  const border = stepBorder(step);
  const issueDesc = step.hasIssue && step.issueType ? (ISSUE_TRANSLATIONS[step.issueType] ?? step.issueType) : null;

  /* ── BtnStyle helper (inline — no external class) ───────────────────────── */
  const navBtnStyle: React.CSSProperties = {
    background: "transparent", border: "1px solid #2a2a3a", color: "#e2e8f0",
    borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer",
    fontFamily: "system-ui, sans-serif", transition: "border-color 150ms, color 150ms",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={stopProp}
        style={{
          background: "#0d0d14",
          border: "1px solid #2a2a3a",
          borderRadius: 16,
          width: "min(680px, 92vw)",
          height: "min(600px, 90vh)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "wt-enter 220ms ease-out both",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          height: 52, padding: "0 20px", borderBottom: "1px solid #2a2a3a",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#4ade80", boxShadow: "0 0 6px #4ade80",
              animation: "wt-pulse 2s ease-in-out infinite",
            }} />
            <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500, fontFamily: "system-ui, sans-serif" }}>
              Executing step by step
            </span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#64748b", fontSize: 18, lineHeight: 1, padding: "0 4px",
            fontFamily: "system-ui, sans-serif", transition: "color 0.1s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >✕</button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* LEFT — timeline */}
          <div
            ref={leftColRef}
            style={{ flex: 1, position: "relative", overflowY: "auto", padding: "24px 20px" }}
          >
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: 20, top: 0, bottom: 0, width: 2,
              background: "linear-gradient(to bottom, #6ee7f7, transparent)",
              pointerEvents: "none",
            }} />

            {/* Animated cursor dot */}
            <div style={{
              position: "absolute", left: 14, width: 14, height: 14,
              borderRadius: "50%", background: "#6ee7f7",
              boxShadow: "0 0 12px #6ee7f7, 0 0 24px #6ee7f740",
              transition: "top 400ms cubic-bezier(0.4, 0, 0.2, 1)",
              top: cursorTop,
              zIndex: 1, pointerEvents: "none",
            }} />

            {/* Step rows */}
            {sequence.map((s, i) => {
              const isActive = i === currentStep;
              const indentExtra = s.depth * 12;
              return (
                <div
                  key={s.id}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  onClick={() => setCurrentStep(i)}
                  style={{
                    paddingLeft: 44 + indentExtra,
                    paddingTop: 10, paddingBottom: 10, paddingRight: 12,
                    position: "relative", cursor: "pointer",
                    borderRadius: 8, marginBottom: 2,
                    background: isActive ? "#1a1a2e" : "transparent",
                    transition: "background 150ms",
                  }}
                >
                  {/* Horizontal connector */}
                  <div style={{
                    position: "absolute", left: 20, top: "50%",
                    width: 16 + indentExtra, height: 1,
                    background: isActive ? "#6ee7f7" : "#2a2a3a",
                    transition: "background 300ms",
                  }} />

                  {/* Issue dot on connector */}
                  {s.hasIssue && (
                    <div style={{
                      position: "absolute", left: 32 + indentExtra, top: "50%",
                      transform: "translateY(-50%)",
                      width: 6, height: 6, borderRadius: "50%", background: "#f87171",
                    }} />
                  )}

                  {/* Content */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {s.line !== null && (
                      <div style={{
                        display: "inline-flex", alignSelf: "flex-start",
                        background: "#1c1c26", border: "1px solid #2a2a3a",
                        borderRadius: 4, padding: "1px 6px",
                        fontSize: 10, color: "#64748b", fontFamily: "monospace",
                        marginBottom: 3,
                      }}>line {s.line}</div>
                    )}
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: stepLabelColor(s),
                      fontFamily: "system-ui, sans-serif",
                    }}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — detail panel */}
          <div style={{
            width: 260, borderLeft: "1px solid #1a1a24",
            padding: 20, display: "flex", flexDirection: "column",
            overflowY: "auto",
          }}>
            <div style={{ opacity: rightOpacity, transition: "opacity 150ms ease", flex: 1, display: "flex", flexDirection: "column" }}>

              {/* Current step card */}
              <div style={{
                background: "#13131a",
                border: `1px solid ${border}`,
                borderRadius: 10, padding: 16, marginBottom: 16,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
                  {step.label}
                </div>
                {step.line !== null && (
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontFamily: "system-ui, sans-serif" }}>
                    line {step.line}
                  </div>
                )}
                {step.hasIssue && (
                  <div style={{
                    display: "inline-block", marginTop: 8,
                    background: "#f8717120", border: "1px solid #f87171",
                    borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#f87171",
                    fontFamily: "system-ui, sans-serif",
                  }}>⚠ issue detected</div>
                )}
              </div>

              {/* Explanation */}
              <div style={{
                fontSize: 14, color: "#94a3b8", lineHeight: 1.7,
                marginBottom: 12, fontFamily: "system-ui, sans-serif",
              }}>{step.explanation}</div>

              {/* Your code — lines around this step */}
              {userCode && step.line !== null && (() => {
                const allLines = userCode.split('\n');
                const zeroIdx = step.line - 1;
                const start = Math.max(0, zeroIdx - 1);
                const end = Math.min(allLines.length - 1, zeroIdx + 2);
                const slice = allLines.slice(start, end + 1);
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 10, color: "#475569", fontWeight: 600,
                      letterSpacing: 1, textTransform: "uppercase",
                      fontFamily: "system-ui, sans-serif", marginBottom: 5,
                    }}>Your code</div>
                    <div style={{
                      background: "#1c1c26", border: "1px solid #2a2a3a",
                      borderRadius: 8, overflow: "hidden",
                    }}>
                      {slice.map((ln, i) => {
                        const lineNum = start + i + 1; // 1-indexed
                        const isActive = lineNum === step.line;
                        return (
                          <div key={i} style={{
                            display: "flex", alignItems: "flex-start",
                            background: isActive ? "#2a2a4a" : "transparent",
                            borderLeft: isActive ? "3px solid #6ee7f7" : "3px solid transparent",
                          }}>
                            <span style={{
                              minWidth: 28, padding: "3px 6px",
                              fontSize: 10, color: isActive ? "#6ee7f7" : "#475569",
                              fontFamily: "'Courier New', monospace",
                              userSelect: "none", textAlign: "right", flexShrink: 0,
                            }}>{lineNum}</span>
                            <pre style={{
                              margin: 0, padding: "3px 8px",
                              fontSize: 12,
                              color: isActive ? "#a5f3fc" : "#94a3b8",
                              fontFamily: "'Courier New', monospace",
                              lineHeight: 1.6, overflowX: "auto",
                              whiteSpace: "pre", flex: 1,
                            }}>{ln}</pre>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Issue callout */}
              {issueDesc && (
                <div style={{
                  background: "#f8717108", borderLeft: "3px solid #f87171",
                  borderRadius: "0 8px 8px 0", padding: "12px 14px",
                  fontSize: 13, color: "#e2e8f0", lineHeight: 1.6,
                  marginBottom: 16, fontFamily: "system-ui, sans-serif",
                }}>⚠ {issueDesc}</div>
              )}

              {/* Progress — pushed to bottom */}
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontFamily: "system-ui, sans-serif" }}>
                  Progress
                </div>
                <div style={{ height: 4, background: "#1c1c26", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(currentStep + 1) / sequence.length * 100}%`,
                    background: "linear-gradient(to right, #6ee7f7, #a78bfa)",
                    transition: "width 300ms ease",
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4, fontFamily: "system-ui, sans-serif" }}>
                  {currentStep + 1} of {sequence.length} steps
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={{
          height: 56, padding: "0 20px", borderTop: "1px solid #1a1a24",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          {/* Prev / Next */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              style={{ ...navBtnStyle, opacity: currentStep === 0 ? 0.3 : 1, cursor: currentStep === 0 ? "not-allowed" : "pointer" }}
              onMouseEnter={(e) => { if (currentStep > 0) { e.currentTarget.style.borderColor = "#6ee7f7"; e.currentTarget.style.color = "#6ee7f7"; }}}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.color = "#e2e8f0"; }}
            >← Prev</button>
            <button
              onClick={() => setCurrentStep((s) => Math.min(sequence.length - 1, s + 1))}
              disabled={currentStep === sequence.length - 1}
              style={{ ...navBtnStyle, opacity: currentStep === sequence.length - 1 ? 0.3 : 1, cursor: currentStep === sequence.length - 1 ? "not-allowed" : "pointer" }}
              onMouseEnter={(e) => { if (currentStep < sequence.length - 1) { e.currentTarget.style.borderColor = "#6ee7f7"; e.currentTarget.style.color = "#6ee7f7"; }}}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.color = "#e2e8f0"; }}
            >Next →</button>
          </div>

          {/* Auto-play */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              ...navBtnStyle,
              border: `1px solid ${isPlaying ? "#6ee7f7" : "#a78bfa"}`,
              color: isPlaying ? "#6ee7f7" : "#a78bfa",
            }}
          >{isPlaying ? "⏸ Pause" : "▶ Auto-play"}</button>

          {/* Done */}
          <button onClick={onClose} style={{
            background: "#6ee7f7", color: "#0a0a0f", fontWeight: 600,
            border: "none", borderRadius: 6, padding: "8px 20px",
            cursor: "pointer", fontSize: 13, fontFamily: "system-ui, sans-serif",
          }}>Done</button>
        </div>
      </div>
    </div>
  );
}
