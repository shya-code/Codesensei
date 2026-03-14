"use client";
import { useState, useEffect } from "react";
import { PUZZLES, Puzzle } from "@/content/puzzles/puzzles";

interface TraceChallengeProps {
  topic: string;
  onComplete: () => void;
}

export default function TraceChallenge({ topic, onComplete }: TraceChallengeProps) {
  const [questions, setQuestions] = useState<Puzzle[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const topicPuzzles = PUZZLES[topic];
    if (!topicPuzzles || topicPuzzles.length === 0) {
      onComplete(); // Skip immediately if no puzzles for this topic
      return;
    }
    // Pick 3 random
    const shuffled = [...topicPuzzles].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 3));
  }, [topic, onComplete]);

  if (questions.length === 0) return null; // loading or skip pending

  if (finished) {
    const passed = score >= 2;
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px", textAlign: "center" }}>
        <div style={{
          fontSize: "3rem", margin: "0 0 16px",
          color: passed ? "var(--success)" : "var(--accent)"
        }}>
          {score}/3
        </div>
        <p style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "32px" }}>
          {passed ? "Nice work! Ready to practice." : "Keep this in mind as you code."}
        </p>
        <button
          onClick={onComplete}
          style={{
            background: "var(--accent)", color: "var(--bg)",
            border: "none", borderRadius: 6, padding: "12px 24px",
            fontSize: "1rem", fontWeight: 600, cursor: "pointer",
            boxShadow: "var(--shadow-md)"
          }}
        >
          Start Practising →
        </button>
      </div>
    );
  }

  const q = questions[current];

  const handleOptionClick = (index: number) => {
    if (selected !== null) return; // prevent double click
    setSelected(index);
    setShowResult(true);
    
    if (index === q.correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (current === questions.length - 1) {
        setFinished(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ color: "var(--accent)", fontSize: "14px", fontWeight: 600 }}>⚡ Quick Challenge</div>
        <button
          onClick={onComplete}
          style={{
            background: "none", border: "none", color: "var(--text-muted)",
            fontSize: "13px", cursor: "pointer"
          }}
        >
          Skip →
        </button>
      </div>
      <div style={{ color: "var(--text-hint)", fontSize: "12px", marginTop: "4px" }}>
        Question {current + 1} of 3
      </div>

      {/* Code Block */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: 16, fontFamily: "var(--font-mono), monospace",
        fontSize: 13, color: "var(--text)", margin: "16px 0",
        whiteSpace: "pre-wrap"
      }}>
        {q.code}
      </div>

      {/* Question */}
      <div style={{ fontSize: 16, color: "var(--text)", fontWeight: 500, marginBottom: 16 }}>
        {q.question}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, idx) => {
          let borderColor = "var(--border)";
          let bgColor = "var(--surface)";
          let opacity = 1;

          if (showResult) {
            if (idx === q.correct) {
              borderColor = "var(--success)";
              bgColor = "rgba(16, 185, 129, 0.1)"; // success at 10%
            } else if (idx === selected) {
              borderColor = "var(--error)";
              bgColor = "rgba(239, 68, 68, 0.1)"; // error at 10%
            } else {
              opacity = 0.4;
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              style={{
                width: "100%", padding: "10px 16px", borderRadius: 6,
                border: `1px solid ${borderColor}`, background: bgColor,
                color: "var(--text)", fontSize: 14, cursor: selected === null ? "pointer" : "default",
                textAlign: "left", opacity,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (selected === null) e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                if (selected === null) e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation (Optional: shown briefly after answering before auto-advance) */}
      {showResult && (
        <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-hint)", textAlign: "center" }}>
          {q.explanation}
        </div>
      )}
    </div>
  );
}
