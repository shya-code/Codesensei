"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getLevelProgress } from "@/lib/xpEngine";
import { getRivalComparison } from "@/lib/rivalGhost";
import { LEVELS } from "@/lib/constants";
import GhostLeaderboard from "@/components/GhostLeaderboard";
import PrestigeModal from "@/components/PrestigeModal";
import { canPrestige, getPrestigeCount } from "@/lib/prestigeEngine";

interface MicroPanelProps {
  xp: number;       // passed from parent so panel re-renders on XP change
  collapsed: boolean;
  onToggle: () => void;
}

export default function MicroPanel({ xp, collapsed, onToggle }: MicroPanelProps) {
  // Safe defaults (no localStorage) so server + client initial render match
  const [progress, setProgress] = useState<ReturnType<typeof getLevelProgress>>({
    currentXP: 0,
    currentLevel: 0,
    currentLevelName: "Novice",
    nextLevelThreshold: 300,
    nextLevelName: "Apprentice",
    progressPercent: 0,
  });
  const [rival, setRival] = useState<ReturnType<typeof getRivalComparison>>({
    lastWeek: { xp: 0, topics: 0, hints: 0 },
    thisWeek: { xp: 0, topics: 0, hints: 0 },
    isDoingBetter: true,
    message: "↔ Matching last week's pace",
  });
  const [showLevels, setShowLevels] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [prestigeCount, setPrestigeCount] = useState(0);
  const [canDoPrestige, setCanDoPrestige] = useState(false);

  const refresh = useCallback(() => {
    setProgress(getLevelProgress());
    setRival(getRivalComparison());
    setPrestigeCount(getPrestigeCount());
    setCanDoPrestige(canPrestige());
  }, []);

  // Only read localStorage after mount (client-side only)
  useEffect(() => { refresh(); }, [xp, refresh]);


  const currentLevelData = LEVELS[progress.currentLevel];
  const nextLevelData    = LEVELS[Math.min(progress.currentLevel + 1, LEVELS.length - 1)];
  const isMaxLevel = progress.currentLevel >= LEVELS.length - 1;

  if (collapsed) {
    return (
      <div
        style={{
          width: 40, background: "var(--bg-warm)", borderRight: "var(--border)",
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: "1rem", gap: "1rem", cursor: "pointer",
        }}
        onClick={onToggle}
        title="Expand panel"
      >
        <span style={{ fontSize: "1.3rem" }}>{currentLevelData?.icon ?? "🌱"}</span>
        <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-head)", writingMode: "vertical-rl", transform: "rotate(180deg)", color: "var(--ink-faint)" }}>
          {progress.currentXP} XP
        </span>
      </div>
    );
  }

  return (
    <div style={{
      width: 200, background: "var(--bg-warm)", borderRight: "var(--border)",
      display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "0.9rem 1rem 0.6rem",
        borderBottom: "1px solid var(--bg-ruled)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", color: "var(--ink)" }}>
          CodeSensei
          {prestigeCount > 0 && <span style={{ color: "#f6c90e", marginLeft: 4, fontSize: "0.8rem" }}>{"★".repeat(Math.min(prestigeCount, 3))}</span>}
        </Link>
        <button
          onClick={onToggle}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-faint)", fontSize: "0.85rem" }}
          title="Collapse panel"
        >‹</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0.9rem 1rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>

        {/* ─── Level + XP Bar ─────────────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "1.5rem" }}>{currentLevelData?.icon ?? "🌱"}</span>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1 }}>
                {progress.currentLevelName}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 2 }}>
                {progress.currentXP.toLocaleString()} XP total
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div style={{
            height: 8, background: "var(--bg-ruled)", borderRadius: 4, overflow: "hidden",
            border: "1px solid var(--ink-faint)", marginBottom: "0.3rem",
          }}>
            <div style={{
              height: "100%",
              width: `${progress.progressPercent}%`,
              background: isMaxLevel
                ? "linear-gradient(90deg, #f6c90e, #ff9f1c)"
                : "linear-gradient(90deg, var(--ink-faint), var(--ink))",
              borderRadius: 4,
              transition: "width 0.5s ease",
            }} />
          </div>

          {/* Next level info */}
          {!isMaxLevel ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--ink-faint)" }}>
                → {nextLevelData?.icon} {progress.nextLevelName}
              </span>
              <span style={{ fontFamily: "var(--font-head)", fontSize: "0.7rem", color: "var(--ink-faint)" }}>
                {(progress.nextLevelThreshold - progress.currentXP).toLocaleString()} left
              </span>
            </div>
          ) : (
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "#f6c90e" }}>
              🏆 Maximum Level Reached!
            </div>
          )}

          {/* All Levels toggle */}
          <button
            onClick={() => setShowLevels(v => !v)}
            style={{
              marginTop: "0.5rem", width: "100%", background: "none",
              border: "1px solid var(--bg-ruled)", borderRadius: 3, cursor: "pointer",
              fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--ink-faint)",
              padding: "0.15rem 0", transition: "all 0.15s",
            }}
          >
            {showLevels ? "▲ Hide levels" : "▼ All levels"}
          </button>

          {showLevels && (
            <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: 3 }}>
              {LEVELS.map((lvl, i) => {
                const unlocked = progress.currentXP >= lvl.threshold;
                const isCurrent = i === progress.currentLevel;
                return (
                  <div key={lvl.name} style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.2rem 0.4rem", borderRadius: 3,
                    background: isCurrent ? "var(--bg-ruled)" : "transparent",
                    opacity: unlocked ? 1 : 0.4,
                  }}>
                    <span style={{ fontSize: "0.9rem", width: 20 }}>{unlocked ? lvl.icon : "🔒"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-head)", fontSize: "0.72rem", fontWeight: isCurrent ? 700 : 400 }}>
                        {lvl.name}
                        {isCurrent && <span style={{ marginLeft: 4, fontSize: "0.62rem", color: "var(--ink-faint)" }}>← you</span>}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "var(--ink-faint)" }}>
                        {lvl.threshold.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Stats ──────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {[
            { icon: "⚡", label: "XP", value: progress.currentXP.toLocaleString() },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--ink-faint)" }}>{icon} {label}</span>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.8rem" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ─── Rival Ghost ────────────────────────────────────── */}
        <div>
          <div className="label" style={{ marginBottom: "0.35rem", fontSize: "0.67rem" }}>RIVAL GHOST</div>
          <div style={{
            background: "var(--bg-ruled)", borderRadius: 4, padding: "0.5rem 0.6rem",
            borderLeft: `3px solid ${rival.isDoingBetter ? "#4caf50" : "#e84545"}`,
          }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", lineHeight: 1.4 }}>
              {rival.message}
            </div>
            <div style={{ marginTop: "0.35rem", display: "flex", gap: "0.6rem" }}>
              <span style={{ fontFamily: "var(--font-head)", fontSize: "0.65rem", color: "var(--ink-faint)" }}>
                Now: {rival.thisWeek.topics} topics
              </span>
              <span style={{ fontFamily: "var(--font-head)", fontSize: "0.65rem", color: "var(--ink-faint)" }}>
                Last wk: {rival.lastWeek.topics}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Ghost Leaderboard ───────────────────────────────── */}
        <GhostLeaderboard />

        {/* ─── Prestige ────────────────────────────────────────── */}
        {canDoPrestige && (
          <button
            onClick={() => setShowPrestige(true)}
            style={{
              width: "100%", padding: "0.4rem", borderRadius: 4,
              border: "1.5px solid #f6c90e", background: "#f6c90e22",
              color: "#f6c90e", fontFamily: "var(--font-head)", fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            ✨ Prestige Available!
          </button>
        )}
        {showPrestige && (
          <PrestigeModal
            onClose={() => setShowPrestige(false)}
            onPrestiged={() => { refresh(); setShowPrestige(false); }}
          />
        )}

      </div>
    </div>
  );
}
