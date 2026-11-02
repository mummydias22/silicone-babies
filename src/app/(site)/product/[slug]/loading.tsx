export default function Loading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2" aria-busy="true" aria-label="Loading product">
      <div className="skeleton aspect-square" />
      <div className="space-y-4"><div className="skeleton h-10 w-3/4" /><div className="skeleton h-8 w-1/4" /><div className="skeleton h-24" /><div className="skeleton h-12 w-48 !rounded-full" /></div>
    </div>
  );
}
