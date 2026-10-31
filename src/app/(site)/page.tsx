import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, products, categories, testimonials, posts } from "@/db";
import { getSettings } from "@/lib/settings";
import ProductCard from "./ProductCard";

const STEPS = [
  ["1", "Choose your baby", "Browse the shop and pick the options you like."],
  ["2", "Send your order", "Check out and send the order to us by email, WhatsApp or text."],
  ["3", "Pay & receive", "We reply with payment details, then ship your baby with care."],
];

export default async function Home() {
  const [s, cats, latest, tests, blog] = await Promise.all([
    getSettings(),
    db.select().from(categories),
    db.select().from(products).where(eq(products.published, true)).orderBy(desc(products.createdAt)).limit(8),
    db.select().from(testimonials).limit(3),
    db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt)).limit(3),
  ]);
  return (
    <>
      <section className="bg-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-brand-dark sm:text-5xl">{s.tagline}</h1>
            <p className="mt-4 max-w-md text-stone-700">Hand-finished silicone babies with soft skin, delicate details and a weighted, cuddly feel.</p>
            <Link href="/shop" className="btn mt-6">Shop babies</Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&q=75" alt="Silicone baby" className="aspect-[4/3] w-full min-w-0 rounded-3xl object-cover" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-2xl font-semibold">Shop by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cats.map((c) => <Link key={c.id} href={`/shop?category=${c.slug}`} className="card text-center font-medium hover:border-brand">{c.name}</Link>)}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-2xl font-semibold">Latest babies</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{latest.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-2xl font-semibold">How ordering works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <div key={n} className="card"><span className="text-brand">{n}</span><p className="font-semibold">{t}</p><p className="text-sm text-stone-600">{d}</p></div>
          ))}
        </div>
      </section>
      {tests.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <h2 className="text-2xl font-semibold">Happy families</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {tests.map((t) => (
              <figure key={t.id} className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {t.photo && <img src={t.photo} alt="" className="mb-3 h-14 w-14 rounded-full object-cover" />}
                <blockquote className="text-sm">“{t.quote}”</blockquote>
                <figcaption className="mt-2 text-sm font-medium">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      {blog.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <h2 className="text-2xl font-semibold">From the blog</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {blog.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="card hover:border-brand">
                <p className="font-semibold">{b.title}</p><p className="mt-1 text-sm text-stone-600">{b.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
