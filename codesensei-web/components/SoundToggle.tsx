"use client";
import { useState, useEffect } from "react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/soundEngine";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  // Read from localStorage after mount (avoids SSR mismatch)
  useEffect(() => { setEnabled(isSoundEnabled()); }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
  };

  return (
    <button
      onClick={toggle}
      title={enabled ? "Meme sounds ON — click to mute" : "Meme sounds OFF — click to enable"}
      style={{
        border: "var(--border)", borderRadius: 2,
        background: enabled ? "var(--ink)" : "var(--bg)",
        color: enabled ? "var(--bg)" : "var(--ink-faint)",
        cursor: "pointer", padding: "0.25rem 0.6rem",
        fontFamily: "var(--font-head)", fontSize: "0.85rem",
        boxShadow: "var(--shadow-sm)", transition: "all 0.15s",
        userSelect: "none",
      }}
    >
      {enabled ? "🔊 Sounds" : "🔇 Muted"}
    </button>
  );
}
