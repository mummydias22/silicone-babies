"use client";
import Link from "next/link";
import { useRef, useState } from "react";

export type Slide = { img: string | null; eyebrow: string; title: string; sub: string; href: string; cta: string };
const GRADIENTS = [
  "linear-gradient(135deg,#f6e6e4,#f3d3d6)",
  "linear-gradient(135deg,#fbeee9,#ecc4cc)",
  "linear-gradient(135deg,#f3d3d6,#fdf8f4)",
];

// Auto-advancing (progress bar drives it), swipeable, pauses on hover/touch. No auto-advance under reduced motion.
export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const x0 = useRef<number | null>(null);
  const n = slides.length;
  const go = (k: number) => setI(((k % n) + n) % n);

  return (
    <section aria-roledescription="carousel" aria-label="Featured babies"
      className="relative h-[78svh] min-h-[480px] max-h-[760px] w-full select-none overflow-hidden bg-soft [touch-action:pan-y]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onPointerDown={(e) => { x0.current = e.clientX; if (e.pointerType === "touch") setPaused(true); }}
      onPointerUp={(e) => {
        if (x0.current !== null) { const dx = e.clientX - x0.current; if (Math.abs(dx) > 45) go(i + (dx < 0 ? 1 : -1)); }
        x0.current = null; if (e.pointerType === "touch") setPaused(false);
      }}
      onPointerCancel={() => { x0.current = null; setPaused(false); }}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {slides.map((s, k) => {
        const active = k === i;
        return (
          <div key={k} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-1000 ${active ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ background: GRADIENTS[k % GRADIENTS.length] }}>
            {s.img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={active ? "on" : "off"} src={s.img} alt="" loading={k === 0 ? "eager" : "lazy"} className={`absolute inset-0 h-full w-full object-cover ${active ? "kb" : ""}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3b2a30]/70 via-[#3b2a30]/15 to-transparent" />
            {active && (
              <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-20 text-white sm:pb-24">
                <p className="rise eyebrow !text-blush" style={{ "--d": "0.1s" } as React.CSSProperties}>{s.eyebrow}</p>
                <h1 className="rise mt-2 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl" style={{ "--d": "0.25s" } as React.CSSProperties}>{s.title}</h1>
                <p className="rise mt-3 max-w-md text-base text-white/90" style={{ "--d": "0.4s" } as React.CSSProperties}>{s.sub}</p>
                <Link href={s.href} className="btn rise mt-6" style={{ "--d": "0.55s" } as React.CSSProperties}>{s.cta}</Link>
              </div>
            )}
          </div>
        );
      })}
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-6xl items-center gap-3 px-4 pb-6">
          <div role="tablist" aria-label="Choose slide" className="flex gap-1">
            {slides.map((_, k) => (
              <button key={k} role="tab" type="button" aria-selected={k === i} aria-label={`Slide ${k + 1}`} onClick={() => go(k)}
                className="flex h-11 w-8 items-center justify-center">
                <span className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
              </button>
            ))}
          </div>
          <div className="h-0.5 flex-1 overflow-hidden rounded bg-white/30" aria-hidden>
            <div key={i} className="h-full origin-left bg-white" onAnimationEnd={() => go(i + 1)}
              style={{ animation: "progress 6s linear forwards", animationPlayState: paused ? "paused" : "running" }} />
          </div>
        </div>
      )}
    </section>
  );
}
