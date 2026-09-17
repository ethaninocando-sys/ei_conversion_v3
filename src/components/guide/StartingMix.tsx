import type { StartingMix as StartingMixContent } from "@/content/types";

export function StartingMix({ mix }: { mix: StartingMixContent }) {
  return (
    <div className="grid gap-8 md:grid-cols-5">
      <ol className="space-y-4 md:col-span-3">
        {mix.steps.map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber font-heading font-bold text-navy">
              {i + 1}
            </span>
            <span className="pt-1">{step}</span>
          </li>
        ))}
      </ol>
      <div className="md:col-span-2">
        <p className="eyebrow mb-3">Why this order</p>
        <p>{mix.rationale}</p>
      </div>
    </div>
  );
}
