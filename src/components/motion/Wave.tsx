// Wavy section edge. Fill with the colour of the NEXT section; flip to put it on the bottom.
export default function Wave({ fill = "var(--background)", flip = false, drift = false }: { fill?: string; flip?: boolean; drift?: boolean }) {
  const path = "M0 40 C 150 0 300 80 450 40 C 600 0 750 80 900 40 C 1050 0 1200 80 1350 40 C 1500 0 1650 80 1800 40 L1800 80 L0 80 Z";
  return (
    <div aria-hidden className={`pointer-events-none block h-10 w-full overflow-hidden leading-[0] sm:h-14 ${flip ? "rotate-180" : ""}`}>
      <svg viewBox="0 0 1800 80" preserveAspectRatio="none" className={`h-full w-[200%] ${drift ? "wave-layer" : ""}`}>
        <path d={path} fill={fill} />
      </svg>
    </div>
  );
}
