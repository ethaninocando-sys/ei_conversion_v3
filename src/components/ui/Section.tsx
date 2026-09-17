import type { ReactNode } from "react";
import { Marker } from "@/components/ui/Marker";

type Ground = "paper" | "dim" | "ink";

interface Props {
  children: ReactNode;
  ground?: Ground;
  id?: string;
  /** Opens the section with a hairline above it. Default true on paper. */
  rule?: boolean;
  className?: string;
}

const groundClass: Record<Ground, string> = {
  paper: "bg-paper text-ink",
  dim: "bg-paper-dim text-ink",
  ink: "bg-ink text-paper",
};

/** Full-bleed ground; the container inside holds the grid. */
export function Section({ children, ground = "paper", id, rule = false, className = "" }: Props) {
  return (
    <section id={id} data-ground={ground} className={`${groundClass[ground]} ${className}`.trim()}>
      <Container>
        {rule && <hr className="rule" />}
        {children}
      </Container>
    </section>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[78rem] px-5 md:px-10 ${className}`.trim()}>{children}</div>;
}

/**
 * A section opener: the tracked marker sits in its own left column, the
 * heading runs in the wide column beside it. This is the page's main rhythm.
 */
export function SectionHead({
  index,
  marker,
  title,
  lede,
}: {
  index?: number;
  marker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="grid gap-x-5 gap-y-5 md:grid-cols-12">
      <div className="md:col-span-3">
        <Marker index={index}>{marker}</Marker>
      </div>
      <div className="md:col-span-9">
        <h2 className="display display-lg">{title}</h2>
        {lede && <p className="lede measure mt-5">{lede}</p>}
      </div>
    </div>
  );
}
