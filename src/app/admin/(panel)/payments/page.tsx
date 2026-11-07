import { db, paymentMethods } from "@/db";
import FormSwitch from "@/components/FormSwitch";
import InstantSwitch from "@/components/InstantSwitch";
import { addPayment, deletePayment, togglePayment, updatePayment } from "../../actions";

export const metadata = { title: "Payment methods" };

// One-click starters; the admin can edit the instructions afterwards (bank details, handles, wallet addresses...).
const PRESETS: [string, string][] = [
  ["Bank transfer", "Bank details will be sent to you after we receive your order."],
  ["Cash on delivery", "Pay in cash when your order arrives."],
  ["PayPal", "We will send you a PayPal payment request after your order."],
  ["Zelle", "We will send you our Zelle details after your order."],
  ["Cash App", "We will send you our Cash App $cashtag after your order."],
  ["Venmo", "We will send you our Venmo handle after your order."],
  ["Wise", "We will send you our Wise payment details after your order."],
  ["Western Union", "We will send you the Western Union transfer details after your order."],
  ["MoneyGram", "We will send you the MoneyGram transfer details after your order."],
  ["Mobile money", "We will send you our mobile money number after your order."],
  ["Crypto (USDT / BTC)", "We will send you our wallet address after your order."],
];

export default async function AdminPayments() {
  const list = await db.select().from(paymentMethods).orderBy(paymentMethods.id);
  const have = new Set(list.map((m) => m.name));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Payment methods</h1>
      <p className="mt-1 text-sm text-stone-600">
        These are the payment options customers can pick at checkout. Turn one off to hide it without deleting it. At least one must be on, or checkout is unavailable.
      </p>

      <div className="mt-4 space-y-2">
        {list.map((m) => (
          <details key={m.id} className="card">
            <summary className="flex cursor-pointer items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.image && <img src={m.image} alt="" className="h-10 w-14 rounded object-contain" />}
              <span className="min-w-0 flex-1"><span className="block font-medium">{m.name}</span><span className="block truncate text-sm text-stone-600">{m.instructions}</span></span>
              <InstantSwitch id={m.id} enabled={m.enabled} label={m.name} save={togglePayment} />
            </summary>
            <form action={updatePayment} className="mt-4 space-y-3 border-t border-stone-200 pt-4">
              <input type="hidden" name="id" value={m.id} />
              <div><label className="label">Name<input name="name" required defaultValue={m.name} className="input mt-1 font-normal" /></label></div>
              <div><label className="label">Instructions shown to the customer<textarea name="instructions" rows={3} defaultValue={m.instructions} className="input mt-1 font-normal" /></label></div>
              <div><label className="label">Replace image / logo<input name="image" type="file" accept="image/*" className="input mt-1 font-normal" /></label></div>
              <button type="submit" className="btn">Save changes</button>
            </form>
            <form action={deletePayment} className="mt-2"><input type="hidden" name="id" value={m.id} /><button type="submit" className="min-h-11 text-sm text-red-600 underline">Delete this method</button></form>
          </details>
        ))}
        {!list.length && <p className="text-stone-600">No payment methods yet. Add one below.</p>}
      </div>

      <section className="card mt-6">
        <h2 className="font-semibold">Quick add</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.filter(([n]) => !have.has(n)).map(([name, instructions]) => (
            <form key={name} action={addPayment}>
              <input type="hidden" name="name" value={name} /><input type="hidden" name="instructions" value={instructions} /><input type="hidden" name="enabled" value="on" />
              <button type="submit" className="btn-outline">+ {name}</button>
            </form>
          ))}
        </div>
      </section>

      <form action={addPayment} className="card mt-4 space-y-3">
        <h2 className="font-semibold">Add your own</h2>
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required className="input" /></div>
        <div><label className="label" htmlFor="instructions">Instructions shown to the customer</label><textarea id="instructions" name="instructions" rows={3} className="input" /></div>
        <div><label className="label" htmlFor="image">Image / logo</label><input id="image" name="image" type="file" accept="image/*" className="input" /></div>
        <FormSwitch name="enabled" label="Enabled" defaultChecked />
        <button type="submit" className="btn">Add method</button>
      </form>
    </div>
  );
}
