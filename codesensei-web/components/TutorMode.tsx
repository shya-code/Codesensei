"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TOPICS, TopicDef } from "@/lib/topics-data";
import { streamChunks, parseReviewVerdict, getReviewBody, streamAnalysis } from "@/lib/streamParser";
import { getProgress, getRecurringPatterns, updateWeakness, logMistakeWithCode, saveProgress, getWeakness } from "@/lib/storage";
import { handleTaskSolved, handleHintUsed, handleAnswerRevealed, handleSpeedBonus, handleRecoverySolve, handleComboBonus } from "@/lib/xpEngine";
import { checkAndAwardBadges, awardBadge, getBadgeDisplay } from "@/lib/badgeEngine";
import ASTTree from "@/components/ASTTree";
import { playSuccess, playFail, playHint } from "@/lib/soundEngine";
import TraceChallenge from "@/components/tutor/TraceChallenge";
import { startTimer, getElapsedSeconds, clearTimer } from "@/lib/speedTracker";
import { incrementCombo, resetCombo, getComboMultiplier } from "@/lib/comboTracker";
import { useHintToken, refillIfNewDay, getHintTokens } from "@/lib/hintTokens";
import { getDailyChallenge, saveDailyChallenge, markDailyChallengeComplete, isDailyChallengeComplete } from "@/lib/dailyChallenge";
import { getUnfinishedTopics, markRecovered } from "@/lib/recoveryEngine";
import { getProgress as _gp } from "@/lib/storage";
import { startDuel, endDuel, getGhostTime } from "@/lib/duelEngine";
import { checkTierCompletion } from "@/lib/certificateEngine";
import { canPrestige, getPrestigeCount } from "@/lib/prestigeEngine";
import { getUnlockedConcepts } from "@/lib/skillTree";
import ComboIndicator from "@/components/ComboIndicator";
import HintTokenDisplay from "@/components/HintTokenDisplay";
const DailyBanner = dynamic(() => import("@/components/DailyBanner"), { ssr: false });
const RecoveryCard = dynamic(() => import("@/components/RecoveryCard"), { ssr: false });
const DuelTimer = dynamic(() => import("@/components/DuelTimer"), { ssr: false });
const CertificateModal = dynamic(() => import("@/components/CertificateModal"), { ssr: false });
const PrestigeModal = dynamic(() => import("@/components/PrestigeModal"), { ssr: false });
const SkillTreeView = dynamic(() => import("@/components/SkillTreeView"), { ssr: false });

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type TutorState = "topics" | "lesson" | "trace" | "practice";
type PracticeTab = "task" | "analysis";
interface TutorModeProps {
  onXpChange: () => void;
  initialTopic?: string;
}

