import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, products, categories, testimonials, posts } from "@/db";
import { getSettings, money } from "@/lib/settings";
import { toCards } from "@/lib/shop";
import ProductCard from "./ProductCard";
import HeroSlider, { type Slide } from "@/components/motion/HeroSlider";
import Marquee from "@/components/motion/Marquee";
import Tilt from "@/components/motion/Tilt";
import Parallax from "@/components/motion/Parallax";
import Wave from "@/components/motion/Wave";

const STEPS = [
  ["1", "Choose your baby", "Browse the shop and pick the options you like."],
  ["2", "Send your order", "Check out and send the order to us by email, WhatsApp or text."],
  ["3", "Pay & receive", "We reply with payment details, then ship your baby with care."],
];
const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default async function Home() {
  const [s, cats, latest, tests, blog] = await Promise.all([
    getSettings(),
    db.select().from(categories).orderBy(categories.id),
    db.select().from(products).where(eq(products.published, true)).orderBy(desc(products.createdAt)).limit(8),
    db.select().from(testimonials).orderBy(testimonials.id).limit(3),
    db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt)).limit(3),
  ]);
  const cards = await toCards(latest);

  // Hero slides come from the newest products' uploaded photos; no photos yet = soft gradient slides.
  const withPhoto = latest.filter((p) => p.images[0]).slice(0, 4);
  const slides: Slide[] = withPhoto.length
    ? withPhoto.map((p, k) => ({
        img: p.images[0], eyebrow: k === 0 ? s.storeName : "New arrival", title: k === 0 ? s.tagline : p.name,
        sub: k === 0 ? "Hand-finished silicone babies with soft skin and a weighted, cuddly feel." : `From ${money(p.price)}`,
        href: `/product/${p.slug}`, cta: k === 0 ? `Meet ${p.name.split(",")[0]}` : "View baby",
      }))
    : [{ img: null, eyebrow: s.storeName, title: s.tagline, sub: "Hand-finished silicone babies with soft skin and a weighted, cuddly feel.", href: "/shop", cta: "Shop babies" }];

  const ticker = [s.banner, "Hand-finished silicone babies", "Order by email, WhatsApp or text", "No payment on the site: we reply with payment details", ...cats.map((c) => c.name)].filter(Boolean);
  const tileImg = (id: number) => latest.find((p) => p.categoryId === id && p.images[0])?.images[0] ?? null;
  const bannerImg = latest.find((p) => p.images[1])?.images[1] ?? null;

  return (
    <>
      <HeroSlider slides={slides} />
      <Marquee items={ticker} />

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="reveal"><p className="eyebrow">Browse</p><h2 className="mt-1 text-3xl font-semibold sm:text-4xl">Shop by category</h2></div>
        {/* reveal sits on the row, not each tile: tiles scrolled off to the side must never be stuck invisible */}
        <div className="snap-row reveal mt-6 pb-2">
          {cats.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="block">
              <Tilt className="aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-soft to-blush">
                {tileImg(c.id) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tileImg(c.id)!} alt="" loading="lazy" className="absolute inset-0 h-full w-full rounded-[inherit] object-cover" />
                )}
                <span className="absolute inset-x-0 bottom-0 rounded-b-[inherit] bg-gradient-to-t from-[#3b2a30]/75 to-transparent p-5 pt-12 font-serif text-2xl text-white">{c.name}</span>
              </Tilt>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="reveal flex items-end justify-between gap-4">
          <div><p className="eyebrow">Just in</p><h2 className="mt-1 text-3xl font-semibold sm:text-4xl">Latest babies</h2></div>
          <Link href="/shop" className="btn-outline">View all</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {cards.map((p, k) => <div key={p.id} className="reveal" style={stagger(k % 4)}><ProductCard p={p} /></div>)}
        </div>
      </section>

      <section className="mt-24">
        <Wave fill="var(--soft)" />
        <Parallax className="min-h-[360px] bg-soft">
          {bannerImg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerImg} alt="" loading="lazy" className="h-full w-full object-cover opacity-40" />
          )}
        </Parallax>
        <div className="-mt-[360px] flex min-h-[360px] items-center justify-center bg-transparent px-4 text-center">
          <div className="reveal relative max-w-xl">
            <p className="eyebrow">Made to be cuddled</p>
            <h2 className="mt-2 text-3xl font-semibold text-brand-dark sm:text-5xl">Soft skin. Gentle weight. Lifelike detail.</h2>
            <Link href="/about" className="btn mt-6">Our story</Link>
          </div>
        </div>
        <Wave fill="var(--background)" />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="reveal text-3xl font-semibold sm:text-4xl">How ordering works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([n, t, d], k) => (
            <div key={n} className="card reveal" style={stagger(k)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft font-serif text-lg text-brand-dark">{n}</span>
              <p className="mt-3 text-lg font-semibold">{t}</p><p className="mt-1 text-stone-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {tests.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20">
          <h2 className="reveal text-3xl font-semibold sm:text-4xl">Happy families</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {tests.map((t, k) => (
              <figure key={t.id} className="card reveal" style={stagger(k)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {t.photo && <img src={t.photo} alt="" loading="lazy" className="mb-3 h-14 w-14 rounded-full object-cover" />}
                <blockquote className="text-base">“{t.quote}”</blockquote>
                <figcaption className="mt-3 text-sm font-medium text-brand-dark">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {blog.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20">
          <h2 className="reveal text-3xl font-semibold sm:text-4xl">From the blog</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {blog.map((b, k) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="card reveal lift block" style={stagger(k)}>
                <p className="text-lg font-semibold">{b.title}</p><p className="mt-1 text-stone-600">{b.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
