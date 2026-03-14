# CodeSensei — Judge Q&A & Architecture Guide

Welcome, Judges! This document explains the **What, How, and Why** behind CodeSensei.

---

## 1. WHAT is CodeSensei?

**CodeSensei** is an interactive, AI-powered coding tutor that adapts to the student's weaknesses. Instead of static tutorials, it provides personalized lessons, live code evaluation, and generative tasks based on the student's actual performance history.

### Core Value Proposition
1. **Learn by Doing**: The tutor generates custom programming tasks tailored to the student's current proficiency.
2. **Adaptive Tracking**: It silently models the student's strengths and weaknesses across various programming concepts (e.g., loops, variables, array boundaries).
3. **Engaging Gamification**: Gamified loops (XP, Badges, Daily Challenges, Ghost Duels) keep retention high.

---

## 2. HOW does it work? (Architecture & Tech Stack)

CodeSensei is built with a modern, serverless architecture optimized for speed and real-time streaming feedback.

### The Tech Stack
- **Frontend Framework:** Next.js 14 (App Router) + React
- **Language:** TypeScript
- **Styling:** Vanilla CSS (custom design system)
- **AI Brain:** `groq-sdk` using the **Llama-3.3-70b-versatile** model. Groq's LPU architecture provides incredibly fast token generation, giving CodeSensei the feel of a "live tutor" typing to the student in real-time.
- **Code Editor:** `@monaco-editor/react` (the engine powering VS Code) used in the browser.
- **Data Persistence:** Client-side `localStorage`. This allows CodeSensei to be fully serverless without a database cost, ensuring immediate read/write access and total user privacy.

### The Feedback Loop (The AI Flow)
1. **Task Generation (`/api/task`):** CodeSensei passes the chosen topic and the student's *completed topics list* to Groq. Groq streams back a custom coding challenge that strictly only uses concepts the student already knows.
2. **Live Evaluation (`/api/review`):** When the user hits Submit, the raw code is sent to Groq. The AI acts as a compiler and teacher, streaming a markdown critique and a final `VERDICT: CORRECT/INCORRECT`.
3. **AST Error Analysis (`/api/analyse`):** In parallel with the review, this route extracts syntactic and logical "Anti-Patterns" (e.g., bare excepts, off-by-one errors) to feed the weakness profiler.

---

## 3. WHY did we build the Gamification Engine?

Educational tools face a massive drop-off rate. To combat this, we implemented a comprehensive 10-feature gamification engine that targets different psychological drivers.

| Feature | The "Why" (Mechanic) |
|---|---|
| **Speed Bonus (+Flash Badge)** | Rewards fast processing. Encourages flow-state. |
| **Combo Multiplier (1.5x XP)** | Rewards precision. A 3-streak with *zero hints* triggers this, making users think twice before spamming the hint button. |
| **Hint Economy (3 Tokens/Day)** | Scarcity heuristic. If hints are infinite, they become a crutch. Tying hints to 3 daily tokens makes them a strategic resource. |
| **Daily Challenge (2x XP)** | The "Hook Model". Gives the student a reason to open the app every single day, building a habit loop. |
| **Mistake Recovery (+50 XP)** | Turns failure into an opportunity. Topics failed 3+ times become "Unfinished Business". Solving them yields huge XP, reframing frustration as a boss fight. |
| **Ghost Leaderboard** | "Self-Competition". You are ranked against your own performance from the last 4 weeks. Better than global leaderboards which can demotivate new learners. |
| **Code Duels (vs AI Ghost)** | Live pressure. Racing a pre-defined countdown timer adds urgency and excitement to practice. |
| **Certificates** | Tangible accomplishment. Completing an entire difficulty tier grants a downloadable HTML5 Canvas certificate for social sharing. |
| **Prestige System** | The "Endgame". At max level, users can reset XP for a gold star and harder challenges, keeping advanced users engaged indefinitely. |
| **Skill Tree (D3 Graph)** | Visualizing progress. Seeing topics literally "unlock" other downstream nodes satisfies the completionist urge. |

---

## 4. Why use Groq / Llama 3?

**Speed is pedagogical.** 
If a student has to wait 15 seconds for code feedback, they lose context and focus. By utilizing Groq, the inference speed is near-instantaneous. It allows the `/api/lesson`, `/api/task`, and `/api/review` endpoints to *stream* text at a readable, human-like typing speed without any perceived "loading screen" latency. Llama-3 70b handles the zero-shot reasoning required to accurately critique student code perfectly.

---

## 5. Notable Technical Achievements

1. **Zero Database Cost:** Progress, weakness modeling, daily challenges, and telemetry are entirely managed via a robust client-side `localStorage` state engine (`/lib/storage.ts` & others).
2. **Abstract Syntax Tree (AST) Profiling:** The AI doesn't just say "wrong". It identifies *patterns* (e.g., `off_by_one`, `missing_base_case`). CodeSensei tracks these pattern occurrences over time to categorize them as "improving", "strong", or "stuck".
3. **Adaptive Prompting:** The `taskPrompt` dynamically injects the student's *past mistakes* into the system prompt, guaranteeing that the AI avoids tasks that rely heavily on concepts the student is currently stuck on, preventing frustration.
4. **Hydration-Safe SSR:** The app strictly uses Next.js `dynamic(..., { ssr: false })` boundaries for all UI components reliant on local storage to ensure perfect hydration and fast Time-to-Interactive (TTI).

---

*Thank you for exploring CodeSensei! We believe this blend of LLM performance and tightly engineered gamification represents the future of adaptive learning.*
