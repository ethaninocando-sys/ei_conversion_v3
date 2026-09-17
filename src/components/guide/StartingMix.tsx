import type { StartingMix as StartingMixContent } from "@/content/types";

/** Numbered steps with the rationale pushed into a narrow outer column. */
export function StartingMix({ mix }: { mix: StartingMixContent }) {
  return (
    <div className="grid gap-x-5 gap-y-12 md:grid-cols-12">
      <ol className="md:col-span-7">
        {mix.steps.map((step, i) => (
          <li key={step} className="grid grid-cols-12 gap-x-5 border-t border-rule py-6">
            <span className="numeral col-span-2 text-xl md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
            <span className="col-span-10 md:col-span-11">{step}</span>
          </li>
        ))}
      </ol>
      <aside className="md:col-span-4 md:col-start-9">
        <p className="marker">Why this order</p>
        <p className="mt-4 text-ink-soft">{mix.rationale}</p>
      </aside>
    </div>
  );
}
