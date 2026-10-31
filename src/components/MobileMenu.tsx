"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type L = { href: string; label: string };

// Drawer is portaled to body: a sticky backdrop-blur header traps position:fixed children.
export default function MobileMenu({ links, footer }: { links: L[]; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <>
      <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}
        className="rounded-lg p-2 hover:bg-soft focus-visible:outline-2 focus-visible:outline-brand md:hidden">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav aria-label="Menu" className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-1 bg-white p-4 shadow-xl">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="mb-2 self-end rounded-lg p-2 hover:bg-soft">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            {links.map((l) => {
              const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-lg ${active ? "bg-soft font-semibold text-brand-dark" : "hover:bg-stone-100"}`}>
                  {l.label}
                </Link>
              );
            })}
            {footer && <div className="mt-auto">{footer}</div>}
          </nav>
        </div>, document.body)}
    </>
  );
}
