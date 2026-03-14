"use client";
import { useEffect, useState } from "react";
import { getHintTokens } from "@/lib/hintTokens";

interface Props { onRefresh?: number }

export default function HintTokenDisplay({ onRefresh }: Props) {
  const [tokens, setTokens] = useState(3);

  useEffect(() => {
    setTokens(getHintTokens());
  }, [onRefresh]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.3rem",
      fontFamily: "var(--font-head)", fontSize: "0.8rem",
      color: tokens === 0 ? "#e84545" : "var(--ink-faint)",
    }} title={`${tokens} hint tokens remaining today`}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ fontSize: "0.9rem", opacity: i < tokens ? 1 : 0.25 }}>🪙</span>
      ))}
      <span style={{ fontSize: "0.75rem" }}>{tokens}/3</span>
    </div>
  );
}
