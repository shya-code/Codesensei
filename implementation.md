# CodeSensei — Gamification Expansion Plan

All 10 features are additive. **Zero changes to existing code.** New files are created alongside existing ones. Each feature lists exact new files + new additions to existing files via `// ADD:` comments (no removal of existing lines).

---

## Feature 1 — Daily Challenge 🗓️

**Goal:** One refreshing locked task per day with a 2× XP bonus. Builds daily habit loops.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/dailyChallenge.ts` | localStorage helpers: `getDailyChallenge()`, `saveDailyChallenge()`, `isDailyChallengeComplete()`, `markDailyChallengeComplete()` |
| `codesensei-web/app/api/daily/route.ts` | `POST /api/daily` — same as `/api/task` but randomly picks a topic, seeds from today's date, caches in `cs_daily` key with 24hr expiry |
| `codesensei-web/components/DailyBanner.tsx` | Renders a banner card on the Tutor topics screen: "⚡ Today's Daily Challenge — 2× XP!" Clicking it bypasses lesson and goes straight to practice |

### Additions to Existing Files
```
// ADD to lib/constants.ts:
DAILY_BONUS_MULTIPLIER: 2
DAILY_XP_SOLVE: 200  // 2x of SOLVE_FIRST_TRY

// ADD to lib/storage.ts:
cs_daily  key — { date: "YYYY-MM-DD", taskText: string, completed: boolean }

// ADD to components/TutorMode.tsx (topics section):
<DailyBanner onStart={() => loadDailyTask()} />
```

### localStorage Keys
- `cs_daily` → `{ date, taskText, completed }`

---

## Feature 2 — Speed Bonus ⚡

**Goal:** Solving in under 5 minutes on the first try awards a "Flash Solve" +20 XP toast.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/speedTracker.ts` | `startTimer()` → saves `cs_task_start = Date.now()`. `getElapsedSeconds()` → returns elapsed. `clearTimer()` → removes key |

### Additions to Existing Files
```
// ADD to lib/constants.ts:
SPEED_BONUS_XP: 20
SPEED_BONUS_THRESHOLD_SECONDS: 300  // 5 minutes

// ADD to lib/xpEngine.ts:
export function handleSpeedBonus(): { xpAwarded: number }
// Called from TutorMode when verdict = CORRECT && taskAttempts === 1 && elapsed < threshold

// ADD to components/TutorMode.tsx:
// Call startTimer() inside loadTask()
// Call getElapsedSeconds() inside submitCode() after CORRECT verdict
// If elapsed < 300 && attempts === 1: call handleSpeedBonus(), show "⚡ Flash Solve! +20 XP"
```

### localStorage Keys
- `cs_task_start` → timestamp number (cleared after each task)

---

## Feature 3 — XP Combo Multiplier 🔥

**Goal:** 3 correct solves in a row with no hints unlocks a visible 1.5× XP multiplier. Resets on hint or failure.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/comboTracker.ts` | `getComboStreak()`, `incrementCombo()`, `resetCombo()`, `getComboMultiplier()` → reads/writes `cs_combo` in localStorage |
| `codesensei-web/components/ComboIndicator.tsx` | Renders "🔥 3-Streak! 1.5× XP" above the Monaco editor when combo is active. Pulses on increment |

### Additions to Existing Files
```
// ADD to lib/constants.ts:
COMBO_THRESHOLD: 3
COMBO_MULTIPLIER: 1.5

// ADD to lib/xpEngine.ts:
// handleTaskSolved() — multiply finalXP by getComboMultiplier() if combo active
// Show separate "🔥 Combo Bonus" toast line

// ADD to components/TutorMode.tsx:
// On CORRECT + 0 hints: incrementCombo()
// On INCORRECT or hint used: resetCombo()
// Render <ComboIndicator /> in the Monaco toolbar area
```

### localStorage Keys
- `cs_combo` → `{ streak: number, multiplierActive: boolean }`

---

## Feature 4 — Leaderboard (Ghost Ranking) 👻

**Goal:** Show the user's current week ranked against their own last 4 weeks of snapshots as ghost players.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/ghostLeaderboard.ts` | `getGhostLeaderboard()` — reads `cs_weekly_history` (array of last 4 snapshots), returns ranked + labelled list. `pushWeekSnapshot()` — appends this week's stats |
| `codesensei-web/components/GhostLeaderboard.tsx` | Renders a ranked list in MicroPanel below Rival Ghost: 🥇 This Week, 🥈 Last Week, etc. |

