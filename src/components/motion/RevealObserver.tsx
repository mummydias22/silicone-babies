"use client";
import { useEffect } from "react";

// Server components just add className="reveal" (+ style --i for stagger); this reveals them on scroll.
// A MutationObserver also picks up content that streams in after hydration (pages with loading.tsx).
export default function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll(".reveal:not(.in)").forEach((e) => { if (!seen.has(e)) { seen.add(e); io.observe(e); } });
    let raf = 0;
    const mo = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; scan(); }); });
    scan();
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
