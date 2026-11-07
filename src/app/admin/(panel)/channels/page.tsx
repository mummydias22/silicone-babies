import Link from "next/link";
import { db, orderChannels } from "@/db";
import FormSwitch from "@/components/FormSwitch";
import InstantSwitch from "@/components/InstantSwitch";
import { addChannel, deleteChannel, toggleChannel, updateChannel } from "../../actions";

export const metadata = { title: "Order channels" };

// Starters: replace YOUR_... with your own handle. {text} is replaced by the order details when the app supports it.
const PRESETS: [string, string][] = [
  ["Telegram", "https://t.me/YOUR_USERNAME"],
  ["Messenger", "https://m.me/YOUR_PAGE"],
  ["Instagram", "https://ig.me/m/YOUR_USERNAME"],
  ["Viber", "viber://chat?number=YOUR_NUMBER"],
  ["Line", "https://line.me/ti/p/YOUR_ID"],
  ["Signal", "https://signal.me/#p/YOUR_NUMBER"],
  ["WeChat", "weixin://dl/chat?YOUR_ID"],
];

export default async function AdminChannels() {
  const list = await db.select().from(orderChannels).orderBy(orderChannels.id);
  const have = new Set(list.map((c) => c.name));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Order channels</h1>
      <p className="mt-1 text-sm text-stone-600">
        A channel is how a customer sends you their order. <b>Email, WhatsApp and text message</b> are switched on in{" "}
        <Link href="/admin/settings" className="underline">Settings</Link>; add any other app here. At least one channel must be on, or checkout is unavailable.
      </p>

      <div className="mt-4 space-y-2">
        {list.map((c) => (
          <details key={c.id} className="card">
            <summary className="flex cursor-pointer items-center gap-3">
              <span className="min-w-0 flex-1"><span className="block font-medium">{c.name}</span><span className="block truncate text-sm text-stone-600">{c.link}</span></span>
              <InstantSwitch id={c.id} enabled={c.enabled} label={c.name} save={toggleChannel} />
            </summary>
            <form action={updateChannel} className="mt-4 space-y-3 border-t border-stone-200 pt-4">
              <input type="hidden" name="id" value={c.id} />
              <div><label className="label">Name<input name="name" required defaultValue={c.name} className="input mt-1 font-normal" /></label></div>
              <div><label className="label">Link<input name="link" required defaultValue={c.link} className="input mt-1 font-normal" /></label></div>
              <button type="submit" className="btn">Save changes</button>
            </form>
            <form action={deleteChannel} className="mt-2"><input type="hidden" name="id" value={c.id} /><button type="submit" className="min-h-11 text-sm text-red-600 underline">Delete this channel</button></form>
          </details>
        ))}
        {!list.length && <p className="text-stone-600">No extra channels yet.</p>}
      </div>

      <section className="card mt-6">
        <h2 className="font-semibold">Quick add</h2>
        <p className="mt-1 text-sm text-stone-600">Adds the channel, then open it and replace the YOUR_… part with your own handle.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.filter(([n]) => !have.has(n)).map(([name, link]) => (
            <form key={name} action={addChannel}>
              <input type="hidden" name="name" value={name} /><input type="hidden" name="link" value={link} /><input type="hidden" name="enabled" value="" />
              <button type="submit" className="btn-outline">+ {name}</button>
            </form>
          ))}
        </div>
      </section>

      <form action={addChannel} className="card mt-4 space-y-3">
        <h2 className="font-semibold">Add your own</h2>
        <div><label className="label" htmlFor="name">Name shown to customers</label><input id="name" name="name" required placeholder="e.g. Telegram" className="input" /></div>
        <div>
          <label className="label" htmlFor="link">Link</label>
          <input id="link" name="link" required placeholder="https://t.me/yourname" className="input" />
          <p className="mt-1 text-xs text-stone-500">
            Must start with https:// (or an app link like viber://). Put <code>{"{text}"}</code> where the order details should go, e.g. <code>https://wa.me/123?text={"{text}"}</code>.
            Apps that can&apos;t prefill a message show the customer a &quot;Copy order details&quot; button instead.
          </p>
        </div>
        <FormSwitch name="enabled" label="Enabled" defaultChecked />
        <button type="submit" className="btn">Add channel</button>
      </form>
    </div>
  );
}
