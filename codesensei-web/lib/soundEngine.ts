// lib/soundEngine.ts
// Meme sound effects for CodeSensei — 100% Web Audio API, zero external files.
// All logic is client-safe. Only plays when user has sounds enabled.

const STORAGE_KEY = "cs_sounds_enabled";

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function isSoundEnabled(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== "off"; }
  catch { return false; }
}

export function setSoundEnabled(on: boolean): void {
  try { localStorage.setItem(STORAGE_KEY, on ? "on" : "off"); }
  catch { /* silently fail */ }
}

// ─── Audio context factory ────────────────────────────────────────────────────

function getCtx(): AudioContext | null {
  try { return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); }
  catch { return null; }
}

// ─── 1. FAIL — sad descending trombone slide "FAHHHH" ────────────────────────

export function playFail(): void {
  if (!isSoundEnabled()) return;
  const audio = new Audio("/sounds/fahh.mp3");
  audio.volume = 0.5; // match the original mix volume
  audio.play().catch(() => { /* ignore auto-play policies if they block it */ });
}

// ─── 2. SUCCESS — crowd clapping ─────────────────────────────────────────────

export function playSuccess(): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const CLAP_TIMES = [0, 0.18, 0.36, 0.54, 0.72, 0.90]; // 6 claps

  CLAP_TIMES.forEach((t) => {
    // Each clap = burst of white noise with short decay
    const bufLen = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.5);
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, ctx.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.1);

    // High-pass to make it crisp
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;

    src.connect(hp);
    hp.connect(g);
    g.connect(ctx.destination);
    src.start(ctx.currentTime + t);
  });

  setTimeout(() => ctx.close(), 2000);
}

// ─── 3. HINT — "Yeah Boi" ascending cheerful melody ─────────────────────────

export function playHint(): void {
  if (!isSoundEnabled()) return;
  const audio = new Audio("/sounds/level_sabke_niklenge.mp3");
  audio.volume = 0.6; 
  audio.play().catch(() => { /* ignore auto-play policies if they block it */ });
}
