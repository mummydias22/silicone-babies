import { db, user, account, categories, products, variants, paymentMethods, faqs, testimonials, posts } from "../src/db";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { ensureBucket } from "../src/lib/storage";
import { saveSettings } from "../src/lib/settings";
import { randomUUID } from "crypto";

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=75`;
const PHOTOS = [
  "1519689680058-324335c77eba", "1515488042361-ee00e0ddd4e4", "1522771930-78848d9293e8",
  "1544126592-807ade215a0b", "1471286174890-9c112ffca5b4", "1503454537195-1dcabb73ffb9",
  "1555252333-9f8e92e65df9", "1566004100631-35d015d6a491",
].map(img);

async function main() {
  await ensureBucket();

  // admin (sign-up is disabled, so insert directly)
  const email = process.env.ADMIN_EMAIL!;
  const [existing] = await db.select().from(user).where(eq(user.email, email));
  if (!existing) {
    const id = randomUUID();
    await db.insert(user).values({ id, name: "Admin", email, emailVerified: true });
    await db.insert(account).values({
      id: randomUUID(), accountId: id, providerId: "credential", userId: id,
      password: await hashPassword(process.env.ADMIN_PASSWORD!),
    });
  }

  // demo data only on an empty store
  if ((await db.select().from(categories)).length) return console.log("seed: demo data present, skipped");

  const cats = await db.insert(categories).values([
    { name: "Newborn", slug: "newborn" }, { name: "Toddler", slug: "toddler" }, { name: "Accessories", slug: "accessories" },
  ]).returning();
  const [newborn, toddler, acc] = cats;

  const items = [
    ["Lily, Sleeping Newborn", newborn, 28900, "A peaceful sleeping newborn with hand-rooted lashes, weighted body and soft-touch silicone skin."],
    ["Noah, Awake Newborn", newborn, 31900, "Wide-eyed newborn with lifelike wrinkles and a gentle expression. Comes with a swaddle blanket."],
    ["Emma, Sweet Toddler", toddler, 36900, "A full-bodied silicone toddler with soft curls and poseable limbs."],
    ["Leo, Toddler Boy", toddler, 38900, "Playful toddler with hand-painted details and a cozy outfit."],
    ["Mia, Mini Preemie", newborn, 22900, "A tiny preemie that fits in your hands. Perfect for collectors."],
    ["Starter Care Kit", acc, 4900, "Bottle, pacifier, wipes and a soft brush to care for your baby."],
  ] as const;
  for (const [i, [name, cat, price, description]] of items.entries()) {
    const [p] = await db.insert(products).values({
      name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description, price, stock: 5, categoryId: cat.id, images: [PHOTOS[i % PHOTOS.length], PHOTOS[(i + 3) % PHOTOS.length]],
    }).returning();
    if (cat !== acc) await db.insert(variants).values([
      { productId: p.id, option: "Skin tone", value: "Light", priceDelta: 0, stock: 5 },
      { productId: p.id, option: "Skin tone", value: "Medium", priceDelta: 0, stock: 5 },
      { productId: p.id, option: "Skin tone", value: "Deep", priceDelta: 2000, stock: 5 },
      { productId: p.id, option: "Gender", value: "Girl", priceDelta: 0, stock: 5 },
      { productId: p.id, option: "Gender", value: "Boy", priceDelta: 0, stock: 5 },
    ]);
  }

  await db.insert(paymentMethods).values([
    { name: "Bank transfer", instructions: "We'll send our bank details once we receive your order.", enabled: true },
    { name: "Cash on delivery", instructions: "Pay in cash when your baby arrives.", enabled: true },
  ]);
  await db.insert(faqs).values([
    { question: "Are your babies safe for children?", answer: "Our babies are collector and comfort dolls made of platinum silicone. They are not toys for children under 14." },
    { question: "How do I order?", answer: "Add a baby to your cart, check out, and send your order to us by email, WhatsApp or text. We reply with payment details." },
    { question: "How long does shipping take?", answer: "Most orders ship within 5 to 10 business days after payment." },
  ]);
  await db.insert(testimonials).values([
    { name: "Grace A.", quote: "She looks so real. The details are unbelievable and she arrived beautifully packed." },
    { name: "Daniel K.", quote: "Ordering by WhatsApp was easy and the team answered every question." },
  ]);
  await db.insert(posts).values({
    title: "How to care for your silicone baby", slug: "how-to-care-for-your-silicone-baby", layout: "classic", cover: PHOTOS[0],
    excerpt: "Simple tips to keep your baby looking soft and new.",
    body: "Wipe your baby with a damp soft cloth and mild soap.\n\nUse baby powder sparingly to keep the skin silky.\n\nStore away from direct sunlight and sharp objects.",
  });
  await saveSettings({ storeName: "Silicone Babies", tagline: "Lifelike silicone babies, made with love" });
  console.log("seed: done");
}
main().catch((e) => { console.error(e); process.exit(1); });
