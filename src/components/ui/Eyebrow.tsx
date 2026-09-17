export function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  return <p className={`eyebrow ${className}`.trim()}>{children}</p>;
}
