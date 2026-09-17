import { z } from "zod";
import { SERVICE_SLUGS } from "@/content/types";
import { NICHE_FORM_VALUES } from "@/content/niches";
import { ATTRIBUTION_KEYS } from "@/lib/attribution";

/** Zod 4 idioms: z.email() at the top level. */
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Enter a valid email address." }))
  .pipe(z.string().max(254));

/** A native <select> posts "" when nothing is chosen; treat that as undefined. */
export const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .enum(values)
    .or(z.literal(""))
    .optional()
    .transform((v) => (v ? v : undefined));

export const attributionSchema = z
  .object(
    Object.fromEntries(ATTRIBUTION_KEYS.map((k) => [k, z.string().max(200).optional()])) as Record<
      (typeof ATTRIBUTION_KEYS)[number],
      z.ZodOptional<z.ZodString>
    >,
  )
  .partial();

export const honeypotFields = {
  /** Honeypot: declared so a filled value still parses; checked after parse. */
  company_website: z.string().max(200).optional(),
  /** Millisecond timestamp set client-side on mount. Missing = too fast. */
  started_at: z.coerce.number().optional(),
};

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: emailField,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  summary: z
    .string()
    .trim()
    .min(20, "Give us a couple of sentences so we can actually help.")
    .max(2000, "Keep it under 2000 characters."),
  service: optionalEnum(SERVICE_SLUGS),
  niche: optionalEnum(NICHE_FORM_VALUES),
  ...honeypotFields,
  attribution: attributionSchema.optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export const subscribeSchema = z.object({
  email: emailField,
  service: z.enum(SERVICE_SLUGS),
  ...honeypotFields,
  attribution: attributionSchema.optional(),
});

export type SubscribeInput = z.input<typeof subscribeSchema>;

/** Flatten zod issues to { field: message } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
