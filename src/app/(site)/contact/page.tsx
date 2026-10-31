import { db, faqs } from "@/db";
import { getSettings } from "@/lib/settings";
import { sendContact } from "./actions";

export const metadata = { title: "Contact" };

export default async function Contact({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  const [s, list] = await Promise.all([getSettings(), db.select().from(faqs).limit(5)]);
  const cards = [
    s.address && { label: "Address", value: s.address, href: `https://maps.google.com/?q=${encodeURIComponent(s.address)}` },
    s.phone && { label: "Phone", value: s.phone, href: `tel:${s.phone}` },
    s.email && { label: "Email", value: s.email, href: `mailto:${s.email}` },
  ].filter(Boolean) as { label: string; value: string; href: string }[];
  return (
    <>
      <section className="bg-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <h1 className="text-4xl font-semibold text-brand-dark">Contact us</h1>
            <p className="mt-3 text-stone-700">Questions about a baby or an order? Send us a message.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=70" alt="" className="mt-6 aspect-video w-full rounded-2xl object-cover" />
          </div>
          <form action={sendContact} className="card min-w-0 space-y-3 shadow-sm">
            {sent && <p role="status" className="rounded-lg bg-green-50 p-2 text-sm text-green-700">Message sent. Thank you!</p>}
            <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required className="input" /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
            <div><label className="label" htmlFor="message">Message</label><textarea id="message" name="message" rows={4} required className="input" /></div>
            <button type="submit" className="btn w-full">Send message</button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10">
        {cards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((c) => (
              <a key={c.label} href={c.href} className="card hover:border-brand"><p className="text-sm text-stone-500">{c.label}</p><p className="font-medium">{c.value}</p></a>
            ))}
          </div>
        )}
        {s.mapEnabled && s.address && (
          <iframe title="Map" loading="lazy" className="mt-8 h-80 w-full rounded-2xl border-0"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`} />
        )}
        {list.length > 0 && (
          <div className="mt-10 space-y-2">
            <h2 className="text-2xl font-semibold">Common questions</h2>
            {list.map((f) => <details key={f.id} className="card"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-2 text-sm">{f.answer}</p></details>)}
          </div>
        )}
      </section>
    </>
  );
}
