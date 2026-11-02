"use client";
import { useEffect, useRef } from "react";

// Moves its child slower than the page. transform only; rAF-throttled; paused when off-screen.
export default function Parallax({ children, className = "", speed = 0.18 }: { children: React.ReactNode; className?: string; speed?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const b = box.current, i = inner.current;
    if (!b || !i || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, visible = false;
    const update = () => {
      raf = 0;
      const r = b.getBoundingClientRect();
      i.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -speed}px, 0)`;
    };
    const onScroll = () => { if (visible && !raf) raf = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) onScroll(); });
    io.observe(b);
    addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [speed]);
  return (
    <div ref={box} className={`relative overflow-hidden ${className}`}>
      <div ref={inner} className="absolute -inset-y-[18%] inset-x-0 will-change-transform">{children}</div>
    </div>
  );
}
