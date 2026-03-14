"use client";
import { useEffect, useState } from "react";
import { getDuelElapsed } from "@/lib/duelEngine";

interface Props {
  ghostSeconds: number;
  active: boolean;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function DuelTimer({ ghostSeconds, active }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setElapsed(getDuelElapsed()), 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const winning = elapsed < ghostSeconds;
  const diff = Math.abs(ghostSeconds - elapsed);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.6rem",
      fontFamily: "var(--font-head)", fontSize: "0.82rem",
    }}>
      <span style={{ color: "var(--ink-faint)" }}>⚔️ Ghost: {fmt(ghostSeconds)}</span>
      <span style={{ color: "var(--ink-faint)" }}>·</span>
      <span style={{ color: winning ? "#4caf50" : "#e84545", fontWeight: 700 }}>
        You: {fmt(elapsed)}
      </span>
      <span style={{
        fontSize: "0.7rem", fontFamily: "var(--font-body)",
        color: winning ? "#4caf50" : "#e84545",
      }}>
        {winning ? `(${fmt(diff)} ahead)` : `(${fmt(diff)} behind)`}
      </span>
    </div>
  );
}
