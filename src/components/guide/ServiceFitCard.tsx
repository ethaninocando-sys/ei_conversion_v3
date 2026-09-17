import Link from "next/link";
import type { ServiceFit } from "@/content/types";
import { services } from "@/content/services";
import { ProsCons } from "@/components/ui/ProsCons";

const FIT_LABEL: Record<ServiceFit["fit"], string> = {
  strong: "Strong fit",
  good: "Good fit",
  situational: "Situational",
  later: "Later",
};

export function ServiceFitCard({ fit }: { fit: ServiceFit }) {
  const service = services[fit.service];
  return (
    <article className="rounded-lg border border-line bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-label={`Rank ${fit.rank}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-navy font-heading font-bold text-offwhite"
        >
          {fit.rank}
        </span>
        <h3 className="h3 text-navy">{service.name}</h3>
        <span className="rounded-sm border border-line px-2 py-0.5 text-sm text-muted">
          {FIT_LABEL[fit.fit]}
          {fit.fitNote ? ` · ${fit.fitNote}` : ""}
        </span>
      </div>
      <p className="mt-4 text-lg">{fit.summary}</p>
      <div className="mt-6">
        <ProsCons pros={fit.pros} cons={fit.cons} />
      </div>
      <p className="mt-6">
        <Link href={`/services/${service.slug}`} className="font-semibold text-navy underline underline-offset-4">
          What {service.name} includes &rarr;
        </Link>
      </p>
    </article>
  );
}
