import Link from "next/link";
import { site } from "@/config/site";
import { nicheList } from "@/content/niches";
import { serviceList } from "@/content/services";

const PAGES = [
  { label: "Home", href: "/" },
  { label: "Guide", href: "/guide" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

/** The one heavy block on every page: a colophon, not a link farm. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-ground="ink" className="mt-auto bg-ink text-paper">
      <div className="mx-auto w-full max-w-[78rem] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="display display-md">
              <span className="text-accent-light">{site.wordmark}</span>{" "}
              <span>{site.name.replace(site.wordmark, "").trim()}</span>
            </p>
            <p className="lede mt-4 max-w-sm !text-paper/70">{site.tagline}</p>
            <p className="marker mt-8">{site.city}</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 md:col-span-7">
            <Column title="Pages" links={PAGES} />
            <Column title="Services" links={serviceList.map((s) => ({ label: s.name, href: `/services/${s.slug}` }))} />
            <Column title="Industries" links={nicheList.map((n) => ({ label: n.name, href: `/guide/${n.slug}` }))} />
          </div>
        </div>
        <hr className="rule mt-16" />
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <a href={`mailto:${site.contactEmail}`} className="link text-paper/80">
            {site.contactEmail}
          </a>
          <p className="marker">
            &copy; {year} {site.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="marker">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-paper/85 hover:text-accent-light">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
