# CodeSensei: The "Why" Behind the Stack

If the judges ask about our technology choices, here is exactly why we chose each specific piece of the stack. The overarching theme of our architecture is **speed, modularity, and zero-cost scalability.**

---

### 1. The Frontend Framework: Next.js (React)
**Why we chose it:**
*   **Component Modularity:** Gamification requires many independent, dynamic UI pieces (XP bars, combo indicators, hint tokens, a D3 skill tree). React’s component architecture was essential for building these cleanly without spaghetti code.
*   **Server-Side Rendering (SSR) to Client Handoff:** We needed a fast initial load, but heavy client-side interactivity. Next.js allows us to serve the static shells instantly and then use "use client" boundaries for the interactive learning and game logic.

### 2. The AI Engine: Groq + Llama-3.3-70b (and 3.1-8b fallback)
**Why we chose it over OpenAI/GPT-4:**
*   **Latency is the enemy of learning.** A student waiting 10 seconds for an OpenAI response will alt-tab and lose focus. Groq runs on an LPU (Language Processing Unit) architecture, streaming tokens at 800+ tokens per second. The live "typing" effect feels instantaneous.
*   **Fallback Reliability:** We built a custom try-catch system. If we hit the 70b rate limit, the API instantly falls back to the high-throughput 8b model, ensuring zero downtime during a live demo.

### 3. State Management & Database: Zero-DB Architecture (LocalStorage)
**Why we chose it over Postgres/MongoDB:**
*   *Why build a whole backend database just to track gamification XP during a hackathon?* We designed a completely **serverless, zero-backend state architecture** using browser `localStorage`.
*   **The Benefit:** It tracks XP streaks, daily challenges, and a rolling 5-week ghost leaderboard entirely client-side. This means our database hosting costs are exactly **$0.00**, there is zero network latency when updating XP or viewing progress, and the app scales infinitely without database bottlenecking.

### 4. Code Diagnosis: Abstract Syntax Tree (Python/FastAPI)
**Why we chose it over pure AI regex/prompting:**
*   LLMs hallucinate. If we ask an LLM "did the student write a for-loop?", it might get confused by a variable named `for_loop_counter`.
*   We built a lightweight Python backend strictly for **Abstract Syntax Tree (AST) parsing**. It mechanically rips the Python code into a structural tree and looks for precise patterns (e.g., bare `except` clauses, missing base cases). 
*   We feed this deterministic AST data *into* the LLM so the AI provides highly accurate, hallucination-free feedback. 
*   **Why FastAPI?** Because the `ast` module is native to Python. We spun up a tiny FastAPI microservice just to act as the AST parser, letting the React frontend handle everything else.

### 5. Deployment: Vercel (Frontend) & Railway (Backend)
**Why we chose them:**
*   **Vercel:** Vercel is built specifically for Next.js. It gives us instant edge-network deployments and seamless GitHub CI/CD integration.
*   **Railway over Render:** Initially, we tried Render, but Render’s free tier "spins down" (goes to sleep) after 15 minutes of inactivity, causing a 50-second cold start delay if a judge tests the app. Railway provides much faster wake times and smoother Docker container scaling for the Python backend.

### 6. Styling: Vanilla CSS Variables + Inline Styles
**Why we chose it over Tailwind/Bootstrap:**
*   We wanted a highly custom, "chalkboard/sketchbook" aesthetic. Heavy framework utility classes would have bloated the code and made dynamic, gamified animations (like combo multipliers popping) harder to manage.
*   Using raw CSS variables (`var(--ink)`, `var(--bg)`) allowed us to easily implement "Light/Dark/Hacker" themes globally without refactoring hundreds of Tailwind class names.
