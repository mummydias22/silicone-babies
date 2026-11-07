"use client";
import { useState } from "react";

// Some apps (Telegram, Messenger, Instagram) can't prefill a message, so the customer can copy the order text.
export default function CopyText({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn-outline" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setDone(true); } catch { setDone(false); }
    }}>{done ? "Copied ✓" : "Copy order details"}</button>
  );
}
