"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

interface Item {
  slug: string;
  name: string;
  teaser: string;
}

/** One card per niche. Client component only for the niche_select event. */
export function NichePicker({ items }: { items: Item[] }) {
  return (
    <ul id="niches" className="grid gap-4 md:grid-cols-3">
      {items.map((n) => (
        <li key={n.slug}>
          <Link
            href={`/guide/${n.slug}`}
            onClick={() => track("niche_select", { niche: n.slug })}
            className="block h-full rounded-lg border border-line bg-white p-6 transition-colors hover:border-navy"
          >
            <p className="eyebrow mb-2">Guide</p>
            <span className="h3 block text-navy">{n.name}</span>
            <p className="mt-3 text-slate">{n.teaser}</p>
            <span className="mt-4 inline-block font-semibold text-navy">See the ranking &rarr;</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
