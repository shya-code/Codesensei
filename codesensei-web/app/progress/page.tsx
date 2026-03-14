"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getWeakness, getMistakes, getProgress, getActivityHeatmap } from "@/lib/storage";
import { getBadgeDisplay } from "@/lib/badgeEngine";
import { CONCEPTS } from "@/lib/constants";
import { TOPICS, TopicDef } from "@/lib/topics-data";

const TREND_COLOR: Record<string, string> = { strong: "#4caf50", improving: "#ff9f1c", stuck: "#e84545" };
const TREND_ICON: Record<string, string> = { strong: "🟢", improving: "🟡", stuck: "🔴" };
const AST_PATTERN_LABELS: Record<string, string> = {
  boundary: "Loop Boundary Errors", missing_base_case: "Missing Base Case",
  bare_except: "Bare except: Clause", mutable_default: "Mutable Default Args"
};
const ALL_BADGES = [
  "first_solve", "no_hints_5", "streak_7", "streak_30",
  "comeback", "loop_lord", "recursion_survivor", "concept_cleaner"
];

export default function ProgressPage() {
  const router = useRouter();
  const [weakness, setWeakness] = useState<any>(null);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [activity, setActivity] = useState<Record<string, number>>({});

  useEffect(() => {
    setWeakness(getWeakness());
    setMistakes(getMistakes());
    setProgress(getProgress());
    setActivity(getActivityHeatmap());
  }, []);

  if (!weakness) return <div style={{ padding: "2rem" }}>Loading...</div>;

  const astValues = Object.values(weakness.astPatternFailures ?? {}) as number[];
  const astPatternMax = Math.max(1, ...astValues);

  // Heatmap generation: Last 90 days
  const heatmapDays = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
     const d = new Date(today);
     d.setDate(d.getDate() - i);
     const dateString = d.toISOString().split("T")[0];
     heatmapDays.push({ date: dateString, count: activity[dateString] || 0 });
  }

  const handlePractice = (concept: string) => {
    router.push(`/?topic=${concept}`);
  };

  const getTopicDef = (concept: string): TopicDef | undefined => {
    return TOPICS.find(t => t.concept === concept);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      {/* ── HEADER ── */}
      <header style={{
        height: 54, borderBottom: "var(--border)", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 1.2rem", flexShrink: 0,
        boxShadow: "0 2px 0 var(--ink)", zIndex: 10
      }}>
        <Link href="/" style={{ textDecoration: "none", color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>← Back to Practice</span>
        </Link>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem", fontWeight: 700 }}>📊 Your Coding Journey</div>
      </header>

      {/* ── DASHBOARD BODY ── */}
      <div style={{ flex: 1, padding: "2.5rem 2rem", overflowY: "auto", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        
        {/* Top KPI Cards */}
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "3rem", flexWrap: "wrap" }}>
          <div className="topic-card sketch-in" style={{ flex: "1 1 250px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "2.5rem", filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.15))" }}>⭐</span>
            <div>
              <div style={{ fontFamily: "var(--font-body)", color: "var(--ink-faint)", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: 1 }}>Total XP</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem" }}>{progress.xp}</div>
            </div>
          </div>
          <div className="topic-card sketch-in" style={{ flex: "1 1 250px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", animationDelay: "0.05s" }}>
            <span style={{ fontSize: "2.5rem", filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.15))" }}>📈</span>
            <div>
              <div style={{ fontFamily: "var(--font-body)", color: "var(--ink-faint)", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: 1 }}>Current Level</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "1.8rem", whiteSpace: "nowrap" }}>
                {progress.levelName} <span style={{ fontSize: "1rem", color: "var(--ink-faint)" }}>(Lv {progress.level})</span>
              </div>
            </div>
          </div>
          <div className="topic-card sketch-in" style={{ flex: "1 1 250px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", animationDelay: "0.1s" }}>
            <span style={{ fontSize: "2.5rem", filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.15))" }}>🏵️</span>
            <div>
              <div style={{ fontFamily: "var(--font-body)", color: "var(--ink-faint)", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: 1 }}>Badges Earned</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem" }}>
                {progress.badges.length} <span style={{ fontSize: "1rem", color: "var(--ink-faint)" }}>/ {ALL_BADGES.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION: HEATMAP ── */}
        <div style={{ marginBottom: "3.5rem" }} className="sketch-in">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem", fontFamily: "var(--font-head)" }}>Activity Heatmap</h2>
          <div style={{
            background: "var(--bg-ruled)", borderRadius: 6, padding: "1.5rem", border: "var(--border)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {heatmapDays.map((day, i) => {
                const isToday = day.date === today.toISOString().split("T")[0];
                let bg = "var(--bg)"; // empty
                let border = "1px solid var(--border)";
                if (day.count > 0) {
                  bg = day.count >= 4 ? "#1e40af" : day.count >= 2 ? "#3b82f6" : "#93c5fd";
                  border = "1px solid transparent";
                }
                return (
                  <div key={i} title={`${day.date}: ${day.count} activities`} style={{
                    width: 14, height: 14, background: bg, border, borderRadius: 2,
                    boxShadow: isToday ? "0 0 0 2px var(--ink) inset" : "none"
                  }} />
                );
              })}
            </div>
            <div style={{ marginTop: "0.8rem", fontSize: "0.8rem", color: "var(--ink-faint)", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Less</span>
              <div style={{ width: 14, height: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 2 }} />
              <div style={{ width: 14, height: 14, background: "#93c5fd", borderRadius: 2 }} />
              <div style={{ width: 14, height: 14, background: "#3b82f6", borderRadius: 2 }} />
              <div style={{ width: 14, height: 14, background: "#1e40af", borderRadius: 2 }} />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* ── SECTION: CONCEPT MASTERY ── */}
        <div style={{ marginBottom: "3.5rem" }} className="sketch-in">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem", fontFamily: "var(--font-head)" }}>Concept Mastery</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.2rem" }}>
            {CONCEPTS.filter(c => weakness.concepts[c]?.attempts > 0 || getTopicDef(c)).map(concept => {
              const data = weakness.concepts[concept];
              const trend = data?.trend ?? "improving";
              const attempts = data?.attempts ?? 0;
              const failures = data?.failures ?? 0;
              const correct = attempts - failures;
              const topicDef = getTopicDef(concept);
              if (!topicDef && attempts === 0) return null; // Hide unattempted hidden topics
              
              const displayName = topicDef ? topicDef.name : concept.replace(/_/g, " ");
              const displayEmoji = topicDef ? topicDef.emoji : "🧩";
              
              return (
                <div key={concept} style={{
                  padding: "1.2rem", borderRadius: 6, border: "var(--border)",
                  borderBottom: `4px solid ${TREND_COLOR[trend]}`,
                  background: "var(--bg-warm)", display: "flex", flexDirection: "column", gap: "0.8rem",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.8rem" }}>{displayEmoji}</span>
                      <strong style={{ fontFamily: "var(--font-head)", fontSize: "1.1rem" }}>{displayName}</strong>
                    </div>
                    <span style={{ fontSize: "1.2rem", background: `${TREND_COLOR[trend]}22`, padding: "2px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }} title={`Trend: ${trend}`}>
                      <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-body)", color: TREND_COLOR[trend], textTransform: "uppercase", fontWeight: 700 }}>{trend}</span>
                      {TREND_ICON[trend]}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem", fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--ink-mid)" }}>
                    <div style={{ background: "var(--bg)", padding: "4px 8px", borderRadius: 4, border: "var(--border)" }}>
                      <span style={{ fontWeight: "bold", color: "#4caf50" }}>{correct}</span> Solved
                    </div>
                    <div style={{ background: "var(--bg)", padding: "4px 8px", borderRadius: 4, border: "var(--border)" }}>
                      <span style={{ fontWeight: "bold", color: "#e84545" }}>{failures}</span> Mistakes
                    </div>
                  </div>

                  <button className="btn-filled" style={{ marginTop: "auto", fontSize: "0.9rem", alignSelf: "flex-start", padding: "0.4rem 1rem" }} onClick={() => handlePractice(concept)}>
                    Practice Now →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION: AST PATTERNS AND BADGES ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3.5rem" }} className="sketch-in">
          
          {/* AST Patterns */}
          <div style={{ background: "var(--bg-ruled)", borderRadius: 6, padding: "1.5rem", border: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", fontFamily: "var(--font-head)" }}>AST Pattern Weaknesses</h2>
            {Object.keys(weakness.astPatternFailures ?? {}).length === 0 ? (
              <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>No structural weaknesses detected yet!</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {Object.entries(weakness.astPatternFailures ?? {}).map(([pattern, count]) => (
                  <div key={pattern}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>
                        {AST_PATTERN_LABELS[pattern] ?? pattern.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontFamily: "var(--font-head)", fontSize: "0.85rem", color: (count as number) >= 5 ? "#e84545" : "var(--ink-faint)" }}>
                        {count as number}× {(count as number) >= 5 ? "⚠ recurring" : ""}
                      </span>
                    </div>
                    <div style={{ height: 8, background: "var(--bg)", borderRadius: 4, border: "1px solid var(--border)" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        width: `${Math.min(100, ((count as number) / astPatternMax) * 100)}%`,
                        background: (count as number) >= 5 ? "#e84545" : "#ff9f1c",
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Recurring weaknesses tag */}
            {weakness.recurringPatterns.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--ink-faint)", marginBottom: "0.5rem" }}>Targeted by AI in next lessons:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {weakness.recurringPatterns.map((p: string) => (
                    <span key={p} style={{
                      padding: "0.3rem 0.7rem", borderRadius: 20, background: "#e8454522", color: "#e84545",
                      fontFamily: "var(--font-head)", fontSize: "0.8rem", border: "1px solid #e8454544",
                    }}>
                      {p.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Badges */}
          <div style={{ background: "var(--bg-warm)", borderRadius: 6, padding: "1.5rem", border: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", fontFamily: "var(--font-head)" }}>Your Trophy Room</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", maxHeight: 220, overflowY: "auto", paddingRight: "0.5rem" }}>
              {ALL_BADGES.map((id, index) => {
                const earned = progress.badges.includes(id);
                const display = getBadgeDisplay(id);
                return (
                  <div key={id} style={{
                    padding: "0.7rem 0.8rem", borderRadius: 6,
                    border: earned ? "2px solid var(--ink)" : "2px dashed var(--ink-faint)",
                    background: earned ? "var(--bg-ruled)" : "transparent",
                    opacity: earned ? 1 : 0.45,
                    display: "flex", alignItems: "center", gap: "0.6rem",
                  }}>
                    <span style={{ fontSize: "1.5rem", filter: earned ? "none" : "grayscale(100%)" }}>{display.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-head)", fontSize: "0.85rem", fontWeight: earned ? 700 : 400 }}>{display.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── SECTION: MISTAKE LOG ── */}
        <div className="sketch-in">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem", fontFamily: "var(--font-head)" }}>Mistake Log</h2>
          {mistakes.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--ink-faint)", border: "2px dashed var(--ink-faint)", borderRadius: 8 }}>
              No mistakes logged! Start practicing to populate your timeline.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {mistakes.slice(0, 15).map((entry, i) => (
                <div key={i} style={{
                  borderLeft: "4px solid #e84545", padding: "1rem 1.2rem",
                  background: "var(--bg-ruled)", borderRadius: "0 6px 6px 0",
                  display: "flex", flexDirection: "column", gap: "0.5rem",
                  boxShadow: "var(--shadow-sm)", borderTop: "var(--border)", borderRight: "var(--border)", borderBottom: "var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: "var(--font-head)", fontSize: "1rem", textTransform: "capitalize", background: "#e8454522", color: "#e84545", padding: "2px 8px", borderRadius: 4 }}>
                        {entry.topic.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--ink-faint)" }}>
                      {new Date(entry.date).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", lineHeight: 1.5, color: "var(--ink)" }}>
                    <strong>Feedback:</strong> {entry.mistake}
                  </div>
                  {entry.explanation && (
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--ink-faint)" }}>
                      <strong>Structural Issue:</strong> {entry.explanation}
                    </div>
                  )}
                  {entry.code && (
                    <pre style={{
                      marginTop: "0.5rem", padding: "0.8rem",
                      background: "var(--bg)", border: "var(--border)", borderRadius: 4,
                      fontSize: "0.85rem", overflowX: "auto", maxHeight: 120,
                      fontFamily: "monospace", color: "var(--ink)", boxShadow: "0 2px 0 var(--border) inset"
                    }}>
                      {entry.code}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
