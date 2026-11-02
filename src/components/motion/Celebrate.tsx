"use client";
import { useEffect } from "react";

// Order-confirmation success: animated check + a petal burst (skipped under reduced motion).
export default function Celebrate() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => dispatchEvent(new CustomEvent("petal-burst", { detail: { x: innerWidth / 2, y: innerHeight * 0.3, n: 60 } })), 350);
    return () => clearTimeout(t);
  }, []);
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden className="pop mb-4">
      <circle cx="36" cy="36" r="34" fill="var(--soft)" stroke="var(--brand)" strokeWidth="2" />
      <path d="M22 37l10 10 18-21" fill="none" stroke="var(--brand-dark)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="draw" />
    </svg>
  );
}