### Additions to Existing Files
```
// ADD to lib/rivalGhost.ts — snapshotWeeklyStats():
// Also push snapshot to cs_weekly_history array (max 4 entries)

// ADD to components/MicroPanel.tsx:
<GhostLeaderboard />  // Below Rival Ghost section
```

### localStorage Keys
- `cs_weekly_history` → array of `{ weekLabel, xp, topics, hints }` (max 4)

---

## Feature 5 — Topic Completion Certificates 📜

**Goal:** When all Beginner/Intermediate/Advanced topics are complete, render a downloadable canvas certificate.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/certificateEngine.ts` | `checkTierCompletion(tier)` returns `true/false`. `drawCertificate(tier, name)` → uses HTML5 canvas to render a styled certificate and `canvas.toDataURL()` to download |
| `codesensei-web/components/CertificateModal.tsx` | Full-screen modal with the canvas certificate rendered inside and a "⬇ Download" button |

### Additions to Existing Files
```
// ADD to components/TutorMode.tsx:
// After marking topic complete, call checkTierCompletion()
// If tier complete: show <CertificateModal tier="beginner" />

// ADD to lib/badgeEngine.ts BADGE_DISPLAY:
beginner_cert: { name: "Beginner Graduate", emoji: "🎓" }
intermediate_cert: { name: "Intermediate Scholar", emoji: "🏫" }
advanced_cert: { name: "Advanced Master", emoji: "⭐" }
```

---

## Feature 6 — Mistake Recovery Challenges 💪

**Goal:** Topics with 3+ failures get "Unfinished Business" status. A special redemption task gives +50 XP Recovery Bonus.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/recoveryEngine.ts` | `getUnfinishedTopics()` — reads `cs_weakness`, returns topics with `failures >= 3 && trend !== "strong"`. `markRecovered(concept)` — writes `cs_recovered` set |
| `codesensei-web/components/RecoveryCard.tsx` | Renders a red "🔥 Unfinished Business" banner above the topic grid. Lists stuck topics with "Redeem Yourself →" button |

### Additions to Existing Files
```
// ADD to lib/constants.ts:
RECOVERY_BONUS_XP: 50

// ADD to lib/xpEngine.ts:
export function handleRecoverySolve(): { xpAwarded: number }

// ADD to components/TutorMode.tsx (topics section):
<RecoveryCard topics={getUnfinishedTopics()} onStart={(topic) => loadTask(topic)} />

// ADD to components/TutorMode.tsx (submitCode CORRECT branch):
// If task was a recovery task: handleRecoverySolve(), show "+50 XP Recovery Bonus!"
```

### localStorage Keys
- `cs_recovered` → `Set<string>` of recovered concept IDs

---

## Feature 7 — Hint Token Economy 🪙

**Goal:** Replace direct XP deduction with a daily **Hint Token** system (3 tokens/day, refill at midnight). Makes hints strategic.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/hintTokens.ts` | `getHintTokens()`, `useHintToken()` → returns `false` if 0 tokens left, `refillIfNewDay()` → checks `cs_hint_date` vs today |
| `codesensei-web/components/HintTokenDisplay.tsx` | Renders "🪙 2/3 Hints Left" in the Monaco toolbar. Coin icons animate when used |

### Additions to Existing Files
```
// ADD to lib/constants.ts:
DAILY_HINT_TOKENS: 3

// ADD to components/TutorMode.tsx:
// Call refillIfNewDay() on mount
// On getHint(): call useHintToken() first, if false → show "No hint tokens left! Refills tomorrow"
// Render <HintTokenDisplay /> in Monaco toolbar

// Note: XP penalty still applies per existing logic — tokens are an ADDITIONAL gate
```

### localStorage Keys
- `cs_hint_tokens` → `{ count: number, date: "YYYY-MM-DD" }`

---

## Feature 8 — Code Duels vs AI Ghost ⚔️

**Goal:** User races a pre-computed "AI ghost time" for a task. Beat it = bonus XP + new badge.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/duelEngine.ts` | `startDuel()` records start timestamp. `endDuel(solved)` computes elapsed, compares to `ghostTime` (stored with task). Returns `{ won, timeDiff }` |
| `codesensei-web/components/DuelTimer.tsx` | Live countdown/countup timer shown above Monaco: "⚔️ Ghost: 4:30 — You: 2:15" |

