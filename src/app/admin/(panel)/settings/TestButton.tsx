"use client";
import { useState } from "react";

export default function TestButton({ label, action }: { label: string; action: () => Promise<string> }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <button type="button" className="btn-outline" disabled={busy} onClick={async () => { setBusy(true); setMsg(await action()); setBusy(false); }}>{label}</button>
      <span role="status" className="text-sm text-stone-600">{msg}</span>
    </div>
  );
}
