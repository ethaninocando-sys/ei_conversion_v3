export type AppPhase = 1 | 2 | 3;

function parsePhase(value: string | undefined): AppPhase {
  const n = Number(value ?? "1");
  return n === 2 || n === 3 ? n : 1;
}

/** Server-side phase (APP_PHASE). Gates server copy such as email wording. */
export function appPhase(): AppPhase {
  return parsePhase(process.env.APP_PHASE);
}

/**
 * Client-safe phase (NEXT_PUBLIC_APP_PHASE, inlined at build time).
 * Gates the contact form fallback, the email capture, and the /learn footer line.
 */
export function publicPhase(): AppPhase {
  return parsePhase(process.env.NEXT_PUBLIC_APP_PHASE);
}
