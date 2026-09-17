import Link from "next/link";
import type { ReactNode } from "react";

export interface IndexItem {
  key: string;
  title: string;
  body: string;
  aside?: ReactNode;
  href?: string;
}

/**
 * The workhorse layout: a numbered, rule-separated index. Replaces every
 * grid of cards on the site.
 */
export function IndexList({ items, start = 1 }: { items: IndexItem[]; start?: number }) {
  return (
    <ul className="border-t border-rule">
      {items.map((item, i) => {
        const inner = (
          <div className="grid grid-cols-12 items-baseline gap-x-5 gap-y-3 py-7 md:py-9">
            <span className="numeral col-span-2 text-xl md:col-span-1 md:text-2xl">
              {String(i + start).padStart(2, "0")}
            </span>
            <h3 className="display display-md col-span-10 md:col-span-3">{item.title}</h3>
            <p className="col-span-12 text-ink-soft md:col-span-5">{item.body}</p>
            {item.aside && <div className="col-span-12 md:col-span-3 md:text-right">{item.aside}</div>}
          </div>
        );
        return (
          <li key={item.key} className="border-b border-rule">
            {item.href ? (
              <Link href={item.href} className="group block [&_h3]:group-hover:text-accent">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}
