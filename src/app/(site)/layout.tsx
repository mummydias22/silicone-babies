import Link from "next/link";
import { getSettings } from "@/lib/settings";
import MobileMenu from "@/components/MobileMenu";
import CartLink from "@/components/CartLink";
import LiveChat from "@/components/LiveChat";
import Petals from "@/components/motion/Petals";
import ScrollChrome from "@/components/motion/ScrollChrome";
import RevealObserver from "@/components/motion/RevealObserver";
import Wave from "@/components/motion/Wave";
import { CurrencyProvider } from "@/components/Currency";
import { db, categories } from "@/db";

const LINKS = [
  { href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" }, { href: "/faqs", label: "FAQs" }, { href: "/contact", label: "Contact" },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, cats] = await Promise.all([getSettings(), db.select().from(categories).orderBy(categories.id)]);
  return (
    <CurrencyProvider currency={s.currency}>
      <ScrollChrome />
      <RevealObserver />
      {s.banner && <div className="bg-brand px-4 py-2 text-center text-sm text-white">{s.banner}</div>}
      <header className="site-header sticky top-0 z-40 border-b border-stone-200/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="font-serif text-2xl font-semibold text-brand-dark">{s.storeName}</Link>
          <nav aria-label="Main" className="hidden gap-8 text-sm md:flex">
            {LINKS.map((l) => <Link key={l.href} href={l.href} className="py-2 transition hover:text-brand">{l.label}</Link>)}
          </nav>
          <div className="flex items-center"><Petals /><CartLink /><MobileMenu links={LINKS} /></div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="relative mt-20 bg-soft">
        <div className="absolute inset-x-0 top-0 -translate-y-full" aria-hidden>
          <Wave fill="var(--soft)" drift />
          {[6, 22, 38, 54, 70, 86].map((l, k) => (
            <span key={l} className="footer-petal" style={{ left: `${l}%`, bottom: "0.5rem", "--d": `${k * 1.1}s`, "--dx": `${k % 2 ? -26 : 30}px` } as React.CSSProperties} />
          ))}
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3">
          <div><p className="font-serif text-2xl text-brand-dark">{s.storeName}</p><p className="mt-2 text-stone-600">{s.tagline}</p></div>
          <div className="space-y-1">
            <p className="font-medium">Shop</p>
            {cats.filter((c) => !c.parentId).map((c) => <Link key={c.id} href={`/shop?category=${c.slug}`} className="block py-1 hover:text-brand">{c.name}</Link>)}
          </div>
          <div className="space-y-1">
            <p className="font-medium">Contact</p>
            {s.address && <p>{s.address}</p>}
            {s.phone && <p><a href={`tel:${s.phone}`} className="hover:text-brand">{s.phone}</a></p>}
            {s.email && <p><a href={`mailto:${s.email}`} className="hover:text-brand">{s.email}</a></p>}
          </div>
        </div>
      </footer>
      {s.whatsappFloat && s.whatsappNumber && (
        <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
          className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-105 hover:bg-green-600 md:bottom-5 md:right-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.300 1.200-1.800 1.200-.5.1-1 .2-3.300-.7-2.800-1.100-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500.2.600.8 2 .9 2.100.1.100.1.300 0 .5-.1.200-.2.300-.3.500l-.5.500c-.2.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.5.100.6-.1l.9-1.100c.2-.3.400-.2.600-.1l1.900.9c.3.100.5.200.5.300.1.200.1.800-.100 1.300z" /></svg>
        </a>
      )}
      {s.liveChatEnabled && s.liveChat && <LiveChat html={s.liveChat} />}
    </CurrencyProvider>
  );
}
