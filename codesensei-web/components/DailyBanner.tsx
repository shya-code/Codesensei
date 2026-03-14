"use client";
import { useState, useEffect } from "react";
import { getDailyChallenge, isDailyChallengeComplete } from "@/lib/dailyChallenge";

interface Props {
  onStart: () => void;
}

export default function DailyBanner({ onStart }: Props) {
  const [challenge, setChallenge] = useState<any>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setChallenge(getDailyChallenge());
    setCompleted(isDailyChallengeComplete());
  }, []);

  if (!challenge && !completed) {
    // No daily challenge fetched yet — show a "load" CTA
    return (
      <div style={{
        marginBottom: "1.5rem", padding: "1rem 1.4rem",
        border: "2px dashed var(--ink)", borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-warm)", cursor: "pointer",
      }} onClick={onStart}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: "1.1rem" }}>⚡ Daily Challenge</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--ink-faint)", marginTop: 2 }}>
            Solve today&apos;s challenge for <strong>2× XP!</strong> Refreshes at midnight.
          </div>
        </div>
        <button className="btn-filled" style={{ whiteSpace: "nowrap" }}>Start →</button>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{
        marginBottom: "1.5rem", padding: "1rem 1.4rem", border: "2px solid #4caf50",
        borderRadius: 6, background: "#4caf5011",
        fontFamily: "var(--font-head)", fontSize: "0.95rem", color: "#4caf50",
      }}>
        ✅ Daily Challenge Complete! Come back tomorrow for a new one.
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: "1.5rem", padding: "1rem 1.4rem",
      border: "2px solid var(--ink)", borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg-warm)",
    }}>
      <div>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "1.1rem" }}>⚡ Daily Challenge · {challenge.topic}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--ink-faint)", marginTop: 2 }}>
          Solve for <strong>2× XP!</strong>
        </div>
      </div>
      <button className="btn-filled" onClick={onStart}>Continue →</button>
    </div>
  );
}
