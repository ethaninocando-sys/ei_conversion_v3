"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

interface Item {
  slug: string;
  name: string;
  teaser: string;
}

/**
 * A rule-separated index, not a grid of cards. Each row is a line in a
 * table of contents: folio, name, standfirst, arrow.
 */
export function NichePicker({ items }: { items: Item[] }) {
  return (
    <ul id="niches" className="border-t border-rule">
      {items.map((n, i) => (
        <li key={n.slug} className="border-b border-rule">
          <Link
            href={`/guide/${n.slug}`}
            onClick={() => track("niche_select", { niche: n.slug })}
            className="group grid grid-cols-12 items-baseline gap-x-5 py-7 md:py-9"
          >
            <span className="numeral col-span-2 text-2xl md:col-span-1 md:text-3xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="display display-lg col-span-10 md:col-span-4 group-hover:text-accent">{n.name}</span>
            <span className="col-span-10 col-start-3 mt-2 text-ink-soft md:col-span-6 md:col-start-6 md:mt-0">
              {n.teaser}
            </span>
            <span
              aria-hidden="true"
              className="col-span-1 hidden text-right text-xl transition-transform group-hover:translate-x-1 md:block"
            >
              &rarr;
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
