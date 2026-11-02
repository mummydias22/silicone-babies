"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type P = { x: number; y: number; s: number; vy: number; vx: number; rot: number; vr: number; ph: number; hue: number };
const KEY = "sb-petals";

// Ambient floating petals. Reacts to scroll speed, device tilt, pointer and taps.
export default function Petals() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  // Default: on, unless the user said off or prefers reduced motion.
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // localStorage only exists on the client, so it has to be read after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(saved ? saved === "1" : !reduced);
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    const next = !on;
    setOn(next);
    try { localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
    // iOS only delivers tilt after an explicit permission prompt from a user gesture.
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (next && D.requestPermission) D.requestPermission().catch(() => {});
  }, [on]);

  useEffect(() => {
    const c = canvas.current;
    if (!on || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const small = matchMedia("(max-width: 768px)").matches;
    const MAX = small ? 18 : 48;
    const dpr = Math.min(2, devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0, last = 0, tilt = 0, scrollV = 0, lastY = scrollY;
    const ptr = { x: -999, y: -999 };
    const petals: P[] = [];

    const make = (x = Math.random() * w, y = -20, burst = false): P => ({
      x, y, s: 9 + Math.random() * 10, vy: burst ? -60 - Math.random() * 120 : 22 + Math.random() * 38,
      vx: burst ? (Math.random() - 0.5) * 260 : (Math.random() - 0.5) * 18, rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 2.2, ph: Math.random() * 6.28, hue: Math.random(),
    });
    const resize = () => {
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    for (let i = 0; i < MAX; i++) petals.push(make(undefined, Math.random() * h));

    const draw = (p: P) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.75 + 0.25 * Math.abs(Math.sin(p.ph)));
      ctx.fillStyle = p.hue > 0.5 ? "rgba(243,200,208,0.85)" : "rgba(236,170,186,0.8)";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s * 0.55, p.s, 0, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      scrollV *= 0.92;
      ctx.clearRect(0, 0, w, h);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.ph += dt * 2; p.rot += p.vr * dt;
        p.vx += tilt * dt * 30 - p.vx * dt * 0.8;
        p.x += (p.vx + Math.sin(p.ph) * 14) * dt;
        p.y += (p.vy + scrollV * 0.35) * dt;
        p.vy += (30 - p.vy) * dt * 0.4; // burst petals settle back to a gentle fall
        const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { const f = (1 - d2 / 9000) * 260 * dt; p.x += (dx / Math.sqrt(d2 || 1)) * f; p.y += (dy / Math.sqrt(d2 || 1)) * f; }
        if (p.y > h + 24 || p.x < -40 || p.x > w + 40 || p.y < -400) {
          if (petals.length > MAX) petals.splice(i, 1); else petals[i] = make();
        } else draw(p);
      }
    };

    const onScroll = () => { scrollV = Math.max(-1200, Math.min(1200, (scrollY - lastY) * 60)); lastY = scrollY; };
    const onMove = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY; };
    const onLeave = () => { ptr.x = ptr.y = -999; };
    const burst = (x: number, y: number, n = 8) => { for (let i = 0; i < n; i++) petals.push(make(x, y, true)); };
    const onTap = (e: PointerEvent) => burst(e.clientX, e.clientY, 6);
    const onBurst = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number; n?: number }>).detail;
      burst(d.x, d.y, d.n ?? 40);
    };
    const onTilt = (e: DeviceOrientationEvent) => { tilt = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30)) * 6; };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    raf = requestAnimationFrame(frame);
    addEventListener("resize", resize);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onTap, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    addEventListener("deviceorientation", onTilt);
    addEventListener("petal-burst", onBurst);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onTap);
      document.removeEventListener("pointerleave", onLeave);
      removeEventListener("deviceorientation", onTilt);
      removeEventListener("petal-burst", onBurst);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [on]);

  return (
    <>
      {on && <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[25] h-full w-full" />}
      {ready && (
        <button type="button" onClick={toggle} aria-pressed={on} aria-label={on ? "Turn petals off" : "Turn petals on"} title="Petals"
          className={`flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-soft ${on ? "text-brand" : "text-stone-400"}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2c3 3 4 6 0 10-4-4-3-7 0-10zm8 6c1 4-1 7-6 6 0-5 2-7 6-6zM4 8c4-1 6 1 6 6-5 1-7-2-6-6zm2 11c-1-4 1-6 5-6 1 4-1 6-5 6zm12 0c-4 0-6-2-5-6 4 0 6 2 5 6z" /></svg>
          {!on && <span className="absolute h-0.5 w-6 -rotate-45 rounded bg-stone-400" aria-hidden />}
        </button>
      )}
    </>
  );
}
