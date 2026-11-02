"use client";
import { useEffect, useRef } from "react";

// Top progress bar + header shadow. Header size never changes (no layout shift).
export default function ScrollChrome() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      document.querySelector(".site-header")?.setAttribute("data-scrolled", String(y > 8));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={bar} aria-hidden className="fixed inset-x-0 top-0 z-[60] h-1 origin-left scale-x-0 bg-brand" />;
}
