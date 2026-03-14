"use client";
import { useEffect, useState } from "react";
import { getComboState } from "@/lib/comboTracker";

export default function ComboIndicator() {
  const [combo, setCombo] = useState({ streak: 0, multiplierActive: false });

  useEffect(() => {
    setCombo(getComboState());
  }, []);

  if (combo.streak < 1) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.35rem",
      fontFamily: "var(--font-head)", fontSize: "0.82rem",
      color: combo.multiplierActive ? "#ff9f1c" : "var(--ink-faint)",
      animation: combo.multiplierActive ? "pulse 1.5s infinite" : "none",
    }}>
      <span style={{ fontSize: "1rem" }}>🔥</span>
      <span>
        {combo.streak}-Streak
        {combo.multiplierActive && " · 1.5× XP"}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
