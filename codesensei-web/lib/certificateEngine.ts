// lib/certificateEngine.ts
// Checks tier completion and generates downloadable canvas certificates.

import { getProgress } from "./storage";
import { TOPICS } from "./topics-data";

type Tier = "beginner" | "intermediate" | "advanced";

/** Returns true if all topics in the given tier are completed */
export function checkTierCompletion(tier: Tier): boolean {
  try {
    const progress = getProgress();
    const tierTopics = TOPICS.filter((t) => t.difficulty === tier);
    return tierTopics.every((t) => progress.topicsCompleted.includes(t.concept));
  } catch {
    return false;
  }
}

/** Draws a styled certificate on a canvas element and returns a data URL */
export function drawCertificate(
  tier: Tier,
  canvasEl: HTMLCanvasElement
): string {
  const W = 900;
  const H = 620;
  canvasEl.width = W;
  canvasEl.height = H;
  const ctx = canvasEl.getContext("2d")!;

  const tierMeta: Record<Tier, { label: string; emoji: string; color: string }> = {
    beginner:     { label: "Python Beginner",     emoji: "🌱", color: "#4caf50" },
    intermediate: { label: "Python Intermediate",  emoji: "⚙️", color: "#ff9f1c" },
    advanced:     { label: "Python Advanced",      emoji: "🏆", color: "#e84545" },
  };
  const { label, emoji, color } = tierMeta[tier];

  // Background
  ctx.fillStyle = "#fefdf8";
  ctx.fillRect(0, 0, W, H);

  // Border frame
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  // Header
  ctx.fillStyle = "#111";
  ctx.font = "bold 52px serif";
  ctx.textAlign = "center";
  ctx.fillText("CodeSensei", W / 2, 110);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#555";
  ctx.fillText("Certificate of Completion", W / 2, 148);

  // Divider
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 170);
  ctx.lineTo(W - 80, 170);
  ctx.stroke();

  // Emoji
  ctx.font = "72px serif";
  ctx.fillText(emoji, W / 2, 275);

  // Tier label
  ctx.fillStyle = color;
  ctx.font = "bold 36px serif";
  ctx.fillText(label, W / 2, 340);

  ctx.fillStyle = "#111";
  ctx.font = "22px sans-serif";
  ctx.fillText("has successfully mastered all topics in the", W / 2, 390);

  ctx.font = "bold 26px serif";
  ctx.fillStyle = color;
  ctx.fillText(`${tier.charAt(0).toUpperCase() + tier.slice(1)} Python Curriculum`, W / 2, 430);

  // Date
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    W / 2,
    490
  );

  // Footer
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 520);
  ctx.lineTo(W - 80, 520);
  ctx.stroke();

  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#aaa";
  ctx.fillText("CodeSensei — AI Code Diagnostic & Learning Engine", W / 2, 548);

  return canvasEl.toDataURL("image/png");
}
