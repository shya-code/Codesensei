# CodeSensei Backend — Build Summary

## What Was Built (Phases 1–4)

All work lives in `c:\Users\shreya\codesensei_backend`.

---

## Phase 1 — Scaffold (`lib/`)

> Pre-existing files read before each phase. Not modified.

| File | What it does |
|---|---|
| `lib/constants.ts` | XP values, level thresholds, concept list, MAX_ATTEMPTS |
| `lib/types.ts` | All TypeScript interfaces: Progress, WeaknessProfile, MistakeEntry, Topic, ASTNode, ASTData, DiagnosisResult, ReviewResult |
| `lib/storage.ts` | All localStorage read/write: progress, weakness, mistakes, lessons, XP, streak, weakness updates |
| `lib/topics.ts` | Topic list data |

---

## Phase 2 — Prompts + Python Backend

### `lib/prompts.ts`
6 pure TypeScript functions. Zero external imports. Every prompt has hard rules embedded in the prompt text itself.

| Function | Used by route | Purpose |
|---|---|---|
| `diagnosisPrompt` | `/api/analyse` | Static code analysis — no execution, reasons from AST + code text |
| `hintPrompt` | `/api/hint` | Socratic hints — attempt-conditional, no working code ever |
| `reviewPrompt` | `/api/review` | Code review with VERDICT: CORRECT / INCORRECT on first line |
| `lessonPrompt` | `/api/lesson` | Structured lesson — exact section order, ends with challenge CTA |
| `taskPrompt` | `/api/task` | Generates one coding task — no solution, no approach hint |
| `answerPrompt` | `/api/analyse` (future) | 3-attempt reveal — references student's specific attempts by number |

### `python-backend/`

| File | What it does |
|---|---|
| `requirements.txt` | fastapi 0.104.1 + uvicorn 0.24.0 only |
| `ast_analyser.py` | Parses Python code with `ast` module. Builds node/edge graph (capped 60/80). Detects 4 patterns: range(len()), missing base case, bare except, mutable default argument |
| `main.py` | FastAPI thin layer. `POST /analyse` → calls ast_analyser, returns `ast_data + static_issues + code_length`. `GET /health` → `{status: ok}` |

**Run locally:**
```powershell
cd python-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Test:**
```bash
curl -X POST http://localhost:8000/analyse \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"def foo(x=[]):\n  x.append(1)\", \"description\": \"\"}"
```

---

## Phase 3 — Next.js API Routes (`app/api/`)

All routes: POST only, streaming responses (`text/plain; charset=utf-8`), 400 on missing required fields, 500 with human-readable error on API failure.

| Route | AI | Tokens | Key behaviour |
|---|---|---|---|
| `app/api/lesson/route.ts` | **Gemini** 2.0 Flash | unlimited | Streams lesson markdown |
| `app/api/task/route.ts` | **Groq** Llama-3.3-70b | 1024 | Streams one coding task |
| `app/api/hint/route.ts` | **Groq** Llama-3.3-70b | 320 | Near-instant; attempt-conditional |
| `app/api/review/route.ts` | **Groq** Llama-3.3-70b | 1024 | Raw stream — frontend parses VERDICT line |
| `app/api/analyse/route.ts` | **Groq** Llama-3.3-70b | 700 | **Dual-chunk stream**: AST JSON first, then AI diagnosis. Railway timeout = 6 s, fails gracefully |

**Analyse stream format:**
```
__AST_DATA__{"astData":{...},"staticIssues":[...]}__END_AST__\n
[AI diagnosis text streams here...]
```

**Test analyse locally:**
```bash
curl -X POST http://localhost:3000/api/analyse \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"for i in range(len(arr)):\n  print(arr[i])\", \"description\": \"\", \"weaknessHistory\": []}"
```

---

## Phase 4 — Gamification + Session State (`lib/`)

No API calls in any Phase 4 file. Pure client-side logic.

| File | Exports | Purpose |
|---|---|---|
| `lib/xpEngine.ts` | `handleTaskSolved`, `handleAnswerRevealed`, `handleHintUsed`, `getLevelProgress` | XP math, streak trigger, level progress bar data |
| `lib/badgeEngine.ts` | `checkAndAwardBadges`, `awardBadge`, `getBadgeDisplay` | 8 badges; 6 auto-checked, 2 manually triggered (`no_hints_5`, `comeback`) |
| `lib/rivalGhost.ts` | `getRivalComparison`, `snapshotWeeklyStats` | Compare this week vs last week snapshot |
| `lib/sessionState.ts` | `SessionState`, `DEFAULT_SESSION_STATE`, 7 pure updaters | In-memory React state — never touches localStorage |
| `lib/streamParser.ts` | `parseAnalysisStream`, `parseReviewVerdict`, `getReviewBody`, `streamChunks`, `streamToString` | Parse dual-chunk analyse stream; parse VERDICT; async generator for live streaming |

---

## Environment Variables (`.env.local`)

```
GROQ_API_KEY=       # app/api/task, hint, review, analyse
GEMINI_API_KEY=     # app/api/lesson
RAILWAY_BACKEND_URL= # app/api/analyse → python-backend
```

---

## Import Paths for the Frontend Dev

```typescript
// Prompts (used by API routes, not usually the frontend directly)
import { diagnosisPrompt, hintPrompt, reviewPrompt, lessonPrompt, taskPrompt, answerPrompt } from '@/lib/prompts'

// Session state (React useState)
import { SessionState, DEFAULT_SESSION_STATE, resetForNewTask, recordAttempt, recordHint, setDiagnosisResults, setStreaming, setVerdict, updateCode } from '@/lib/sessionState'

// Stream parsing (call after every chunk or at stream end)
import { parseAnalysisStream, parseReviewVerdict, getReviewBody, streamChunks, streamToString } from '@/lib/streamParser'

// Gamification
import { handleTaskSolved, handleAnswerRevealed, handleHintUsed, getLevelProgress } from '@/lib/xpEngine'
import { checkAndAwardBadges, awardBadge, getBadgeDisplay } from '@/lib/badgeEngine'
import { getRivalComparison, snapshotWeeklyStats } from '@/lib/rivalGhost'
```

---

## Full File Tree

```
codesensei_backend/
├── .env.local
├── app/
│   └── api/
│       ├── analyse/route.ts   ← Phase 3
│       ├── hint/route.ts      ← Phase 3
│       ├── lesson/route.ts    ← Phase 3
│       ├── review/route.ts    ← Phase 3
│       └── task/route.ts      ← Phase 3
├── lib/
│   ├── badgeEngine.ts         ← Phase 4
│   ├── constants.ts           ← Phase 1
│   ├── prompts.ts             ← Phase 2
│   ├── rivalGhost.ts          ← Phase 4
│   ├── sessionState.ts        ← Phase 4
│   ├── storage.ts             ← Phase 1
│   ├── streamParser.ts        ← Phase 4
│   ├── topics.ts              ← Phase 1
│   ├── types.ts               ← Phase 1
│   └── xpEngine.ts            ← Phase 4
└── python-backend/
    ├── ast_analyser.py        ← Phase 2
    ├── main.py                ← Phase 2
    └── requirements.txt       ← Phase 2
```
