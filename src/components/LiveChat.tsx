"use client";
import { useEffect } from "react";

// Injects the admin's provider snippet; createContextualFragment makes <script> tags execute.
export default function LiveChat({ html }: { html: string }) {
  useEffect(() => {
    const frag = document.createRange().createContextualFragment(html);
    const holder = document.createElement("div");
    holder.appendChild(frag);
    document.body.appendChild(holder);
    return () => holder.remove();
  }, [html]);
  return null;
}
