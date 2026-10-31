import nodemailer from "nodemailer";
import type { Settings } from "./settings";

// Notification failures never fail the order: every call is swallowed here.
export async function discord(s: Settings, text: string) {
  if (!s.discordWebhook) return;
  try { await fetch(s.discordWebhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: text.slice(0, 1900) }) }); } catch {}
}

export async function sendMail(s: Settings, to: string, subject: string, text: string) {
  if (!s.smtpHost || !to) return;
  try {
    const t = nodemailer.createTransport({
      host: s.smtpHost, port: Number(s.smtpPort) || 587, secure: Number(s.smtpPort) === 465,
      auth: s.smtpUser ? { user: s.smtpUser, pass: s.smtpPass } : undefined,
    });
    await t.sendMail({ from: s.smtpFrom || s.smtpUser, to, subject, text });
  } catch {}
}

export async function sendMailStrict(s: Settings, to: string, subject: string, text: string) {
  const t = nodemailer.createTransport({
    host: s.smtpHost, port: Number(s.smtpPort) || 587, secure: Number(s.smtpPort) === 465,
    auth: s.smtpUser ? { user: s.smtpUser, pass: s.smtpPass } : undefined,
  });
  await t.sendMail({ from: s.smtpFrom || s.smtpUser, to, subject, text });
}

export const whatsappUrl = (num: string, text: string) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
export const smsUrl = (num: string, text: string) => `sms:+${num}?&body=${encodeURIComponent(text)}`;
