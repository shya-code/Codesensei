# CodeSensei — Tech Stack & Features

## What it does
CodeSensei is an **AI-driven code learning diagnostic system**. It reads student Python code *structurally* — without ever running it — and diagnoses *how the student is thinking*, not just whether the code works.

---

## Tech Stack

### Frontend — `codesensei-web/`
| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) |
| Styling | **Vanilla CSS** — custom sketch/doodle design system |
| Fonts | **Special Elite** (headings) + **Kalam** (body) — handwriting/typewriter feel |
| Code editor | **Monaco Editor** (same engine as VS Code) — Python syntax, in-browser |
| AST visualisation | **D3.js** — force-directed interactive node graph |
| Markdown rendering | **react-markdown** + remark-gfm |
| State | React `useState` — no Redux, no Zustand |
| Storage | `localStorage` — XP, streaks, badges, mistakes all persist client-side |
| Dark mode | CSS `[data-theme="dark"]` variables, respects `prefers-color-scheme` |

### Backend API — `codesensei-web/app/api/`
All API routes live inside the Next.js app itself (no separate Express server needed).

| Route | Model | Purpose |
|---|---|---|
| `POST /api/lesson` | Groq — Llama 3.3 70b | Generates a teaching lesson for a topic |
| `POST /api/task` | Groq — Llama 3.3 70b | Generates a coding challenge |
| `POST /api/hint` | Groq — Llama 3.3 70b | Returns a progressive hint (costs 15 XP) |
| `POST /api/review` | Groq — Llama 3.3 70b | Reviews submitted code: `VERDICT: CORRECT/INCORRECT` |
| `POST /api/analyse` | Groq — Llama 3.3 70b + Python backend | AST parse → dual-chunk stream (tree + diagnosis) |

All routes **stream responses** using `ReadableStream` — no waiting for the full response.

### Python Backend — `python-backend/`
| Layer | Technology |
|---|---|
| Framework | **FastAPI** |
| Server | **Uvicorn** |
| Static analysis | Python's built-in **`ast` module** (zero external ML dependencies) |
| Deployment | **Railway** (or local on port 8000) |

The Python backend does one thing: it receives code and returns a parsed AST graph (nodes + edges) plus detected code patterns. **No code execution happens anywhere.**

---

## Features

### 🎓 Tutor Mode
1. **Topic Selection** — 13 Python topics across 3 difficulty tiers, filterable grid
2. **Lesson** — AI-generated lesson streams in token by token (typewriter effect)
3. **Practice** — Monaco editor with:
   - AI-generated task (problem, input, output, example)
   - Progressive hints (up to 3, each costs 15 XP)
   - Code submission → AI review with verdict
   - AST tree of submitted code + detailed feedback
   - **Show Answer** button appears *only* after 3 failed attempts (not hidden — literally not in the DOM until then)
   - XP animation on correct answers

### 🔍 Diagnosis Mode
1. Paste any Python code into Monaco
2. Hit **Analyse Code** → Python backend parses AST instantly
3. **Structure tab** — interactive D3 force-directed tree:
   - Drag nodes, scroll to zoom
   - Red nodes = detected issues
   - Hover for line number + issue type
4. **Show Diagnosis →** — unlocks the AI tab with conceptual diagnosis streamed live
5. **Hint ladder** — up to 5 progressive hints, each costs 15 XP

### ⚡ Gamification (all client-side)
| Feature | How it works |
|---|---|
| XP | Awarded on correct solve (+60–150 depending on attempts), deducted for hints (−15 each) |
| Levels | 8 levels from Novice → Legend, shown with progress bar |
| Streak | Tracks consecutive daily sessions via `localStorage` |
| Badges | 8 badges (First Solve, 7-day streak, Loop Lord, Recursion Survivor, etc.) |
| Rival Ghost | Compares current week vs last week's stats |

### 🎨 Design
- **Sketch aesthetic** — every card and button has a 3px offset hard shadow giving a hand-drawn feel
- **Ruled paper texture** — subtle repeating-gradient background simulates notebook lines
- **Pure black & white** — no accent colours anywhere
- **Dark mode** — full dark theme via CSS variables, toggleable + respects system setting

---

## File Map

```
codesensei_backend/
├── codesensei-web/               ← Next.js app (frontend + API routes)
│   ├── app/
│   │   ├── page.tsx              ← Root page, dark mode state
│   │   ├── layout.tsx            ← HTML shell, Google Fonts
│   │   ├── globals.css           ← Entire design system
│   │   └── api/
│   │       ├── lesson/route.ts   ← Groq lesson generation
│   │       ├── task/route.ts     ← Groq task generation
│   │       ├── hint/route.ts     ← Groq hint (fast, token-capped)
│   │       ├── review/route.ts   ← Groq code review (streams VERDICT: first)
│   │       └── analyse/route.ts  ← Python AST + Groq diagnosis (dual-chunk stream)
│   ├── components/
│   │   ├── TopBar.tsx            ← Nav bar with dark mode toggle
│   │   ├── MicroPanel.tsx        ← Collapsible XP/level/streak sidebar
│   │   ├── TutorMode.tsx         ← Full tutor flow (topics → lesson → practice)
│   │   ├── DiagnosisMode.tsx     ← Paste-and-diagnose mode
│   │   └── ASTTree.tsx           ← D3 interactive AST tree
│   └── lib/                      ← Shared logic (copied from backend lib/)
│       ├── storage.ts            ← localStorage read/write
│       ├── xpEngine.ts           ← XP + level calculation
│       ├── badgeEngine.ts        ← Badge awarding
│       ├── sessionState.ts       ← In-memory session state shape
│       ├── streamParser.ts       ← Parse streamed API responses
│       ├── prompts.ts            ← All 6 AI prompt functions
│       └── constants.ts          ← XP values, level thresholds, concept list
│
├── python-backend/               ← FastAPI static analyser
│   ├── main.py                   ← POST /analyse, GET /health
│   └── ast_analyser.py           ← ast module → nodes/edges + pattern detection
│
├── .env.local                    ← API keys (not in git)
├── setup.md                      ← Step-by-step guide to fill in API keys
└── summary.md                    ← Phase-by-phase dev summary
```

---

## Key Design Decisions

**Why static analysis only?**
The hackathon brief asks for *conceptual diagnosis*, not test-running. Static analysis finds *how* a student is reasoning — a missing base case, a `range(len())` anti-pattern, a mutable default argument — things that reveal thinking errors, not just runtime bugs.

**Why dual-chunk streaming in `/api/analyse`?**
The AST payload (`__AST_DATA__....__END_AST__`) is enqueued *before* the Groq stream starts. This means the D3 tree renders in ~200ms while the AI diagnosis streams in over the next few seconds — the experience feels instant.

**Why is Show Answer not hidden?**
Per spec: `display:none` still blocks UX-testing tools and screen readers. The button is *genuinely absent from the DOM* until the 3rd failed attempt is recorded, then injected client-side.

**Why Groq over OpenAI?**
Groq's inference is 10–20x faster on Llama 3.3 70b than OpenAI on GPT-4o. On a free tier, this means a hint arrives in ~300ms vs ~3s — critical for a learning tool where latency kills focus.
