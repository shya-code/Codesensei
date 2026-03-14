"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
const SoundToggle = dynamic(() => import("@/components/SoundToggle"), { ssr: false });

interface TopBarProps {
  mode: "tutor" | "diagnosis";
  onModeChange: (m: "tutor" | "diagnosis") => void;
  dark: boolean;
  onToggleDark: () => void;
  sessionLabel?: string;
}

export default function TopBar({ mode, onModeChange, dark, onToggleDark, sessionLabel }: TopBarProps) {
  return (
    <header style={{
      height: 54, borderBottom: "var(--border)",
      background: "var(--bg)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.2rem", flexShrink: 0,
      boxShadow: "0 2px 0 var(--ink)",
      position: "relative", zIndex: 10,
    }}>
      {/* Wordmark */}
      <Link href="/" style={{
        fontFamily: "var(--font-head)", fontSize: "1.35rem",
        letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6,
        textDecoration: "none", color: "var(--ink)",
      }}>
        <span style={{
          background: "var(--ink)", color: "var(--bg)",
          padding: "1px 8px", borderRadius: 1,
        }}>Code</span>
        <span>Sensei</span>
        <span style={{
          fontSize: "0.65rem", fontFamily: "var(--font-body)",
          color: "var(--ink-faint)", marginLeft: 2,
        }}>✏ AI Tutor</span>
      </Link>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button className={`mode-btn${mode === "tutor" ? " active" : ""}`}
          onClick={() => onModeChange("tutor")}>🎓 Tutor</button>
        <button className={`mode-btn${mode === "diagnosis" ? " active" : ""}`}
          onClick={() => onModeChange("diagnosis")}>🔍 Diagnose</button>
      </div>

      {/* Right side: session label + progress + dark toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
        {sessionLabel && (
          <span style={{ fontFamily: "var(--font-head)", fontSize: "0.85rem", color: "var(--ink-faint)" }}>
            {sessionLabel}
          </span>
        )}
        <Link
          href="/progress"
          style={{
            display: "inline-block",
            border: "var(--border)", borderRadius: 2,
            background: "var(--bg)", color: "var(--ink)",
            cursor: "pointer", padding: "0.25rem 0.6rem",
            fontFamily: "var(--font-head)", fontSize: "0.85rem",
            boxShadow: "var(--shadow-sm)", transition: "all 0.1s",
            textDecoration: "none",
            lineHeight: "1.4"
          }}
          title="View progress dashboard"
        >📊 Progress</Link>
        <SoundToggle />
        <button
          onClick={onToggleDark}
          style={{
            border: "var(--border)", borderRadius: 2,
            background: "var(--bg)", color: "var(--ink)",
            cursor: "pointer", padding: "0.25rem 0.6rem",
            fontFamily: "var(--font-head)", fontSize: "0.85rem",
            boxShadow: "var(--shadow-sm)", transition: "all 0.1s",
          }}
          title="Toggle dark mode"
        >{dark ? "☀ Light" : "☾ Dark"}</button>
      </div>
    </header>
  );
}
