// Fast fade-and-rise between pages. Fixed-position UI is portaled to <body>, so this transform can't trap it.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
