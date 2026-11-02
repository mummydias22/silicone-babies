// Ghost of the product image flies to the cart icon (Web Animations API: transform + opacity only).
export function flyToCart(from: Element | null) {
  const pop = () => dispatchEvent(new Event("cart-pop"));
  const target = document.querySelector("[data-cart-icon]");
  if (!from || !target || matchMedia("(prefers-reduced-motion: reduce)").matches) return pop();
  const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
  if (!a.width) return pop();
  const ghost = document.createElement("div");
  const img = from instanceof HTMLImageElement ? from.currentSrc || from.src : "";
  Object.assign(ghost.style, {
    position: "fixed", left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    borderRadius: "16px", zIndex: "100", pointerEvents: "none", background: img ? `center / cover url("${img}")` : "var(--brand)",
  });
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = ghost.animate(
    [{ transform: "translate(0,0) scale(1)", opacity: 0.95 }, { transform: `translate(${dx}px,${dy}px) scale(0.08)`, opacity: 0.4 }],
    { duration: 700, easing: "cubic-bezier(0.5, 0, 0.2, 1)" },
  );
  const done = () => { ghost.remove(); pop(); };
  anim.onfinish = done;
  anim.oncancel = done;
}
