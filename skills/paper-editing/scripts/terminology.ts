#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";

export interface Document { path: string; text: string }
export interface Term { canonical: string; aliases: string[] }
export interface Glossary { terms: Term[]; ignore: string[] }
interface Token { word: string; index: number; end: number }
interface Location { file: string; line: number; column: number; context: string }

const segmenter = new Intl.Segmenter("en", { granularity: "word" });
const commonWords = new Set(("a an and are as at be been being but by can could did do does each either for from had has have hence here how if in into is it its may might more most must neither no nor not of on one only or other our out over same should since so some such than that the their them then there these they this those through thus to under up us use used using was we were what when where which while who will with would you your").split(" "));
const normalize = (word: string) => word.normalize("NFKC").toLocaleLowerCase("en");
const blank = (text: string) => text.replace(/[^\r\n]/g, " ");
const omit = (text: string) => text.replace(/[^\r\n]/g, "\0");

function dollarMath(text: string, latex: boolean): string {
  const marks = [...text.matchAll(/(?<!\\)\$/g)].map((match) => match.index!);
  const characters = text.split("");
  for (let index = 0; index + 1 < marks.length; index++) {
    const start = marks[index]!;
    let end = marks[index + 1]!;
    if (end === start + 1) {
      let closing = index + 2;
      while (closing + 1 < marks.length && marks[closing + 1] !== marks[closing]! + 1) closing++;
      if (closing + 1 >= marks.length) continue;
      end = marks[closing + 1]!;
      index = closing + 1;
    } else {
      const body = text.slice(start + 1, end);
      if (/\n\s*\n/u.test(body) || (!latex && (/^\s|\s$/u.test(body) || /\d/u.test(text[end + 1] ?? "")))) continue;
      index++;
    }
    for (let cursor = start; cursor <= end; cursor++) if (characters[cursor] !== "\n" && characters[cursor] !== "\r") characters[cursor] = "\0";
  }
  return characters.join("");
}

