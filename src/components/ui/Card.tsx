import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: string;
  eyebrow?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
}

/** Bordered white card, no shadow. Becomes a link block when href is given. */
export function Card({ title, eyebrow, href, children, className = "" }: Props) {
  const body = (
    <>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h3 className="h3 text-navy">{title}</h3>
      {children && <div className="mt-3 text-slate">{children}</div>}
    </>
  );
  const base = `block rounded-lg border border-line bg-white p-6 ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={`${base} transition-colors hover:border-navy`}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}
