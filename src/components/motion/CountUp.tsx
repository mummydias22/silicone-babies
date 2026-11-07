"use client";
import { useEffect, useRef, useState } from "react";
import { useMoney } from "@/components/Currency";

// Animated money total. Instant under reduced motion.
export default function CountUp({ cents }: { cents: number }) {
  const money = useMoney();
  const [shown, setShown] = useState(cents);
  const from = useRef(cents);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || from.current === cents) { from.current = cents; setShown(cents); return; }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(a + (cents - a) * e));
      if (k < 1) raf = requestAnimationFrame(step); else from.current = cents;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [cents]);
  return <span>{money(shown)}</span>;
}
