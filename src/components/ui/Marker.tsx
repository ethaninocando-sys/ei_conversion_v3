import type { ReactNode } from "react";

/**
 * The small tracked label that opens a section: "01 / THE GUIDE".
 * The number is the page's running count, set like a print folio.
 */
export function Marker({ index, children }: { index?: number; children: ReactNode }) {
  return (
    <p className="marker">
      {index !== undefined && (
        <>
          <span className="text-accent">{String(index).padStart(2, "0")}</span>
          <span className="px-2 text-rule" aria-hidden="true">
            /
          </span>
        </>
      )}
      {children}
    </p>
  );
}
