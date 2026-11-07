"use client";
import { useState } from "react";

// Instant-save switch: optimistic update, rolled back if the save fails. `save` is a server action.
export default function InstantSwitch({ id, enabled, label, save }: { id: number; enabled: boolean; label: string; save: (id: number, enabled: boolean) => Promise<void> }) {
  const [on, setOn] = useState(enabled);
  async function flip() {
    const next = !on;
    setOn(next);
    try { await save(id, next); } catch { setOn(!next); }
  }
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={`${label} enabled`} onClick={flip}
      className={`relative h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${on ? "bg-brand" : "bg-stone-300"}`}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}
