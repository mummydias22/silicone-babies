"use server";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { discord, sendMail } from "@/lib/notify";

export async function sendContact(f: FormData) {
  const s = await getSettings();
  const text = `Contact form\nFrom: ${f.get("name")} <${f.get("email")}>\n\n${f.get("message")}`;
  await discord(s, text);
  for (const to of s.notifyEmails.split(/[,\s]+/).filter(Boolean)) await sendMail(s, to, "New contact message", text);
  redirect("/contact?sent=1");
}
