"use client";
import { useEffect, useState } from "react";
import { getGhostLeaderboard } from "@/lib/ghostLeaderboard";
import { getProgress } from "@/lib/storage";

export default function GhostLeaderboard() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const p = getProgress();
    // Use streak as rough topic proxy; xp gives ranking
    const board = getGhostLeaderboard(p.xp, p.topicsCompleted.length);
    setEntries(board.slice(0, 4));
  }, []);

  if (entries.length < 2) return null;

  const medals = ["🥇", "🥈", "🥉", "4️⃣"];

  return (
    <div style={{ marginTop: "0.6rem" }}>
      <div className="label" style={{ marginBottom: "0.35rem", fontSize: "0.67rem" }}>GHOST LEADERBOARD</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {entries.map((entry, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0.25rem 0.5rem", borderRadius: 4,
            background: entry.isCurrentWeek ? "var(--bg-ruled)" : "transparent",
            border: entry.isCurrentWeek ? "1px solid var(--ink-faint)" : "none",
          }}>
            <span style={{ fontSize: "0.9rem" }}>{medals[i]}</span>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.72rem",
              flex: 1, marginLeft: "0.4rem",
              color: entry.isCurrentWeek ? "var(--ink)" : "var(--ink-faint)",
              fontWeight: entry.isCurrentWeek ? 700 : 400,
            }}>
              {entry.weekLabel}
            </span>
            <span style={{ fontFamily: "var(--font-head)", fontSize: "0.72rem" }}>
              {entry.xp.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
