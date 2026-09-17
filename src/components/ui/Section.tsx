import type { ReactNode } from "react";

type Tone = "offwhite" | "white" | "navy";

interface Props {
  children: ReactNode;
  tone?: Tone;
  id?: string;
  eyebrow?: string;
  heading?: string;
  /** Heading level for `heading`; H1 is reserved for hero sections. */
  headingLevel?: "h1" | "h2";
  /** Center the eyebrow and heading. */
  center?: boolean;
  className?: string;
}

const toneClass: Record<Tone, string> = {
  offwhite: "bg-offwhite",
  white: "bg-white",
  navy: "bg-navy text-offwhite",
};

/** Page section with vertical rhythm and a data-tone hook for button styling. */
export function Section({
  children,
  tone = "offwhite",
  id,
  eyebrow,
  heading,
  headingLevel = "h2",
  center,
  className = "",
}: Props) {
  const Heading = headingLevel;
  return (
    <section id={id} data-tone={tone} className={`${toneClass[tone]} py-16 md:py-28 ${className}`.trim()}>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {(eyebrow || heading) && (
          <div className={`mb-10 ${center ? "text-center" : ""}`}>
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {heading && <Heading className={headingLevel === "h1" ? "h1" : "h2"}>{heading}</Heading>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
