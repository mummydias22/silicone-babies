export const metadata = { title: "About" };

const PRINCIPLES = [
  ["Crafted with care", "Every baby is finished by hand, with attention to skin tone, details and expression."],
  ["Honest ordering", "No payment on the site. You order, we reply personally with payment details."],
  ["Made to be loved", "Collector and comfort dolls with a soft, weighted feel. Not toys for children under 14."],
];

export default function About() {
  return (
    <>
      <section className="relative flex min-h-72 items-center bg-stone-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1600&q=70" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <h1 className="relative mx-auto w-full max-w-6xl px-4 text-5xl font-semibold text-white">About us</h1>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Our principles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PRINCIPLES.map(([t, d]) => <div key={t} className="card"><p className="font-semibold text-brand-dark">{t}</p><p className="mt-1 text-sm text-stone-600">{d}</p></div>)}
        </div>
        <h2 className="mt-12 text-2xl font-semibold">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {["1522771930-78848d9293e8", "1544126592-807ade215a0b", "1471286174890-9c112ffca5b4"].map((id) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={id} src={`https://images.unsplash.com/photo-${id}?w=700&q=70`} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          ))}
        </div>
      </section>
    </>
  );
}
