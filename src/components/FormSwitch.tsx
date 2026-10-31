// Label + toggle switch; submits "on" when enabled. No JS needed.
export default function FormSwitch({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span className="text-sm"><span className="font-medium">{label}</span>{hint && <span className="block text-xs text-stone-500">{hint}</span>}</span>
      <input type="checkbox" role="switch" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span aria-hidden className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}
