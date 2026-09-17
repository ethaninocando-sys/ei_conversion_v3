import { describe, expect, it } from "vitest";
import { placeholderLinesInSource } from "../../scripts/placeholders";

describe("placeholder scanner", () => {
  it("finds placeholders in string literals", () => {
    const src = [
      'const a = "[OWNER FIRST NAME] explains things";',
      "const b = '[TAGLINE]';",
      "const c = `[MAILING ADDRESS]`;",
    ].join("\n");
    expect(placeholderLinesInSource(src)).toEqual([1, 2, 3]);
  });

  it("ignores TypeScript type syntax", () => {
    const src = [
      "export const NICHE_SLUGS = Object.keys(niches) as [NicheSlug, ...NicheSlug[]];",
      "const d: Array<[Key, Value]> = [];",
      "type Three = [string, string, string];",
    ].join("\n");
    expect(placeholderLinesInSource(src)).toEqual([]);
  });

  it("ignores line and block comments", () => {
    const src = [
      "// [OWNER: edit these to what you can stand behind.]",
      "/**",
      " * Anything in [BRACKETS] must be filled in by the owner.",
      " */",
      'const ok = "real copy";',
    ].join("\n");
    expect(placeholderLinesInSource(src)).toEqual([]);
  });

  it("still finds a placeholder on a line that also carries a comment", () => {
    const src = 'contactEmail: "[OWNER EXISTING EMAIL]", // switch to hello@ later';
    expect(placeholderLinesInSource(src)).toEqual([1]);
  });

  it("resumes scanning after a block comment closes", () => {
    const src = ["/* opens here", "still inside [NOT A PLACEHOLDER]", "*/", 'const x = "[REPLY WINDOW]";'].join("\n");
    expect(placeholderLinesInSource(src)).toEqual([4]);
  });

  it("ignores lowercase bracket text", () => {
    expect(placeholderLinesInSource('const s = "see [the guide] for details";')).toEqual([]);
  });
});
