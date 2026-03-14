# CodeSensei — Setup Guide
# How to replace every placeholder variable before running the project

---

## What you need to fill in

Your `.env.local` file currently looks like this:

```
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
RAILWAY_BACKEND_URL=YOUR_RAILWAY_URL_HERE_AFTER_DEPLOYMENT
```

This guide walks through getting each value, one at a time.

---

## STEP 1 — Get your Groq API Key (`GROQ_API_KEY`)

Groq powers the fast AI responses in: hint, task, review, and analyse routes.

1. Open your browser and go to **[https://console.groq.com](https://console.groq.com)**
2. Sign up or log in (free account works fine)
3. In the left sidebar, click **"API Keys"**
4. Click **"Create API Key"**
5. Give it a name like `codesensei-hackathon`
6. Copy the key — it starts with `gsk_...`
7. Open `codesensei_backend/.env.local` in your editor
8. Replace the placeholder on line 1:

   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

> ⚠️ **Do not add quotes around the key.** Just paste it directly after the `=`.

---

## STEP 2 — Get your Gemini API Key (`GEMINI_API_KEY`)

Gemini powers the `/api/lesson` route only.

1. Open your browser and go to **[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"** (or pick an existing project)
5. Copy the key — it starts with `AIza...`
6. Open `codesensei_backend/.env.local`
7. Replace the placeholder on line 2:

   ```
   GEMINI_API_KEY=AIzaYour_actual_key_here
   ```

> 💡 **Check quota**: Free tier gives you 15 requests/minute on Gemini 2.0 Flash.  
> If you hit limits: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) → click your key → "Edit" to upgrade.

---

## STEP 3 — Deploy the Python backend to Railway (`RAILWAY_BACKEND_URL`)

This is the `python-backend/` folder. Railway hosts it for free.

### 3a — Push the python-backend folder to GitHub

The easiest way is to create a **separate repo** just for the Python backend:

1. Go to **[https://github.com/new](https://github.com/new)**
2. Name it something like `codesensei-backend`
3. Set it to **Public** (required for Railway free tier)
4. Click **"Create repository"**
5. On your machine, open a terminal and run:

   ```powershell
   cd c:\Users\shreya\codesensei_backend\python-backend
   git init
   git add .
   git commit -m "Initial commit — CodeSensei AST backend"
   git remote add origin https://github.com/YOUR_USERNAME/codesensei-backend.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

### 3b — Deploy to Railway

1. Go to **[https://railway.app](https://railway.app)** and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `codesensei-backend` repo
4. Railway will auto-detect it as a Python project
5. Click the deployed service → go to **"Settings"** tab
6. Scroll to **"Start Command"** and set it to:

   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

7. Go to the **"Deploy"** tab and click **"Deploy Now"** (or it may deploy automatically)
8. Wait ~60 seconds for the build to finish
9. Go to the **"Settings"** tab → **"Networking"** section
10. Click **"Generate Domain"** — Railway gives you a free URL like:

    ```
    https://codesensei-backend-production-xxxx.up.railway.app
    ```

11. Copy that URL (no trailing slash)
12. Open `codesensei_backend/.env.local`
13. Replace the placeholder on line 3:

    ```
    RAILWAY_BACKEND_URL=https://codesensei-backend-production-xxxx.up.railway.app
    ```

### 3c — Verify the Railway backend is live

Open your browser and visit:

```
https://your-railway-url.up.railway.app/health
```

You should see:

```json
{"status": "ok", "mode": "static-analysis-only"}
```

If you see this — the backend is working.

---

## STEP 4 — Final `.env.local` check

After completing all 3 steps, your file should look like:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAILWAY_BACKEND_URL=https://codesensei-backend-production-xxxx.up.railway.app
```

No quotes, no spaces around the `=`, no trailing slashes on the URL.

---

## STEP 5 — Run the Next.js app locally

```powershell
cd c:\Users\shreya\codesensei_backend
npm install
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## STEP 6 — Quick smoke test

Test each API key is connected by running these curl commands from a terminal:

**Test Groq (hint route):**
```powershell
curl -X POST http://localhost:3000/api/hint `
  -H "Content-Type: application/json" `
  -d '{"task": "write a loop", "code": "for i in range(10):", "attemptNumber": 1, "previousHints": []}'
```

**Test Gemini (lesson route):**
```powershell
curl -X POST http://localhost:3000/api/lesson `
  -H "Content-Type: application/json" `
  -d '{"topic": "loops", "level": "beginner", "weaknessPatterns": []}'
```

**Test Railway + Groq together (analyse route):**
```powershell
curl -X POST http://localhost:3000/api/analyse `
  -H "Content-Type: application/json" `
  -d '{"code": "for i in range(len(arr)):\n  print(arr[i])", "description": "", "weaknessHistory": []}'
```

The analyse response will start with `__AST_DATA__...` — that confirms Railway and Groq are both connected.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `500` from `/api/lesson` | Bad Gemini key | Re-check key at aistudio.google.com/apikey |
| `500` from `/api/hint` or `/api/task` | Bad Groq key | Re-check key at console.groq.com |
| Analyse returns `__AST_DATA__{"astData":{"nodes":[],"edges":[]}...` | Railway unreachable | Check Railway deployment logs; verify start command |
| `/health` returns 404 on Railway | Wrong start command | Set to `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| `RAILWAY_BACKEND_URL` works in browser but not in app | Trailing slash in URL | Remove the `/` at the end of the URL in `.env.local` |
| Keys work locally but not in production | env vars not set in host | Add all 3 vars in your hosting platform's environment settings |
