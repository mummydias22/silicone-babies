"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import {
  db, products, variants, categories, paymentMethods, orderChannels, orders, faqs, testimonials, posts, account, user,
} from "@/db";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { DEFAULTS, saveSettings, getSettings, type Settings } from "@/lib/settings";
import { isCurrency } from "@/lib/currencies";
import { uploadImage } from "@/lib/storage";
import { sendMailStrict } from "@/lib/notify";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const on = (f: FormData, k: string) => f.get(k) === "on";
const cents = (v: string) => Math.round((parseFloat(v) || 0) * 100);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
const uploads = async (f: FormData, k: string) => {
  const files = f.getAll(k).filter((x): x is File => x instanceof File && x.size > 0);
  return Promise.all(files.map(uploadImage));
};

// ---- auth ----
export async function login(f: FormData) {
  try {
    await auth.api.signInEmail({ body: { email: str(f, "email"), password: String(f.get("password") ?? "") } });
  } catch {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logout() {
  const { headers } = await import("next/headers");
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

// ---- products ----
// Variants textarea: one per line "Option | Value | price change ($) | stock"
function parseVariants(text: string, productId: number) {
  return text.split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((p) => p[0] && p[1])
    .map((p) => ({ productId, option: p[0], value: p[1], priceDelta: cents(p[2] ?? "0"), stock: parseInt(p[3] ?? "0") || 0 }));
}

export async function saveProduct(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")) || 0;
  const name = str(f, "name");
  const remove = new Set(f.getAll("remove").map(String));
  const prev = id ? (await db.select().from(products).where(eq(products.id, id)))[0] : null;
  const images = [...(prev?.images ?? []).filter((u) => !remove.has(u)), ...(await uploads(f, "images"))];
  const values = {
    name, description: str(f, "description"), price: cents(str(f, "price")),
    comparePrice: cents(str(f, "comparePrice")) || null, stock: parseInt(str(f, "stock")) || 0,
    categoryId: Number(f.get("categoryId")) || null, images, published: on(f, "published"),
  };
  let pid = id;
  if (id) await db.update(products).set(values).where(eq(products.id, id));
  else {
    const [p] = await db.insert(products).values({ ...values, slug: `${slugify(name)}-${Date.now().toString(36)}` }).returning();
    pid = p.id;
  }
  await db.delete(variants).where(eq(variants.productId, pid));
  const vs = parseVariants(String(f.get("variants") ?? ""), pid);
  if (vs.length) await db.insert(variants).values(vs);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(f: FormData) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}

// ---- categories ----
export async function addCategory(f: FormData) {
  await requireAdmin();
  const name = str(f, "name");
  const parentId = Number(f.get("parentId")) || null;
  if (!name) return;
  let slug = slugify(name);
  if (parentId) {
    const [parent] = await db.select().from(categories).where(eq(categories.id, parentId));
    // only one level deep: a subcategory can't be a parent
    if (!parent || parent.parentId) return;
    slug = `${parent.slug}-${slug}`; // "Boy" under two parents must not collide
  }
  await db.insert(categories).values({ name, slug, parentId }).onConflictDoNothing();
  revalidatePath("/", "layout");
}
export async function deleteCategory(f: FormData) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}

// ---- payment methods ----
export async function addPayment(f: FormData) {
  await requireAdmin();
  const [image] = await uploads(f, "image");
  await db.insert(paymentMethods).values({ name: str(f, "name"), instructions: str(f, "instructions"), image: image ?? null, enabled: on(f, "enabled") });
  revalidatePath("/", "layout");
}
export async function togglePayment(id: number, enabled: boolean) {
  await requireAdmin();
  await db.update(paymentMethods).set({ enabled }).where(eq(paymentMethods.id, id));
  revalidatePath("/", "layout");
}
export async function updatePayment(f: FormData) {
  await requireAdmin();
  const [image] = await uploads(f, "image");
  await db.update(paymentMethods)
    .set({ name: str(f, "name"), instructions: str(f, "instructions"), ...(image ? { image } : {}) })
    .where(eq(paymentMethods.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}
export async function deletePayment(f: FormData) {
  await requireAdmin();
  await db.delete(paymentMethods).where(eq(paymentMethods.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}

// ---- orders ----
export async function setOrderStatus(f: FormData) {
  await requireAdmin();
  await db.update(orders).set({ status: str(f, "status") }).where(eq(orders.id, Number(f.get("id"))));
  revalidatePath("/admin", "layout");
}

// ---- faqs / testimonials ----
export async function saveFaq(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")) || 0;
  const v = { question: str(f, "question"), answer: str(f, "answer") };
  if (id) await db.update(faqs).set(v).where(eq(faqs.id, id)); else await db.insert(faqs).values(v);
  revalidatePath("/", "layout");
}
export async function deleteFaq(f: FormData) {
  await requireAdmin();
  await db.delete(faqs).where(eq(faqs.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}
export async function saveTestimonial(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")) || 0;
  const [photo] = await uploads(f, "photo");
  const v = { name: str(f, "name"), quote: str(f, "quote"), ...(photo ? { photo } : {}) };
  if (id) await db.update(testimonials).set(v).where(eq(testimonials.id, id)); else await db.insert(testimonials).values(v);
  revalidatePath("/", "layout");
}
export async function deleteTestimonial(f: FormData) {
  await requireAdmin();
  await db.delete(testimonials).where(eq(testimonials.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}

// ---- blog ----
export async function savePost(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")) || 0;
  const [cover] = await uploads(f, "cover");
  const layout = ["classic", "grid", "magazine"].includes(str(f, "layout")) ? str(f, "layout") : "classic";
  const v = { title: str(f, "title"), excerpt: str(f, "excerpt"), body: str(f, "body"), layout, published: on(f, "published"), ...(cover ? { cover } : {}) };
  if (id) await db.update(posts).set(v).where(eq(posts.id, id));
  else await db.insert(posts).values({ ...v, slug: `${slugify(v.title)}-${Date.now().toString(36)}` });
  revalidatePath("/", "layout");
  redirect("/admin/blog");
}
export async function deletePost(f: FormData) {
  await requireAdmin();
  await db.delete(posts).where(eq(posts.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}

// ---- settings ----
const BOOLS = Object.entries(DEFAULTS).filter(([, v]) => typeof v === "boolean").map(([k]) => k);
export async function saveSettingsAction(_: { saved: number }, f: FormData) {
  await requireAdmin();
  const next: Record<string, unknown> = {};
  for (const k of Object.keys(DEFAULTS)) {
    if (BOOLS.includes(k)) next[k] = on(f, k);
    else if (f.has(k)) next[k] = String(f.get(k)).trim();
  }
  // Keep the stored SMTP password when the field is left blank.
  if (!next.smtpPass) delete next.smtpPass;
  if (!isCurrency(String(next.currency))) delete next.currency; // ignore anything not in the list
  await saveSettings(next as Partial<Settings>);
  revalidatePath("/", "layout");
  return { saved: Date.now() };
}

export async function testDiscord() {
  await requireAdmin();
  const s = await getSettings();
  if (!s.discordWebhook) return "Save a webhook URL first.";
  const r = await fetch(s.discordWebhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: "Test message from your store" }) }).catch(() => null);
  return r?.ok ? "Sent. Check Discord." : "Discord rejected the webhook.";
}
export async function testEmail() {
  await requireAdmin();
  const s = await getSettings();
  const to = s.notifyEmails.split(/[,\s]+/).filter(Boolean)[0];
  if (!s.smtpHost || !to) return "Save SMTP details and a notification recipient first.";
  try { await sendMailStrict(s, to, "Test email", "SMTP works."); return `Sent to ${to}.`; } catch (e) { return `Failed: ${(e as Error).message}`; }
}

// ---- account ----
async function credential() {
  const { user: u } = await requireAdmin();
  const [acc] = await db.select().from(account).where(and(eq(account.userId, u.id), eq(account.providerId, "credential")));
  return { u, acc };
}
export async function changeEmail(_: string, f: FormData) {
  const { u, acc } = await credential();
  if (!acc?.password || !(await verifyPassword({ hash: acc.password, password: String(f.get("current") ?? "") }))) return "Current password is wrong.";
  const email = str(f, "email");
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email.";
  await db.update(user).set({ email }).where(eq(user.id, u.id));
  return "Email updated.";
}
// Not revoking other sessions: that logs the admin out (better-auth gotcha).
export async function changePassword(_: string, f: FormData) {
  const { acc } = await credential();
  if (!acc?.password || !(await verifyPassword({ hash: acc.password, password: String(f.get("current") ?? "") }))) return "Current password is wrong.";
  const next = String(f.get("next") ?? "");
  if (next.length < 8) return "New password must be at least 8 characters.";
  await db.update(account).set({ password: await hashPassword(next) }).where(eq(account.id, acc.id));
  return "Password updated.";
}

// ---- order channels (extra ways to send an order) ----
export async function addChannel(f: FormData) {
  await requireAdmin();
  const name = str(f, "name"), link = str(f, "link");
  // only web links and app deep links; never javascript: or data: URLs
  if (!name || !/^(https?:\/\/|[a-z][a-z0-9+.-]*:\/\/)/i.test(link) || /^(javascript|data|vbscript):/i.test(link)) return;
  await db.insert(orderChannels).values({ name, link, enabled: on(f, "enabled") });
  revalidatePath("/", "layout");
}
export async function updateChannel(f: FormData) {
  await requireAdmin();
  const name = str(f, "name"), link = str(f, "link");
  if (!name || !/^(https?:\/\/|[a-z][a-z0-9+.-]*:\/\/)/i.test(link) || /^(javascript|data|vbscript):/i.test(link)) return;
  await db.update(orderChannels).set({ name, link }).where(eq(orderChannels.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}
export async function toggleChannel(id: number, enabled: boolean) {
  await requireAdmin();
  await db.update(orderChannels).set({ enabled }).where(eq(orderChannels.id, id));
  revalidatePath("/", "layout");
}
export async function deleteChannel(f: FormData) {
  await requireAdmin();
  await db.delete(orderChannels).where(eq(orderChannels.id, Number(f.get("id"))));
  revalidatePath("/", "layout");
}
