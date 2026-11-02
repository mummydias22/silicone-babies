"use client";
import { useRef } from "react";

// Tilt + glare on pointer (mouse/pen follow the cursor; touch tilts toward the tap point briefly).
export default function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const set = (e: React.PointerEvent) => {
    const n = el.current;
    if (!n) return;
    const r = n.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    n.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
    n.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    n.style.setProperty("--gx", `${px * 100}%`);
    n.style.setProperty("--gy", `${py * 100}%`);
  };
  const reset = () => {
    const n = el.current;
    if (!n) return;
    n.style.setProperty("--rx", "0deg"); n.style.setProperty("--ry", "0deg");
    n.removeAttribute("data-active");
  };
  return (
    <div ref={el} className={`tilt relative ${className}`}
      onPointerMove={(e) => e.pointerType !== "touch" && set(e)}
      onPointerDown={(e) => { if (e.pointerType === "touch") { el.current?.setAttribute("data-active", "true"); set(e); } }}
      onPointerUp={() => setTimeout(reset, 250)} onPointerLeave={reset} onPointerCancel={reset}>
      {children}
      <span className="tilt-glare rounded-[inherit]" aria-hidden />
    </div>
  );
}
