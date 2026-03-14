"use client";
import { applyPrestige, getPrestigeCount } from "@/lib/prestigeEngine";

interface Props {
  onClose: () => void;
  onPrestiged: () => void;
}

export default function PrestigeModal({ onClose, onPrestiged }: Props) {
  const currentPrestige = getPrestigeCount();

  const handlePrestige = () => {
    applyPrestige();
    onPrestiged();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        zIndex: 500, backdropFilter: "blur(4px)",
      }} />
      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 501, background: "var(--bg)", border: "var(--border)",
        borderRadius: 8, padding: "2rem 2.5rem", boxShadow: "var(--shadow)",
        display: "flex", flexDirection: "column", gap: "1rem",
        alignItems: "center", maxWidth: 480, textAlign: "center",
      }}>
        <div style={{ fontSize: "3rem" }}>🌟</div>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "1.4rem" }}>
          Prestige {currentPrestige + 1}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--ink-mid)" }}>
          You have reached <strong>Legend</strong> — the highest level.
          <br />
          Prestige resets your XP to 0 but grants you a <strong style={{ color: "#f6c90e" }}>★ Prestige Star</strong> and unlocks harder AI tasks.
        </div>
        <div style={{
          border: "1.5px dashed #f6c90e", borderRadius: 6, padding: "0.8rem 1.2rem",
          fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--ink-faint)",
          background: "#f6c90e11",
        }}>
          ✅ Kept: Badges, Streak, Activity History, Mistakes Log
          <br />
          ❌ Reset: XP, Level
        </div>
        <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
          <button className="btn-filled" style={{ background: "#f6c90e", color: "#111", border: "none" }}
            onClick={handlePrestige}>
            ★ Prestige Now
          </button>
          <button className="btn" onClick={onClose}>Not Yet</button>
        </div>
      </div>
    </>
  );
}
