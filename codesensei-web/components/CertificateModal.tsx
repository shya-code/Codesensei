"use client";
import { useRef, useEffect } from "react";
import { drawCertificate } from "@/lib/certificateEngine";

type Tier = "beginner" | "intermediate" | "advanced";

interface Props {
  tier: Tier;
  onClose: () => void;
}

export default function CertificateModal({ tier, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawCertificate(tier, canvasRef.current);
    }
  }, [tier]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `codesensei-${tier}-certificate.png`;
    a.click();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        zIndex: 500, backdropFilter: "blur(4px)",
      }} />
      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 501, background: "var(--bg)", border: "var(--border)",
        borderRadius: 8, padding: "1.5rem", boxShadow: "var(--shadow)",
        display: "flex", flexDirection: "column", gap: "1rem",
        alignItems: "center", maxWidth: "96vw",
      }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "1.3rem" }}>
          🎓 Certificate Earned!
        </div>
        <canvas ref={canvasRef} style={{ maxWidth: "100%", border: "var(--border)", borderRadius: 4 }} />
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <button className="btn-filled" onClick={handleDownload}>⬇ Download PNG</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}
