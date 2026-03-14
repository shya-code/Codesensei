# CodeSensei — Deployment Guide 🚀

This guide walks you through deploying both the Next.js frontend and the Python FastAPI backend completely for free.

---

## Part 1: Deploying the Frontend (Next.js) to Vercel

Vercel is the creator of Next.js and the absolute best place to host it for free.

### Prerequisites
1. Push your code to a GitHub repository.
2. In your repo, make sure `codesensei-web` is a folder at the root (if you have a monorepo setup).

### Steps
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository.
4. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** If your Next app is inside `codesensei-web`, click "Edit" and select that folder. If it's at the root of the repo, leave it as `/`.
   - **Build Command:** `npm run build` (leave default)
5. **Environment Variables:**
   Expand the Environment Variables section and add the keys from your local `.env.local`:
   - `GROQ_API_KEY` = `gsk_your_key_here`
6. Click **Deploy**.
7. Vercel will install dependencies, build the app, and give you a live URL (e.g., `https://codesensei.vercel.app`).

---

## Part 2: Deploying the Backend (Python FastAPI) to Railway

Railway is fantastic because it rarely "goes cold" in the same way Render does on the free tier, and it builds Python apps instantly via Nixpacks without complex configs.

### Prerequisites
1. Ensure your Python code is in its own repository (or a separate folder).
2. Ensure you have a `requirements.txt` file listing `fastapi`, `uvicorn`, `groq`, etc.
3. Your main FastAPI file should ideally be named `main.py`.

### Steps
1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository (or monorepo folder).
4. **Deploy immediately:** Click Deploy. Don't worry if it fails the first time, we need to add variables.
5. **Configure the Service:**
   - Click on the newly created card on your Railway canvas.
   - Go to the **Variables** tab. Add your API keys (`GROQ_API_KEY`, etc.) here.
   - Add a special variable: `PORT` = `8000`. (Railway needs to know which port to bind to).
   - Go to the **Settings** tab.
   - Under **Build**, ensure it's using the standard Nixpacks builder.
   - Under **Start Command**, set it to: `uvicorn main:app --host 0.0.0.0 --port $PORT` *(Change `main` if your file is named something else)*.
   - Under **Networking**, click **Generate Domain** to get a public URL (e.g., `codesensei-api.up.railway.app`).
6. The service will automatically rebuild. Once it is green/active, copy that public Domain URL.

---

## Part 3: Connecting Them Together

Now that both are live, you need to tell the Next.js frontend where the Railway API is.

1. Go back to your **Vercel Project Dashboard**.
2. Go to **Settings** → **Environment Variables**.
3. Add a new variable: `NEXT_PUBLIC_API_URL` and set it to your Railway URL (e.g., `https://codesensei-api.up.railway.app` — no trailing slash).
4. Go to the **Deployments** tab, click the 3 dots next to the most recent deployment, and click **Redeploy**. This injects the new variable into the frontend.

---

## Final Checklist
- [ ] Vercel deployment green ✅
- [ ] Backend Railway deployment green ✅
- [ ] Railway Public Domain URL copied ✅
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel to point to Railway ✅
- [ ] Visit your Vercel frontend URL and trigger a task generation!
