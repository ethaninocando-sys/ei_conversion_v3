import Link from "next/link";
import { site } from "@/config/site";
import { Wordmark } from "@/components/ui/Wordmark";
import { nicheList } from "@/content/niches";
import { serviceList } from "@/content/services";

const PAGES = [
  { label: "Home", href: "/" },
  { label: "Guide", href: "/guide" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-tone="navy" className="bg-navy text-offwhite">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Wordmark tone="light" />
            <p className="text-sm text-offwhite/80">{site.tagline}</p>
            <p className="text-sm text-offwhite/80">{site.city}</p>
          </div>
          <FooterColumn title="Pages" links={PAGES} />
          <FooterColumn
            title="Services"
            links={serviceList.map((s) => ({ label: s.name, href: `/services/${s.slug}` }))}
          />
          <FooterColumn
            title="Industries"
            links={nicheList.map((n) => ({ label: n.name, href: `/guide/${n.slug}` }))}
          />
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-offwhite/15 pt-6 text-sm text-offwhite/80 md:flex-row md:justify-between">
          <a href={`mailto:${site.contactEmail}`} className="hover:underline">
            {site.contactEmail}
          </a>
          <p>
            &copy; {year} {site.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-offwhite/90 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
