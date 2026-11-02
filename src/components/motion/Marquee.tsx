// Pure CSS ticker; the second copy is aria-hidden so screen readers read the items once.
export default function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={i} className="flex items-center whitespace-nowrap px-6 text-sm font-medium tracking-wide">
          {t}<span className="ml-12 text-blush" aria-hidden>✿</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden bg-brand-dark py-3 text-white">
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}
