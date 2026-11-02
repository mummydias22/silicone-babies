export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12" aria-busy="true" aria-label="Loading shop">
      <div className="skeleton h-10 w-40" />
      <div className="mt-6 flex gap-2">{[0, 1, 2, 3].map((k) => <div key={k} className="skeleton h-11 w-24 !rounded-full" />)}</div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, k) => <div key={k}><div className="skeleton aspect-square" /><div className="skeleton mt-3 h-4 w-3/4" /></div>)}
      </div>
    </div>
  );
}
