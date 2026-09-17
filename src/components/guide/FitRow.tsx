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

/**
 * One ranked channel, set as a spread: folio and name on the left, the
 * verdict tracked out on the right, the argument beneath.
 */
export function FitRow({ fit }: { fit: ServiceFit }) {
  const service = services[fit.service];
  return (
    <article className="border-t border-ink py-10 md:py-14">
      <div className="grid grid-cols-12 items-baseline gap-x-5 gap-y-2">
        <span className="numeral col-span-2 text-3xl md:col-span-1 md:text-5xl">{fit.rank}</span>
        <h3 className="display display-lg col-span-10 md:col-span-7">{service.name}</h3>
        {/* Full width under the name on mobile: the tracked label never fits three columns. */}
        <p className="marker col-span-10 col-start-3 md:col-span-4 md:col-start-9 md:text-right">
          {FIT_LABEL[fit.fit]}
          {fit.fitNote ? ` · ${fit.fitNote}` : ""}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-12 gap-x-5">
        <div className="col-span-12 md:col-span-11 md:col-start-2">
          <p className="lede measure">{fit.summary}</p>
          <div className="mt-10">
            <ProsCons pros={fit.pros} cons={fit.cons} />
          </div>
          <p className="mt-10">
            <Link href={`/services/${service.slug}`} className="action action-quiet">
              What {service.name} includes
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
