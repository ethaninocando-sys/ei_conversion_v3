/**
 * Two columns split by a vertical hairline. No icons, no red crosses:
 * the column heads carry the meaning, the way a printed table would.
 */
export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
      <Column head="Where it wins" items={pros} />
      <Column head="What it costs you" items={cons} divider />
    </div>
  );
}

function Column({ head, items, divider }: { head: string; items: string[]; divider?: boolean }) {
  return (
    <div className={divider ? "md:border-l md:border-rule md:pl-10" : ""}>
      <p className="marker mb-4">{head}</p>
      <ul className="space-y-3 text-ink-soft">
        {items.map((item) => (
          <li key={item} className="border-t border-rule pt-3 first:border-t-0 first:pt-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