export default function TutorMode({ onXpChange, initialTopic }: TutorModeProps) {
  const [state, setState] = useState<TutorState>("topics");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [selectedTopic, setSelectedTopic] = useState<TopicDef | null>(null);
  const [lesson, setLesson] = useState("");
  const [isLessonStreaming, setIsLessonStreaming] = useState(false);
  const [task, setTask] = useState("");
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [code, setCode] = useState("# Write your solution here\n");
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [practiceTab, setPracticeTab] = useState<PracticeTab>("task");
  const [reviewText, setReviewText] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [verdict, setVerdict] = useState<"CORRECT" | "INCORRECT" | "PENDING" | null>(null);
  const [astData, setAstData] = useState<{ nodes: unknown[]; edges: unknown[] } | null>(null);
  const [staticIssues, setStaticIssues] = useState<string[]>([]);
  const [showAnswerBtn, setShowAnswerBtn] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);
  const [conceptPills, setConceptPills] = useState<string[]>([]);
  const [taskBody, setTaskBody] = useState("");
  const [noHintsStreak, setNoHintsStreak] = useState(0); // tracks solves with 0 hints

  const [recommendedTopic, setRecommendedTopic] = useState<TopicDef | null>(null);
  const [unfinishedTopics, setUnfinishedTopics] = useState<ReturnType<typeof getUnfinishedTopics>>([]);
  // Gamification expansion state
  const [hintTokenRefresh, setHintTokenRefresh] = useState(0);
  const [isDailyTask, setIsDailyTask] = useState(false);
  const [isRecoveryTask, setIsRecoveryTask] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [certTier, setCertTier] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [duelGhostSeconds, setDuelGhostSeconds] = useState(180);
  const [duelActive, setDuelActive] = useState(false);

  useEffect(() => {
    if (state === "topics") {
      const weakness = getWeakness();
      const stuckConcepts = Object.entries(weakness.concepts)
        .filter(([, v]) => v.trend === "stuck")
        .map(([k]) => k);
      if (stuckConcepts.length > 0) {
        setRecommendedTopic(TOPICS.find(t => stuckConcepts.includes(t.concept)) ?? null);
      } else {
        setRecommendedTopic(null);
      }
      setUnfinishedTopics(getUnfinishedTopics());
    }
  }, [state]);

  // Handle initial topic routing from /progress dashboard
  useEffect(() => {
    if (initialTopic && state === "topics") {
      const topicToLoad = TOPICS.find((t) => t.id === initialTopic || t.concept === initialTopic);
      if (topicToLoad) {
        // Defer slightly to avoid state update during render if React strict mode applies
        setTimeout(() => loadLesson(topicToLoad), 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic]);

  const showToast = useCallback((msg: string, isBadge = false) => {
    if (isBadge) {
      setBadgeToast(msg);
      setTimeout(() => setBadgeToast(null), 4000);
    } else {
      setXpToast(msg);
      setTimeout(() => setXpToast(null), 3000);
    }
  }, []);

  const filteredTopics = TOPICS.filter((t) => t.difficulty === difficulty);

  // Parse concept pills out of the task markdown
  useEffect(() => {
    if (!task) { setConceptPills([]); setTaskBody(""); return; }
    const match = task.match(/\*\*Concepts used in this task\*\*\n([^\n]+)/);
    if (match) {
      const pills = match[1].split(",").map((s) => s.trim()).filter(Boolean);
      setConceptPills(pills);
      setTaskBody(
        task.replace(/\*\*Concepts used in this task\*\*\n[^\n]+\n?/, "").trim()
      );
    } else {
      setConceptPills([]);
      setTaskBody(task);
    }
  }, [task]);

  const loadLesson = useCallback(async (topic: TopicDef) => {
    setSelectedTopic(topic); setLesson(""); setIsLessonStreaming(true); setState("lesson");
    try {
      const res = await fetch("/api/lesson", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.concept, level: topic.difficulty, weaknessPatterns: getRecurringPatterns() }) });
      let text = "";
      for await (const chunk of streamChunks(res)) { text += chunk; setLesson(text); }
    } catch { setLesson("⚠ Could not load lesson. Check your Groq API key."); }
    setIsLessonStreaming(false);
  }, []);

  const loadTask = useCallback(async (topic: TopicDef, opts?: { isDaily?: boolean; isRecovery?: boolean }) => {
    setIsTaskLoading(true); setTask(""); setCode("# Write your solution here\n");
    setAttempts(0); setHints([]); setVerdict(null); setReviewText("");
    setAstData(null); setStaticIssues([]); setShowAnswerBtn(false); setAnswerText("");
    setPracticeTab("task"); setState("practice");
    setIsDailyTask(opts?.isDaily ?? false);
    setIsRecoveryTask(opts?.isRecovery ?? false);
    // Start speed timer and duel
    startTimer();
    const ghost = getGhostTime(topic.difficulty);
    setDuelGhostSeconds(ghost);
    startDuel();
    setDuelActive(true);
    try {
      const res = await fetch("/api/task", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.concept, level: topic.difficulty, completedTopics: getProgress().topicsCompleted }) });
      let text = "";
      for await (const chunk of streamChunks(res)) { text += chunk; setTask(text); }
    } catch { setTask("⚠ Could not generate task."); }
    setIsTaskLoading(false);
  }, []);


  const getHint = useCallback(async () => {
    if (isHintLoading) return;
    // Hint token gate
    const tokenOk = useHintToken();
    if (!tokenOk) {
      setHintTokenRefresh(n => n + 1);
      showToast("🪙 No hint tokens left! Refills tomorrow.");
      return;
    }
    setHintTokenRefresh(n => n + 1);
    // Reset combo on hint use
    resetCombo();
    setIsHintLoading(true);
    handleHintUsed(); onXpChange();
    playHint();
    let hintText = "";
    try {
      const res = await fetch("/api/hint", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, code, attemptNumber: attempts + 1, previousHints: hints, astContext: staticIssues.join("; ") }) });
      for await (const chunk of streamChunks(res)) {
        hintText += chunk;
      }
      setHints((prev) => [...prev, hintText]);
    } catch { setHints((p) => [...p, "⚠ Could not get hint."]); }
    setIsHintLoading(false);
  }, [isHintLoading, task, code, attempts, hints, staticIssues, onXpChange, showToast]);


  const submitCode = useCallback(async () => {
    if (!selectedTopic || isReviewing) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts); setIsReviewing(true);
    setReviewText(""); setVerdict(null); setPracticeTab("analysis");
    try {
      const [reviewRes, analyseRes] = await Promise.all([
        fetch("/api/review", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task, code, weaknessHistory: getRecurringPatterns() }) }),
        fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, description: task, weaknessHistory: getRecurringPatterns() }) }),
      ]);
      let detectedIssues: string[] = [];
      streamAnalysis(analyseRes,
        (ast, issues) => { setAstData(ast as { nodes: unknown[]; edges: unknown[] }); setStaticIssues(issues); detectedIssues = issues; },
        () => {}
      ).catch(e => console.error("Stream analysis interrupted:", e));
      let full = "";
      for await (const chunk of streamChunks(reviewRes)) {
        full += chunk; setReviewText(full);
        const v = parseReviewVerdict(full);
        if (v !== "PENDING") setVerdict(v);
      }
      const finalVerdict = parseReviewVerdict(full);
      setVerdict(finalVerdict);

      // ── Extract AST pattern IDs from detected issues
      const astPatterns = detectedIssues.map(issue => {
        if (issue.includes("boundary") || issue.includes("off-by-one") || issue.includes("range(len")) return "boundary";
        if (issue.includes("base case") || issue.includes("recursive")) return "missing_base_case";
        if (issue.includes("bare except")) return "bare_except";
        if (issue.includes("mutable default")) return "mutable_default";
        return "";
      }).filter(Boolean);

      if (finalVerdict === "CORRECT") {
        playSuccess();
        setDuelActive(false);
        // ── P1-A: update weakness (concept improving/strong)
        updateWeakness(selectedTopic.concept, true, undefined, []);

        // ── P1-B: mark topic completed
        const prog = getProgress();
        if (!prog.topicsCompleted.includes(selectedTopic.concept)) {
          saveProgress({ ...prog, topicsCompleted: [...prog.topicsCompleted, selectedTopic.concept] });
        }

        // ── Award base XP
        const { xpAwarded, leveledUp, newLevelName } = handleTaskSolved(hints.length, newAttempts);
        onXpChange();
        let toastMsg = `+${xpAwarded} XP${leveledUp ? ` — Level up: ${newLevelName}!` : ""}`;

        // ── Speed bonus (first try, under 5 min)
        const elapsed = getElapsedSeconds();
        clearTimer();
        if (newAttempts === 1 && elapsed < 300) {
          const { xpAwarded: speedXP } = handleSpeedBonus();
          toastMsg += ` +${speedXP} ⚡Flash!`;
          awardBadge("flash_solver");
        } else {
          clearTimer();
        }

        // ── Combo bonus
        const comboMult = getComboMultiplier();
        if (comboMult > 1 && hints.length === 0) {
          const { xpAwarded: comboXP } = handleComboBonus(xpAwarded);
          toastMsg += ` +${comboXP} 🔥Combo!`;
        }
        if (hints.length === 0) {
          const newCombo = incrementCombo();
          if (newCombo.streak >= 10) awardBadge("combo_master");
        } else {
          resetCombo();
        }

        // ── Daily challenge bonus
        if (isDailyTask) {
          markDailyChallengeComplete();
          toastMsg += " ⚡ 2× Daily bonus!";
        }

        // ── Recovery bonus
        if (isRecoveryTask) {
          const { xpAwarded: recovXP } = handleRecoverySolve();
          markRecovered(selectedTopic.concept);
          toastMsg += ` +${recovXP} 💪 Recovery!`;
          awardBadge("comeback_kid");
        }

        // ── Duel result
        const duelResult = endDuel(duelGhostSeconds);
        if (duelResult.won) {
          awardBadge("ghost_slayer");
          toastMsg += " 👻 Ghost Slain!";
        }

        showToast(toastMsg);
        onXpChange();

        // ── Tier certificate check
        ((["beginner", "intermediate", "advanced"] as const)).forEach(tier => {
          if (checkTierCompletion(tier)) setCertTier(tier);
        });

        // ── Prestige prompt
        if (canPrestige()) setShowPrestigeModal(true);

        // ── Badge checks
        const newBadges = checkAndAwardBadges();
        if (newBadges.length > 0) {
          const d = getBadgeDisplay(newBadges[0]);
          showToast(`${d.emoji} Badge earned: ${d.name}!`, true);
        }

        // ── no_hints_5 badge: solved with 0 hints
        if (hints.length === 0) {
          const newStreak = noHintsStreak + 1;
          setNoHintsStreak(newStreak);
          if (newStreak >= 5) {
            const awarded = awardBadge("no_hints_5");
            if (awarded) showToast("🎯 Badge earned: No Lifelines!", true);
            setNoHintsStreak(0);
          }
        } else {
          setNoHintsStreak(0);
        }

      } else {
        playFail();
        resetCombo();
        // ── P1-A: update weakness (concept failing) + log mistake
        const reviewBody = getReviewBody(full);
        updateWeakness(selectedTopic.concept, false, reviewBody, astPatterns);
        logMistakeWithCode(selectedTopic.concept, code, reviewBody, astPatterns);

        if (newAttempts >= 3) {
          setShowAnswerBtn(true);
        }
      }
    } catch { setReviewText("⚠ Review failed."); }
    setIsReviewing(false);
  }, [selectedTopic, isReviewing, attempts, task, code, hints, noHintsStreak, onXpChange, showToast]);

  // ── P1-C: Fixed showAnswer — calls /api/answer not /api/analyse
  const showAnswer = useCallback(async () => {
    setIsAnswerLoading(true); handleAnswerRevealed(); onXpChange();
    setPracticeTab("task"); // auto-switch back to where the answer renders
    try {
      const allAttempts = [code]; // code = last attempt; ideally pass all, but last is most relevant
      const res = await fetch("/api/answer", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          attempts: allAttempts,
          mistakes: staticIssues,
        }) });
      let text = "";
      for await (const chunk of streamChunks(res)) { text += chunk; setAnswerText(text); }
    } catch { setAnswerText("⚠ Could not load answer."); }
    setIsAnswerLoading(false);
  }, [code, task, staticIssues, onXpChange]);

  const handlePracticeAnother = useCallback(async () => {
    if (!selectedTopic) return;
    const previousTask = task; // capture before reset
    // Reset all practice state, keep topic + lesson
    setTask(""); setIsTaskLoading(true);
    setCode("# Write your solution here\n");
    setAttempts(0); setHints([]); setVerdict(null);
    setReviewText(""); setIsReviewing(false);
    setAstData(null); setStaticIssues([]);
    setShowAnswerBtn(false); setAnswerText("");
    setPracticeTab("task");
    try {
      const res = await fetch("/api/task", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic.concept,
          level: selectedTopic.difficulty,
          completedTopics: [...getProgress().topicsCompleted, previousTask],
        }) });
      let text = "";
      for await (const chunk of streamChunks(res)) { text += chunk; setTask(text); }
    } catch { setTask("⚠ Could not generate task."); }
    setIsTaskLoading(false);
  }, [selectedTopic, task]);

  // ── TOPICS ─────────────────────────────────────────────────────────────────
  if (state === "topics") {
    return (
    <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "0.3rem" }}>
          What do you want to learn?
        </h1>
        <p style={{ color: "var(--ink-faint)", marginBottom: "1.8rem", fontFamily: "var(--font-body)", fontSize: "1rem" }}>
          Pick a topic, get a lesson, then practise with real tasks.
        </p>

        {/* ── Daily Banner ── */}
        <DailyBanner onStart={async () => {
          const daily = getDailyChallenge();
          if (daily) {
            // Already have a topic, load it in daily mode
            const topic = TOPICS.find(t => t.concept === daily.topic);
            if (topic) { loadTask(topic, { isDaily: true }); return; }
          }
          // Fetch new daily from API
          const res = await fetch("/api/daily", { method: "POST" });
          let raw = "";
          for await (const chunk of streamChunks(res)) { raw += chunk; }
          const topicMatch = raw.match(/__DAILY_TOPIC__(.+?)__END_TOPIC__/);
          const topicId = topicMatch?.[1] ?? "variables";
          const taskText = raw.replace(/__DAILY_TOPIC__.+?__END_TOPIC__\n?/, "").trim();
          saveDailyChallenge(topicId, taskText);
          const topic = TOPICS.find(t => t.concept === topicId);
          if (topic) loadTask(topic, { isDaily: true });
        }} />

        {/* ── Recovery Card ── */}
        <RecoveryCard
          topics={getUnfinishedTopics()}
          onStart={(concept) => {
            const topic = TOPICS.find(t => t.concept === concept);
            if (topic) loadTask(topic, { isRecovery: true });
          }}
        />

        {/* ── Recommended Topic Card ── */}
        {recommendedTopic && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div className="label" style={{ marginBottom: "0.5rem", color: "#e84545" }}>📌 RECOMMENDED — you struggled here</div>
            <div className="topic-card sketch-in" onClick={() => loadLesson(recommendedTopic)}
              style={{ border: "2px solid #e84545", maxWidth: 300 }}>
              <div style={{ fontSize: "1.7rem", marginBottom: 6 }}>{recommendedTopic.emoji}</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem", marginBottom: 5 }}>{recommendedTopic.name}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--ink-faint)" }}>
                {recommendedTopic.description}
              </div>
            </div>
          </div>
        )}

        {/* ── View Toggle: Grid / Skill Tree ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div className="mode-toggle" style={{ display: "inline-flex" }}>
            {(["beginner","intermediate","advanced"] as const).map((d) => (
              <button key={d} className={`mode-btn${difficulty === d ? " active" : ""}`}
                onClick={() => setDifficulty(d)} style={{ textTransform: "capitalize" }}>{d}</button>
            ))}
          </div>
          <button className="btn" style={{ fontSize: "0.8rem" }} onClick={() => setShowSkillTree(v => !v)}>
            {showSkillTree ? "🔲 Grid View" : "🌳 Skill Tree"}
          </button>
        </div>

        {showSkillTree ? (
          <SkillTreeView
            completedConcepts={getProgress().topicsCompleted}
            onSelectConcept={(concept) => {
              const topic = TOPICS.find(t => t.concept === concept);
              if (topic) loadLesson(topic);
            }}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="topic-card sketch-in" onClick={() => loadLesson(topic)}>
                <div style={{ fontSize: "1.7rem", marginBottom: 6 }}>{topic.emoji}</div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem", marginBottom: 5 }}>{topic.name}</div>
                <div style={{ marginBottom: 6 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={i < topic.difficultyDots ? "dot-full" : "dot-empty"} />
                  ))}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--ink-faint)" }}>
                  {topic.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {certTier && <CertificateModal tier={certTier} onClose={() => setCertTier(null)} />}
        {showPrestigeModal && <PrestigeModal onClose={() => setShowPrestigeModal(false)} onPrestiged={onXpChange} />}
      </div>
    </div>
  );}

  // ── LESSON ─────────────────────────────────────────────────────────────────
  if (state === "lesson") return (
    <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <button className="btn" onClick={() => setState("topics")} style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          ← Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.8rem" }}>
          <span style={{ fontSize: "2rem" }}>{selectedTopic?.emoji}</span>
          <h1 style={{ fontSize: "1.9rem" }}>{selectedTopic?.name}</h1>
          {isLessonStreaming && <span className="cursor" style={{ fontFamily: "var(--font-body)", color: "var(--ink-faint)", fontSize: "0.9rem" }}>writing</span>}
        </div>

        <div className="md sketch-in">
          {lesson
            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson}</ReactMarkdown>
            : <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-head)" }}>
                Loading lesson<span className="cursor" />
              </div>
          }
        </div>

        {!isLessonStreaming && lesson && (
          <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
            <button className="btn-filled" style={{ fontSize: "1.1rem", padding: "0.6rem 2rem" }}
              onClick={() => setState("trace")}>
              Start Practising →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── TRACE CHALLENGE ────────────────────────────────────────────────────────
  if (state === "trace" && selectedTopic) return (
    <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
      <TraceChallenge 
        topic={selectedTopic.concept} 
        onComplete={() => loadTask(selectedTopic)} 
      />
    </div>
  );

  // ── PRACTICE ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative", zIndex: 1 }}>
      {/* XP Toast */}
      {xpToast && (
        <div className="float-up" style={{
          position: "fixed", top: 66, right: 20, zIndex: 9999,
          background: "var(--ink)", color: "var(--bg)",
          fontFamily: "var(--font-head)", fontSize: "1rem",
          padding: "0.5rem 1rem", borderRadius: 2,
          border: "var(--border)", boxShadow: "var(--shadow)",
        }}>{xpToast}</div>
      )}
      {/* Badge Toast */}
      {badgeToast && (
        <div className="float-up" style={{
          position: "fixed", top: 66, right: 20, zIndex: 9999,
          background: "#f6c90e", color: "#111",
          fontFamily: "var(--font-head)", fontSize: "1rem",
          padding: "0.5rem 1rem", borderRadius: 2,
          boxShadow: "var(--shadow)",
        }}>{badgeToast}</div>
      )}

      {/* Monaco Editor Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "var(--border)" }}>
        <div style={{
          padding: "0.5rem 0.9rem", borderBottom: "1px solid var(--bg-ruled)",
          background: "var(--bg-warm)", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "0.5rem",
        }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: "0.9rem", color: "var(--ink-mid)" }}>
            🐍 Python Editor
            {verdict === "CORRECT" && <span style={{ marginLeft: 8, color: "var(--ink)", fontSize: "0.8rem" }}>✓ Correct!</span>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn" style={{ fontSize: "0.82rem", padding: "0.3rem 0.75rem" }}
              onClick={getHint} disabled={isHintLoading}>
              {isHintLoading ? "thinking…" : "💡 Hint (−15 XP)"}
            </button>
            <button className="btn-filled" style={{ fontSize: "0.82rem", padding: "0.3rem 0.75rem" }}
              onClick={submitCode} disabled={isReviewing || verdict === "CORRECT"}>
              {isReviewing ? "Reviewing…" : "✅ Submit"}
            </button>
          </div>
        </div>
        <MonacoEditor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-light"
          options={{ fontSize: 14, minimap: { enabled: false }, readOnly: verdict === "CORRECT",
            fontFamily: "'Courier New', monospace", scrollBeyondLastLine: false, padding: { top: 12 } }}
        />
        {showAnswerBtn && (
          <div style={{ padding: "0.6rem 0.9rem", borderTop: "1px solid var(--bg-ruled)", background: "var(--bg-warm)", display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="btn" style={{ fontSize: "0.88rem" }}
              onClick={showAnswer} disabled={isAnswerLoading}>
              {isAnswerLoading ? "Loading…" : "📖 Solution (used 3 attempts)"}
            </button>
            <button className="btn" style={{ fontSize: "0.88rem", border: "1px solid var(--accent)", color: "var(--accent)" }}
              onClick={handlePracticeAnother}>
              Try a Different Problem ↺
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div style={{ width: 360, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
        <div style={{ display: "flex", padding: "0.5rem 0.8rem 0", borderBottom: "var(--border)", gap: 4 }}>
          <button className={`tab${practiceTab === "task" ? " active" : ""}`} onClick={() => setPracticeTab("task")}>📋 Task</button>
          <button className={`tab${practiceTab === "analysis" ? " active" : ""}${!reviewText ? " locked" : ""}`}
            onClick={() => { if (reviewText) setPracticeTab("analysis"); }}>
            🔬 Analysis
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {practiceTab === "task" ? (
            <div>
              {/* Attempt indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="label">Attempt {attempts} / 3</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3].map((i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", display: "inline-block",
                      background: i <= attempts ? "var(--ink)" : "transparent",
                      border: "1.5px solid var(--ink-faint)",
                    }} />
                  ))}
                </div>
              </div>

              {isTaskLoading
                ? <div style={{ fontFamily: "var(--font-head)", color: "var(--ink-faint)" }}>Generating task<span className="cursor" /></div>
                : (
                  <div>
                    {conceptPills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px", marginTop: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#475569", alignSelf: "center", marginRight: "2px" }}>Uses:</span>
                        {conceptPills.map((pill, i) => (
                          <span key={i} style={{
                            background: "#1c1c26", border: "1px solid #2a2a3a",
                            borderRadius: "20px", padding: "2px 10px",
                            fontSize: "11px", color: "#6ee7f7",
                            fontFamily: "JetBrains Mono, monospace",
                          }}>{pill}</span>
                        ))}
                      </div>
                    )}
                    <div className="md" style={{ fontSize: "0.92rem" }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{taskBody}</ReactMarkdown>
                    </div>
                  </div>
                )
              }

              {hints.length > 0 && (
                <div style={{ marginTop: "1.2rem" }}>
                  <div className="label" style={{ marginBottom: 6 }}>Hints</div>
                  {hints.map((h, i) => (
                    <div key={i} className="hint-bubble">
                      <div className="label" style={{ marginBottom: 3 }}>Hint {i + 1}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem" }}>{h}</div>
                    </div>
                  ))}
                </div>
              )}

              {answerText && (
                <div style={{ marginTop: "1.2rem" }}>
                  <div className="label" style={{ marginBottom: 6 }}>Full Answer</div>
                  <div className="md" style={{ fontSize: "0.9rem" }}><ReactMarkdown remarkPlugins={[remarkGfm]}>{answerText}</ReactMarkdown></div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {verdict === "CORRECT" && <div className="verdict-correct">✓ Correct! Well done.</div>}
              {verdict === "INCORRECT" && <div className="verdict-incorrect">✗ Not quite — see feedback below.</div>}

              <div style={{ height: 220 }}>
                <div className="label" style={{ marginBottom: 5 }}>Code Structure</div>
                <ASTTree
                  astData={astData as { nodes: { id:string;type:string;line:number|null;hasIssue:boolean;issueType:string|null;label:string }[];edges:{source:string;target:string}[] } | null}
                  staticIssues={staticIssues}
                />
              </div>

              {reviewText && (
                <div className="md" style={{ fontSize: "0.9rem" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{getReviewBody(reviewText)}</ReactMarkdown>
                </div>
              )}

              {verdict === "INCORRECT" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                  <button
                    className="btn-filled"
                    onClick={showAnswer}
                    disabled={attempts < 3 || isAnswerLoading}
                    style={{
                      width: "100%",
                      background: attempts >= 3 ? "var(--accent)" : "transparent",
                      color: attempts >= 3 ? "var(--bg)" : "var(--ink-faint)",
                      border: attempts >= 3 ? "none" : "1px solid var(--border)",
                      cursor: attempts >= 3 ? "pointer" : "not-allowed",
                      padding: "10px",
                      opacity: attempts >= 3 ? 1 : 0.7,
                    }}
                  >
                    {isAnswerLoading ? "Generating Analysis..." : attempts >= 3 ? "📖 View Comparative Solution" : `🔒 Solution Locked (${attempts}/3 attempts)`}
                  </button>
                  
                  {attempts < 3 && (
                    <>
                      <button className="btn" onClick={() => setPracticeTab("task")} style={{ width: "100%" }}>↩ Try Again</button>
                      <button className="btn" onClick={() => setState("lesson")} style={{ width: "100%", color: "var(--ink-faint)" }}>
                        ← Back to lesson
                      </button>
                    </>
                  )}
                </div>
              )}
              {verdict === "CORRECT" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn-filled" onClick={() => { setState("topics"); setSelectedTopic(null); }} style={{ width: "100%" }}>
                    Next Topic →
                  </button>
                  <button
                    onClick={handlePracticeAnother}
                    style={{
                      width: "100%", background: "transparent",
                      border: "1px solid var(--accent)", color: "var(--accent)",
                      borderRadius: 6, padding: 10, fontSize: 14, fontWeight: 500,
                      cursor: "pointer", marginTop: 0, fontFamily: "system-ui, sans-serif",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 10%, transparent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >Practice Another ↺</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
