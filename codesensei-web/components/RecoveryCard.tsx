"use client";
import { UnfinishedTopic } from "@/lib/recoveryEngine";
import { TOPICS } from "@/lib/topics-data";

interface Props {
  topics: UnfinishedTopic[];
  onStart: (concept: string) => void;
}

export default function RecoveryCard({ topics, onStart }: Props) {
  if (topics.length === 0) return null;

  return (
    <div style={{
      marginBottom: "1.8rem", border: "2px solid #e84545",
      borderRadius: 6, overflow: "hidden", background: "#e8454508",
    }}>
      <div style={{
        padding: "0.7rem 1.2rem", background: "#e84545",
        color: "#fff", fontFamily: "var(--font-head)", fontSize: "1rem",
        display: "flex", alignItems: "center", gap: "0.5rem",
      }}>
        🔥 Unfinished Business
        <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-body)", opacity: 0.85 }}>
          — Topics where you've struggled 3+ times
        </span>
      </div>
      <div style={{ padding: "0.9rem 1.2rem", display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
        {topics.slice(0, 4).map(({ concept, failures }) => {
          const topicDef = TOPICS.find((t) => t.concept === concept);
          return (
            <div key={concept} style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.5rem 0.9rem", border: "1.5px solid #e84545",
              borderRadius: 5, background: "var(--bg)",
            }}>
              <span style={{ fontSize: "1.4rem" }}>{topicDef?.emoji ?? "🧩"}</span>
              <div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: "0.9rem" }}>
                  {topicDef?.name ?? concept.replace(/_/g, " ")}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#e84545" }}>
                  {failures} failed attempt{failures !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                className="btn-filled"
                style={{ marginLeft: "auto", fontSize: "0.82rem", padding: "0.3rem 0.7rem", background: "#e84545", border: "none" }}
                onClick={() => onStart(concept)}
              >
                Redeem →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
