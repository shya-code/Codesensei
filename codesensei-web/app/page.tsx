"use client";
import { useState, useCallback, useEffect } from "react";
import TopBar from "@/components/TopBar";
import MicroPanel from "@/components/MicroPanel";
import TutorMode from "@/components/TutorMode";
import DiagnosisMode from "@/components/DiagnosisMode";
import { snapshotWeeklyStats } from "@/lib/rivalGhost";
import { getProgress } from "@/lib/storage";

export default function Home() {
  const [mode, setMode] = useState<"tutor" | "diagnosis">("tutor");
  const [xp, setXp] = useState(0);
  const [dark, setDark] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [initialTopic, setInitialTopic] = useState<string | undefined>(undefined);

  // Sync XP from storage on mount and on change
  const refreshXp = useCallback(() => {
    setXp(getProgress().xp);
  }, []);

  // Weekly rival ghost snapshot
  useEffect(() => {
    const today = new Date();
    const lastSnap = localStorage.getItem("cs_last_snap");
    const todayStr = today.toISOString().split("T")[0];
    if (today.getDay() === 1 && lastSnap !== todayStr) { // Monday
      snapshotWeeklyStats();
      localStorage.setItem("cs_last_snap", todayStr);
    }
    refreshXp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply/remove [data-theme="dark"] on html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  // Also respect system preference on first load
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Handle ?topic= URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get("topic");
      if (topic) {
        setInitialTopic(topic);
        setMode("tutor"); // Force tutor mode if a topic is pre-selected
      }
    }
  }, []);

  const onXpChange = useCallback(() => { setXp(getProgress().xp); }, []);
  const handleModeChange = useCallback((m: "tutor" | "diagnosis") => setMode(m), []);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      position: "relative", zIndex: 1,
    }}>
      <TopBar
        mode={mode}
        onModeChange={handleModeChange}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        sessionLabel={mode === "tutor" ? "Tutor Mode" : "Diagnosis Mode"}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <MicroPanel
          xp={xp}
          collapsed={panelCollapsed}
          onToggle={() => setPanelCollapsed(v => !v)}
        />
        <div style={{
          flex: 1, overflow: "hidden",
          display: "flex", flexDirection: "column",
          position: "relative", zIndex: 1,
        }}>
          {mode === "tutor"
            ? <TutorMode onXpChange={onXpChange} initialTopic={initialTopic} />
            : <DiagnosisMode onXpChange={onXpChange} />}
        </div>
      </div>
    </div>
  );
}