function transparentFormatting(text: string): string {
  const characters = text.split("");
  for (const match of text.matchAll(/\\(?:emph|textbf|textit|texttt|textsc|textnormal|textrm|textsf|underline|mbox)\*?\s*\{/g)) {
    const opening = match.index! + match[0].length - 1;
    let depth = 1;
    let closing = opening + 1;
    for (; closing < text.length; closing++) {
      if (text[closing - 1] === "\\") continue;
      if (text[closing] === "{") depth++;
      if (text[closing] === "}" && --depth === 0) break;
    }
    if (depth !== 0) continue;
    for (let cursor = match.index!; cursor <= opening; cursor++) if (characters[cursor] !== "\n" && characters[cursor] !== "\r") characters[cursor] = " ";
    characters[closing] = " ";
  }
  let prose = characters.join("");
  // Only matched emphasis delimiters are transparent. Unmatched punctuation remains.
  prose = prose.replace(/(\*\*|__|\*|_)(?=\S)([^\r\n]*?\S)\1/g, (match, marker: string, content: string) => blank(marker) + content + blank(marker));
  return prose;
}

// Preserve source offsets. This is a prose inventory, not a TeX renderer.
export function proseText(text: string, latex = false): string {
  if (latex) text = text.replace(/(?<!\\)%[^\r\n]*/g, omit);
  let fence: { character: string; length: number } | undefined;
  const headingEnds: number[] = [];
  let lineOffset = 0;
  let prose = text.split(/(?<=\n)/).map((line) => {
    const start = lineOffset;
    lineOffset += line.length;
    if (latex) return line;
    const match = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)/u.exec(line);
    if (fence !== undefined) {
      if (match && match[1]![0] === fence.character && match[1]!.length >= fence.length && match[2]!.trim() === "") fence = undefined;
      return omit(line);
    }
    if (match) { fence = { character: match[1]![0]!, length: match[1]!.length }; return omit(line); }
    let content = line;
    while (true) {
      const inner = content.replace(/^ {0,3}(?:>[ \t]?|(?:[-+*]|\d+[.)])[ \t]+)/u, "");
      if (inner === content) break;
      content = inner;
    }
    if (/^ {0,3}#{1,6}(?=[ \t\r\n]|$)/u.test(content) && line.endsWith("\n")) headingEnds.push(start + line.length - 1);
    return line;
  }).join("");
  prose = prose.replace(/<!--[\s\S]*?-->/g, omit);
  prose = prose.replace(/\\begin\{(verbatim\*?|lstlisting|minted|equation\*?|align\*?|alignat\*?|gather\*?|multline\*?|displaymath|math)\}[\s\S]*?\\end\{\1\}/g, omit);
  if (!latex) {
    prose = prose.replace(/(`+)[^\r\n]*?\1/g, omit);
    prose = prose.replace(/^[ \t]*(?:[-+*]|\d+[.)])[ \t]+/gm, omit);
    prose = prose.replace(/^ {0,3}(?:=+|-+|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})[ \t]*$/gm, omit);
  } else {
    prose = prose.replace(/``([\s\S]*?)''/g, (_match, content: string) => "  " + content + "  ");
    prose = prose.replace(/`([^`\r\n]*?)'/g, (_match, content: string) => " " + content + " ");
  }
  prose = dollarMath(prose, latex);
  prose = prose.replace(/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/g, omit);
  prose = transparentFormatting(prose);
  prose = prose.replace(/\\(?:label|ref|eqref|autoref|[cC]ref|cite[A-Za-z]*|bibliography|bibliographystyle|includegraphics|url|input|include|begin|end|documentclass|usepackage)\*?(?:\s*\[[^\]]*\])*\s*\{[^{}]*\}/g, omit);
  prose = prose.replace(/\\[A-Za-z@]+\*?/g, omit);
  prose = prose.replace(/\]\([^\r\n)]*\)/g, omit);
  prose = prose.replace(/https?:\/\/[^\s<>]+/g, omit);
  prose = prose.replace(/\[[^\]\r\n]*@[^\]\r\n]*\]/g, omit);
  prose = prose.replace(/(?<![\w])@[A-Za-z0-9_:./-]+/g, omit);
  prose = prose.replace(/<\/?([A-Za-z][\w:-]*)[^>\r\n]*>/g, (match, name: string) => /^(?:p|div|section|article|h[1-6]|li|ul|ol|table|tr|td|br|hr)$/iu.test(name) ? omit(match) : blank(match));
  prose = prose.replace(/^:{3,}[^\r\n]*$/gm, omit);
  if (headingEnds.length > 0) {
    const characters = prose.split("");
    for (const end of headingEnds) characters[end] = "\0";
    prose = characters.join("");
  }
  return prose;
}

function tokens(text: string): Token[] {
  return [...segmenter.segment(text)].filter((part) => (part.isWordLike || /\p{N}/u.test(part.segment)) && /[\p{L}\p{N}]/u.test(part.segment))
    .map((part) => ({ word: normalize(part.segment), index: part.index, end: part.index + part.segment.length }));
}

const separator = (gap: string) => gap.includes("\0") || /\n\s*\n/u.test(gap) ? null : gap.normalize("NFKC").replace(/[\s\-‐‑]/gu, "");
const precedingAffix = /[\p{S}#@_＃＠＿]+$/u;
const followingAffix = /^[\p{S}#@_＃＠＿]+/u;

function expressionParts(expression: string) {
  const text = expression.trim();
  const parts = tokens(text);
  if (parts.length === 0) throw new Error("glossary expressions must contain a word");
  const prefix = text.slice(0, parts[0]!.index).normalize("NFKC");
  const suffix = text.slice(parts[parts.length - 1]!.end).normalize("NFKC");
  if (!/^[\p{S}#@_]*$/u.test(prefix) || !/^[\p{S}#@_]*$/u.test(suffix)) {
    throw new Error("unsupported outer punctuation in glossary expression; symbol affixes must touch their words");
  }
  return { text, parts, prefix, suffix };
}

function expressionKey(expression: string): string {
  const { text, parts, prefix, suffix } = expressionParts(expression);
  const key: string[] = [prefix];
  for (const [index, part] of parts.entries()) {
    if (index > 0) {
      const gap = separator(text.slice(parts[index - 1]!.end, part.index));
      if (gap === null) throw new Error("glossary expressions must stay within a paragraph");
      key.push(gap);
    }
    key.push(part.word);
  }
  return JSON.stringify([...key, suffix]);
}

export function parseGlossary(value: unknown): Glossary {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("glossary must be an object");
  const config = value as Record<string, unknown>;
  for (const key of Object.keys(config)) if (key !== "terms" && key !== "ignore") throw new Error(`unknown glossary field: ${key}`);
  const ignore = config.ignore ?? [];
  if (!Array.isArray(ignore) || ignore.some((word) => typeof word !== "string" || word.trim() === "")) throw new Error("ignore must contain nonempty words");
  const definitions = config.terms ?? [];
  if (!Array.isArray(definitions)) throw new Error("terms must be an array");
  const seen = new Set<string>();
  const terms = definitions.map((definition): Term => {
    if (typeof definition !== "object" || definition === null || Array.isArray(definition)) throw new Error("each term must be an object");
    const term = definition as Record<string, unknown>;
    for (const key of Object.keys(term)) if (key !== "canonical" && key !== "aliases") throw new Error(`unknown term field: ${key}`);
    if (typeof term.canonical !== "string" || !/\p{L}/u.test(term.canonical)) throw new Error("canonical must contain a word");
    const aliases = term.aliases ?? [];
    if (!Array.isArray(aliases) || aliases.some((alias) => typeof alias !== "string" || !/\p{L}/u.test(alias))) throw new Error("aliases must contain word-bearing strings");
    for (const expression of [term.canonical, ...aliases] as string[]) {
      const key = expressionKey(expression);
      if (seen.has(key)) throw new Error(`duplicate glossary expression: ${expression}`);
      seen.add(key);
    }
    return { canonical: term.canonical, aliases: aliases as string[] };
  });
  return { terms, ignore: ignore as string[] };
}

function locate(document: Document, starts: number[], index: number): Location {
  let low = 0;
  let high = starts.length;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (starts[middle]! <= index) low = middle; else high = middle;
  }
  const start = starts[low]!;
  const end = document.text.indexOf("\n", start);
  return { file: document.path, line: low + 1, column: index - start + 1,
    context: document.text.slice(Math.max(start, index - 100), Math.min(end === -1 ? document.text.length : end, index + 140)).trim() };
}

export function analyze(documents: Document[], glossary: Glossary = { terms: [], ignore: [] }, rareLimit = 2) {
  if (!Number.isSafeInteger(rareLimit) || rareLimit < 1) throw new Error("rare limit must be a positive integer");
  const prepared = documents.map((document) => {
    const prose = proseText(document.text, /\.tex$/iu.test(document.path));
    const starts = [0, ...[...document.text.matchAll(/\n/g)].map((match) => match.index! + 1)];
    return { document, prose, tokens: tokens(prose), starts };
  });
  const vocabulary = new Map<string, { word: string; count: number; locations: Location[] }>();
  let wordCount = 0;
  for (const item of prepared) for (const token of item.tokens) {
    if (!/\p{L}/u.test(token.word)) continue;
    wordCount++;
    const entry = vocabulary.get(token.word) ?? { word: token.word, count: 0, locations: [] };
    entry.count++;
    if (entry.locations.length < 3) entry.locations.push(locate(item.document, item.starts, token.index));
    vocabulary.set(token.word, entry);
  }
  const ignored = new Set([...commonWords, ...glossary.ignore.map(normalize)]);
  const candidates = [...vocabulary.values()].filter((entry) => !ignored.has(entry.word) && !/^[a-z]$/u.test(entry.word))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "en"));
  function occurrences(expression: string) {
    const { text, parts: needle, prefix, suffix } = expressionParts(expression);
    const locations: Location[] = [];
    let count = 0;
    for (const item of prepared) for (let index = 0; index <= item.tokens.length - needle.length; index++) {
      let matches = true;
      for (let offset = 0; offset < needle.length; offset++) {
        const token = item.tokens[index + offset]!;
        if (token.word !== needle[offset]!.word) { matches = false; break; }
        if (offset > 0) {
          const previous = item.tokens[index + offset - 1]!;
          const gap = item.prose.slice(previous.end, token.index);
          const expected = separator(text.slice(needle[offset - 1]!.end, needle[offset]!.index));
          const actual = separator(gap);
          if (actual === null || actual !== expected) { matches = false; break; }
        }
      }
      if (matches) {
        const first = item.tokens[index]!;
        const last = item.tokens[index + needle.length - 1]!;
        const before = item.prose.slice(item.tokens[index - 1]?.end ?? 0, first.index).match(precedingAffix)?.[0] ?? "";
        const after = item.prose.slice(last.end, item.tokens[index + needle.length]?.index).match(followingAffix)?.[0] ?? "";
        if (before.normalize("NFKC") !== prefix || after.normalize("NFKC") !== suffix) continue;
        count++;
        if (locations.length < 3) locations.push(locate(item.document, item.starts, first.index - before.length));
      }
    }
    return { expression, count, locations };
  }
  const terms = glossary.terms.map((term) => ({ canonical: occurrences(term.canonical), aliases: term.aliases.map(occurrences) }));
  const aliasCandidates = terms.flatMap((term) => term.aliases.filter((alias) => alias.count > 0)
    .map((alias) => ({ canonical: term.canonical.expression, alias: alias.expression, count: alias.count, locations: alias.locations,
      reason: "The supplied glossary declares this expression an alias. Verify its meaning in context before changing it." })));
  return { summary: { files: documents.length, wordCount, distinctWordCount: vocabulary.size, candidateWordCount: candidates.length, rareLimit },
    vocabulary: candidates, rareWords: candidates.filter((entry) => entry.count <= rareLimit), terms, aliasCandidates };
}

export function main(args: string[]): number {
  const { values, positionals: files } = parseArgs({ args, allowPositionals: true, options: {
    terms: { type: "string" }, rare: { type: "string", default: "2" }, help: { type: "boolean", short: "h" },
  } });
  if (values.help) {
    console.log("Usage: bun terminology.ts [--terms glossary.json] [--rare N] FILE...\n\nRead-only JSON inventory of prose vocabulary and declared terminology aliases.\nCounts are review aids. The tool does not infer semantic equivalence or edit files.");
    return 0;
  }
  const glossary = values.terms === undefined ? { terms: [], ignore: [] } : parseGlossary(JSON.parse(readFileSync(values.terms, "utf8")));
  if (!/^[1-9][0-9]*$/u.test(values.rare!) || !Number.isSafeInteger(Number(values.rare))) throw new Error("--rare requires a positive integer");
  const rareLimit = Number(values.rare);
  if (files.length === 0) throw new Error("provide at least one text file");
  console.log(JSON.stringify(analyze(files.map((path) => ({ path, text: readFileSync(path, "utf8") })), glossary, rareLimit), null, 2));
  return 0;
}

if (import.meta.main) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
