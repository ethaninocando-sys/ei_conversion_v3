import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** An owner-supplied placeholder, e.g. [OWNER FIRST NAME]. */
export const BRACKET = /\[[A-Z][^\]]*\]/;

const STRING_LITERAL = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g;

/**
 * 1-based line numbers whose STRING LITERALS contain a placeholder.
 *
 * Only literals count. TypeScript type syntax such as
 * `as [NicheSlug, ...NicheSlug[]]` and prose inside comments such as
 * "Anything in [BRACKETS] must be filled in" are not shippable content, and
 * scanning raw lines flagged both as placeholders.
 */
export function placeholderLinesInSource(source: string): number[] {
  const hits: number[] = [];
  let inBlockComment = false;

  source.split("\n").forEach((line, index) => {
    let code = line;

    if (inBlockComment) {
      const end = code.indexOf("*/");
      if (end === -1) return;
      code = code.slice(end + 2);
      inBlockComment = false;
    }
    // Block comments opened and closed on this line.
    code = code.replace(/\/\*.*?\*\//g, " ");
    // A block comment left open at the end of this line.
    const open = code.indexOf("/*");
    if (open !== -1) {
      inBlockComment = true;
      code = code.slice(0, open);
    }

    const literals = code.match(STRING_LITERAL);
    if (literals?.some((literal) => BRACKET.test(literal))) hits.push(index + 1);
  });

  return hits;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|json)$/.test(entry)) out.push(path);
  }
  return out;
}

/** "file:line" for every placeholder still present under the given directories. */
export function findPlaceholders(dirs: string[]): string[] {
  const hits: string[] = [];
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      for (const line of placeholderLinesInSource(readFileSync(file, "utf8"))) {
        hits.push(`${file}:${line}`);
      }
    }
  }
  return hits;
}
