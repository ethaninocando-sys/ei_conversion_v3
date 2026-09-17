interface Props {
  pros: string[];
  cons: string[];
}

/** Two columns on desktop, stacked on mobile. Plain markers, no red X icons. */
export function ProsCons({ pros, cons }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="eyebrow mb-3">Upside</p>
        <ul className="space-y-2">
          {pros.map((p) => (
            <li key={p} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 text-success">
                &#10003;
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-3">Downside</p>
        <ul className="space-y-2">
          {cons.map((c) => (
            <li key={c} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 text-muted">
                &ndash;
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