### Additions to Existing Files
```
// ADD to app/api/task/route.ts response:
// Append ghost_time_seconds to task metadata (use a heuristic: ~180s for beginner, ~300s for advanced)

// ADD to lib/badgeEngine.ts BADGE_DISPLAY:
ghost_slayer: { name: "Ghost Slayer", emoji: "👻" }

// ADD to components/TutorMode.tsx:
// Render <DuelTimer ghostTime={task.ghostTime} /> during practice
// After CORRECT: call endDuel(true), if won: show toast + awardBadge("ghost_slayer")
```

---

## Feature 9 — Skill Tree (Visual Topic Graph) 🌳

**Goal:** Replace the flat topic grid with an interactive D3 dependency tree. Topics unlock sequentially. Uses D3 which is already a dependency.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/skillTree.ts` | `SKILL_TREE_EDGES` constant: defines prerequisite relationships (e.g., `variables → loops → functions`). `getUnlockedTopics(completed[])` → returns which topics are unlocked |
| `codesensei-web/components/SkillTreeView.tsx` | D3 force-directed or hierarchical tree. Nodes: topic cards. Completed = green. Locked = grey. Unlocked = default. Click → loadLesson() |

### Additions to Existing Files
```
// ADD to components/TutorMode.tsx (topics state):
// Optional toggle: "Grid View" ↔ "Skill Tree View" button
// When in tree view: render <SkillTreeView unlocked={getUnlockedTopics(progress.topicsCompleted)} />
```

---

## Feature 10 — Prestige System 🌟

**Goal:** At Legend level (8000 XP), allow Prestige: reset XP but keep badges, get a special ★ icon, and unlock harder "Prestige" task prompts.

### New Files
| File | Purpose |
|---|---|
| `codesensei-web/lib/prestigeEngine.ts` | `canPrestige()` → checks `progress.level >= 7 (Legend)`. `applyPrestige()` → resets XP to 0, increments `progress.prestige` counter, saves to storage |
| `codesensei-web/components/PrestigeModal.tsx` | Warning modal: "⚠ You will reset to 0 XP. Badges, streak, and history are kept. Prestige tasks will be unlocked." Confirm button calls `applyPrestige()` |

### Additions to Existing Files
```
// ADD to lib/types.ts — Progress interface:
prestige?: number  // undefined or 0 = never prestiged

// ADD to components/MicroPanel.tsx:
// If progress.prestige > 0: show "★".repeat(prestige) below level name
// If level === Legend: show "✨ Prestige available" button → open PrestigeModal

// ADD to lib/prompts.ts — taskPrompt():
// If prestige > 0: append "This student has prestiged — generate an expert-difficulty variant"

// ADD to lib/badgeEngine.ts BADGE_DISPLAY:
prestige_1: { name: "First Prestige", emoji: "⭐" }
prestige_3: { name: "Ascended", emoji: "🌟" }
```

### localStorage Keys
- `cs_progress.prestige` — already part of Progress object (additive field, backward compatible)

---

## Build Order

Implement in this order to avoid dependency conflicts:

| # | Feature | Complexity | New Files | Touches Existing |
|---|---|---|---|---|
| 1 | Speed Bonus | ⭐ | 1 | `xpEngine.ts`, `TutorMode.tsx` |
| 2 | Combo Multiplier | ⭐ | 2 | `xpEngine.ts`, `TutorMode.tsx` |
| 3 | Hint Tokens | ⭐⭐ | 2 | `TutorMode.tsx`, `constants.ts` |
| 4 | Daily Challenge | ⭐⭐ | 3 | `TutorMode.tsx`, `constants.ts` |
| 5 | Mistake Recovery | ⭐⭐ | 2 | `TutorMode.tsx`, `xpEngine.ts` |
| 6 | Ghost Leaderboard | ⭐⭐ | 2 | `rivalGhost.ts`, `MicroPanel.tsx` |
| 7 | Code Duels | ⭐⭐⭐ | 2 | `task/route.ts`, `TutorMode.tsx` |
| 8 | Certificates | ⭐⭐⭐ | 2 | `TutorMode.tsx`, `badgeEngine.ts` |
| 9 | Prestige System | ⭐⭐⭐ | 2 | `types.ts`, `MicroPanel.tsx`, `prompts.ts` |
| 10 | Skill Tree | ⭐⭐⭐⭐ | 2 | `TutorMode.tsx` |

---

## Total New Files: 20 | Modified Existing Files: 0 (only additions via `// ADD:`)
