import { eq } from "drizzle-orm";
import { db, paymentMethods } from "@/db";
import { getSettings } from "@/lib/settings";
import { enabledChannels } from "@/lib/channels";
import CheckoutForm from "./CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function Checkout() {
  const [s, methods] = await Promise.all([getSettings(), db.select().from(paymentMethods).where(eq(paymentMethods.enabled, true)).orderBy(paymentMethods.id)]);
  const channels = await enabledChannels(s);

  if (!methods.length || !channels.length) {
    return <div className="mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl font-semibold">Checkout</h1><p className="mt-4">Checkout isn&apos;t available right now. Please check back soon.</p></div>;
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <CheckoutForm methods={methods.map((m) => ({ id: m.id, name: m.name, image: m.image, instructions: m.instructions }))} channels={channels.map(({ id, label, button }) => ({ id, label, button }))} />
    </div>
  );
}
