# CodeSensei — Judge Explanation

## What Is It?

CodeSensei is an **AI-powered Python learning diagnostic system** that doesn't just teach you code — it figures out *how you think* and why you're making mistakes, then fixes the mental model rather than the symptom.

**One-line pitch:** A programming tutor that knows exactly where your understanding broke down, not just that your code was wrong.

---

## The Problem It Solves

Standard coding tools (LeetCode, Codecademy) tell you **what** is wrong ("your output doesn't match").
CodeSensei tells you **why** it's wrong and **what conceptual gap** caused it.

Example: A student writes `for i in range(len(arr)+1)` — a boundary error. A normal judge says "Wrong Answer." CodeSensei says: *"You're treating the array like it's 1-indexed. Arrays in Python start at 0, so `range(len(arr))` gives you indices 0 through n-1. Your +1 pushes past the last element."*

---

## Architecture: Two Modes

### 🎓 Tutor Mode
1. Student picks a topic (25 topics, from Hello World → Recursion)
2. **Lesson loads instantly from a static markdown file** — no AI hallucination, curated content scraped and verified against learnpython.org
3. Student gets an AI-generated practice task (Groq/Llama-3.3-70b)
4. Student submits code → **two parallel API calls**:
   - `/api/review` → AI reviews the code, gives CORRECT/INCORRECT verdict + teaching feedback
   - `/api/analyse` → Python FastAPI backend runs static AST analysis, returns structural issues
5. Results are combined in the Analysis tab: AST tree visualisation + AI narrative review
6. After 3 failed attempts → `/api/answer` generates a teaching walkthrough of the solution

### 🔍 Diagnosis Mode
Student pastes **any** code (buggy, incomplete, anything):
1. Python backend parses it with Python's `ast` module — **no code execution ever**
2. Returns a graph of the AST structure + detected patterns (boundary errors, missing base cases, bare excepts, mutable defaults)
3. Student can unlock an AI "conceptual diagnosis" — explains the *mental model* that led to the bug
4. Progressive hints available (up to 5, each costs 15 XP)

---

## Personalization Engine

Every wrong submission:
- Updates a per-concept failure rate (stored in `localStorage`)
- Logs which AST patterns were detected (`boundary`, `missing_base_case`, `bare_except`, `mutable_default`)
- After **5 detections of the same AST pattern** → auto-marked as a "recurring weakness"

Every correct submission:
- Increments a consecutive-correct streak per concept
- After **3 consecutive correct** → concept trend flips to "strong" and is removed from weakness list

The AI receives `recurringPatterns[]` in every prompt — task generation, hints, and reviews all become personalized to what **this specific student** keeps getting wrong.

**"Recommended Topic" card** appears on the topic page pointing at the concept with the worst trend.

---

## What AI Does vs Doesn't Do

| AI Does | AI Doesn't |
|---|---|
| Generate practice tasks | Teach lessons (static markdown) |
| Write progressive hints | Run student code |
| Review submitted code | Detect AST structure (Python AST does that) |
| Diagnose conceptual gaps | Store any user data on a server |
| Generate answer walkthroughs | — |

---

## Gamification Layer (all client-side, no backend)

- **8 levels**: 🌱 Novice → 🏆 Legend (0 to 8,000 XP)
- **XP awards**: +150 first try, +100 second, +60 third; −15 per hint
- **8 badges**: First Blood, No Lifelines (5 solves with 0 hints), Week Warrior, Recursion Survivor, etc.
- **Rival Ghost**: Compares this week vs last week's topics completed — auto-snapshots weekly
- **Progress Dashboard** (📊 button): Concept strength grid per concept, AST failure bar charts, mistake log with code snippets, badge collection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + TypeScript, Monaco Editor, React Markdown |
| AI | Groq API (Llama-3.3-70b-versatile) — streamed responses |
| Static Analysis | Python 3 `ast` module via FastAPI backend |
| Lesson Content | 26 static markdown files (scraped + verified from learnpython.org) |
| State / Persistence | localStorage only (no auth, no user database) |
| Visualisation | Custom SVG AST tree renderer |

---

## Key Design Decisions

**Why static lessons instead of AI-generated?**
AI hallucinations in educational content are dangerous — it confidently explains things wrong. Static content is verified, instant, and consistent. AI is only used for *evaluation* (where minor inaccuracies are non-critical), not instruction.

**Why no code execution?**
Security. Running arbitrary student code requires sandboxing infrastructure. Python's `ast` module gives us structural analysis — loop boundary analysis, recursion pattern detection, dangerous practices — entirely safely, with zero execution. This also means it works on *incomplete* code, which is when learning is actually happening.

**Why localStorage instead of a database?**
Hackathon scope, but the architecture is ready for it. `lib/storage.ts` is a single abstraction layer — swapping localStorage for an API-backed store requires changing one file.

**Why Groq instead of OpenAI?**
Groq's inference speed is ~10x faster on Llama 3.3 70b than GPT-4o. For a tutor that streams feedback in real-time, latency kills the experience. With Groq, reviews stream in under 2 seconds.

---

## Numbers

- 25 learning topics across beginner / intermediate / advanced
- 26 static markdown lesson files
- 4 AST patterns detected statically
- 8 gamification badges
- 8 progression levels
- 6 AI-powered API routes (lesson fallback, task, hint, review, analyse, answer)
- 0 lines of executed student code
