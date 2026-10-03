import { expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { analyze, parseGlossary, proseText } from "../skills/paper-editing/scripts/terminology";

test("frequencies combine sources and preserve first occurrence contexts", () => {
  const report = analyze([
    { path: "first.md", text: "The parity interval is defined.\nA parity interval remains." },
    { path: "second.md", text: "A PARITY interval has a boundary." },
  ]);
  const interval = report.vocabulary.find((entry) => entry.word === "interval")!;
  expect(interval.count).toBe(3);
  expect(interval.locations.map((location) => [location.file, location.line])).toEqual([["first.md", 1], ["first.md", 2], ["second.md", 1]]);
  expect(report.vocabulary.some((entry) => entry.word === "the")).toBe(false);
  expect(report.rareWords.some((entry) => entry.word === "interval")).toBe(false);
  expect(report.rareWords.some((entry) => entry.word === "boundary")).toBe(true);
});

test("Markdown source positions survive code, math, comments, and citations", () => {
  const text = "<!-- secretword -->\n```tex\ncodeword\n````\n$mathword$ and `inlineword`.\nA **parity interval** is defined [@citationword].\n";
  const report = analyze([{ path: "paper.md", text }]);
  const words = report.vocabulary.map((entry) => entry.word);
  for (const omitted of ["secretword", "codeword", "mathword", "inlineword", "citationword"]) expect(words).not.toContain(omitted);
  expect(report.vocabulary.find((entry) => entry.word === "parity")!.locations[0]!.line).toBe(6);
  expect(proseText(text).length).toBe(text.length);
});

test("LaTeX inventory retains formatted prose and excludes control data", () => {
  const text = String.raw`\section{Parity intervals}
\emph{parity interval} is defined. % commentword
\label{labelword} \cite{citationword} \ref{referenceword}
\begin{equation} mathword + x \end{equation}
\begin{align*} equationword &= y \end{align*}
\begin{verbatim} codeword \end{verbatim}`;
  const words = analyze([{ path: "paper.tex", text }]).vocabulary.map((entry) => entry.word);
  expect(words).toContain("parity");
  expect(words).toContain("interval");
  for (const omitted of ["section", "emph", "commentword", "labelword", "citationword", "referenceword", "mathword", "equationword", "codeword"]) expect(words).not.toContain(omitted);
});

test("a percentage in ordinary prose preserves the following claim", () => {
  for (const path of ["paper.md", "email.txt"]) {
    const report = analyze([{ path, text: "At 50% probability, the boundary remains." }]);
    expect(report.vocabulary.map((entry) => entry.word)).toContain("probability");
    expect(report.vocabulary.map((entry) => entry.word)).toContain("boundary");
  }
});

test("aliases require an explicit glossary and preserve distinct mathematical terms", () => {
  const document = { path: "paper.md", text: "The parity interval contains a parity band. The rank differs from the dimension." };
  expect(analyze([document]).aliasCandidates).toEqual([]);
  const report = analyze([document], parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] }));
  expect(report.aliasCandidates.map((entry) => entry.alias)).toEqual(["parity band"]);
  expect(report.vocabulary.map((entry) => entry.word)).toContain("rank");
  expect(report.vocabulary.map((entry) => entry.word)).toContain("dimension");
});

test("phrase matches respect word boundaries, punctuation, and paragraph boundaries", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] });
  const report = analyze([{ path: "paper.md", text: "Parity bandit. Parity. Band. Parity\n\nband. A parity-band exists. A parity\nband remains." }], glossary);
  expect(report.aliasCandidates[0]!.count).toBe(2);
});

test("declared aliases are reported when only the alias occurs and ignore affects only vocabulary", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }], ignore: ["parity"] });
  const report = analyze([{ path: "paper.md", text: "A parity band exists." }], glossary);
  expect(report.terms[0]!.canonical.count).toBe(0);
  expect(report.aliasCandidates[0]!.count).toBe(1);
  expect(report.vocabulary.map((entry) => entry.word)).not.toContain("parity");
});

test.each([
  ["paper.md", "A parity **band** exists."],
  ["paper.md", "A parity _band_ exists."],
  ["paper.tex", String.raw`A parity \emph{band} exists.`],
  ["paper.tex", String.raw`A \textbf{parity \emph{band}} exists.`],
  ["paper.md", "A parity <em>band</em> exists."],
])("formatted aliases remain visible in %s", (path, text) => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] });
  expect(analyze([{ path, text }], glossary).aliasCandidates[0]!.count).toBe(1);
});

test.each([
  "parity $x$ band",
  "parity `x` band",
  "parity <!-- omitted --> band",
  "<p>A parity</p><p>band is defined.</p>",
  "parity\\ref{object} band",
])("omitted content separates phrase matches: %s", (text) => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] });
  expect(analyze([{ path: "paper.md", text }], glossary).aliasCandidates).toEqual([]);
});

test.each([
  "% Use $ for currency.\nThe parity band is defined.\nLet $x$ be positive.\n",
  "% \\begin{equation}\nA parity band is defined.\n% \\end{equation}\n",
])("TeX comments cannot introduce active math delimiters", (text) => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] });
  const report = analyze([{ path: "paper.tex", text }], glossary);
  expect(report.aliasCandidates[0]!.count).toBe(1);
});

test("currency preserves prose while adjacent inline mathematics remains excluded", () => {
  const text = "The budget is $50 per person and the refund is $20 per person. Let $mathword$ denote a value.";
  const report = analyze([{ path: "paper.md", text }]);
  const words = report.vocabulary.map((entry) => entry.word);
  expect(words).toContain("refund");
  expect(report.vocabulary.find((entry) => entry.word === "person")!.count).toBe(2);
  expect(words).not.toContain("mathword");
});

test("declared explicit separators match without merging other expressions", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "max-flow/min-cut theorem", aliases: [] }] });
  const report = analyze([{ path: "paper.md", text: "The max-flow/min-cut theorem applies. Max flow min cut theorem is another spelling." }], glossary);
  expect(report.terms[0]!.canonical.count).toBe(1);
});

test("numerical parts of declared mathematical names preserve distinct concepts", () => {
  const glossary = parseGlossary({ terms: [
    { canonical: "type 1", aliases: [] },
    { canonical: "type 2", aliases: [] },
    { canonical: "rank-1 tensor", aliases: [] },
    { canonical: "rank-2 tensor", aliases: [] },
  ] });
  const report = analyze([{ path: "paper.md", text: "Type 1 differs from type 2. A rank-1 tensor differs from a rank-2 tensor." }], glossary);
  expect(report.terms.map((term) => term.canonical.count)).toEqual([1, 1, 1, 1]);
  expect(report.vocabulary.map((entry) => entry.word)).not.toContain("1");
  expect(report.vocabulary.map((entry) => entry.word)).not.toContain("2");
});

test("glossary duplicate checks use the same separators as occurrence matching", () => {
  const glossary = parseGlossary({ terms: [
    { canonical: "max-flow/min-cut theorem", aliases: [] },
    { canonical: "max flow min cut theorem", aliases: [] },
  ] });
  const report = analyze([{ path: "paper.md", text: "The max-flow/min-cut theorem applies. Max flow min cut theorem names another expression." }], glossary);
  expect(report.terms.map((term) => term.canonical.count)).toEqual([1, 1]);
  expect(() => parseGlossary({ terms: [{ canonical: "rank-1 tensor", aliases: ["Rank 1 tensor"] }] })).toThrow("duplicate");
});

test("TeX quotation marks retain both quoted terminology and intervening prose", () => {
  const text = "A ``parity band'' is defined. Another ``parity interval'' follows.";
  const glossary = parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] });
  const report = analyze([{ path: "paper.tex", text }], glossary);
  expect(report.terms[0]!.canonical.count).toBe(1);
  expect(report.aliasCandidates[0]!.count).toBe(1);
  expect(report.vocabulary.map((entry) => entry.word)).toContain("defined");
  expect(proseText(text, true)).toHaveLength(text.length);
});

test.each(["- parity\n- band\n", "1. parity\n2. band\n", "  + parity\n  + band\n"])("separate Markdown list items do not form a glossary phrase: %s", (text) => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity band" }] });
  expect(analyze([{ path: "paper.md", text }], glossary).terms[0]!.canonical.count).toBe(0);
  expect(proseText(text)).toHaveLength(text.length);
});

test("a list item's soft wrap and a hyphen within its term still match", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity band" }] });
  const report = analyze([{ path: "paper.md", text: "- A parity\n  band exists.\n- Another parity-band remains." }], glossary);
  expect(report.terms[0]!.canonical.count).toBe(2);
});

test.each(["------", "===", "- - -", "___"])("Markdown heading underlines and thematic breaks separate terms: %s", (boundary) => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity band" }] });
  const text = "parity\n" + boundary + "\nband is defined.";
  expect(analyze([{ path: "paper.md", text }], glossary).terms[0]!.canonical.count).toBe(0);
  expect(proseText(text)).toHaveLength(text.length);
});

test.each(["# parity", "## parity", "###### parity", "- # parity", "> # parity"])("an ATX heading cannot form a term with its following body: %s", (heading) => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity band" }] });
  const text = heading + "\nband is defined.";
  expect(analyze([{ path: "paper.md", text }], glossary).terms[0]!.canonical.count).toBe(0);
  expect(proseText(text)).toHaveLength(text.length);
});

test("heading prose and its source locations remain available to terminology review", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] });
  const text = "# A parity band ###\r\nA parity interval remains.";
  const report = analyze([{ path: "paper.md", text }], glossary);
  expect(report.terms[0]!.canonical.count).toBe(1);
  expect(report.aliasCandidates[0]!.count).toBe(1);
  expect(report.aliasCandidates[0]!.locations[0]!).toMatchObject({ line: 1, column: 5 });
  expect(report.terms[0]!.canonical.locations[0]!).toMatchObject({ line: 2, column: 3 });
});

test("literal hash names and ordinary soft wraps are not ATX heading boundaries", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "#P-complete" }, { canonical: "parity band" }] });
  const text = "#P-complete\nis defined.\nA parity\nband exists.";
  expect(analyze([{ path: "paper.md", text }], glossary).terms.map((term) => term.canonical.count)).toEqual([1, 1]);
});

test("symbol affixes distinguish glossary expressions and retain their source locations", () => {
  const glossary = parseGlossary({ terms: [
    { canonical: "#P-complete" }, { canonical: "P-complete" },
    { canonical: "C++" }, { canonical: "C" }, { canonical: "C#" },
  ] });
  const text = "The first problem is #P-complete. The second is P-complete.\nC++ differs from C. C# is another name.";
  const report = analyze([{ path: "paper.md", text }], glossary);
  expect(report.terms.map((term) => term.canonical.count)).toEqual([1, 1, 1, 1, 1]);
  expect(report.terms[0]!.canonical.locations[0]!.column).toBe(text.indexOf("#") + 1);
  expect(report.terms[2]!.canonical.locations[0]!).toMatchObject({ line: 2, column: 1 });
});

test("symbol-affix matching normalizes Unicode and does not match a shorter affix", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "#P-complete" }, { canonical: "C++" }] });
  const text = "＃P-complete and C＋＋ appear. ##P-complete and C+++ are different.";
  expect(analyze([{ path: "paper.md", text }], glossary).terms.map((term) => term.canonical.count)).toEqual([1, 1]);
  expect(() => parseGlossary({ terms: [{ canonical: "C++", aliases: ["C＋＋"] }] })).toThrow("duplicate");
});

test("unsupported outer glossary punctuation fails instead of silently disappearing", () => {
  expect(() => parseGlossary({ terms: [{ canonical: "(P)" }] })).toThrow("outer punctuation");
});

test("Unicode normalization preserves source offsets and phrase boundaries", () => {
  // Equivalent normalized expressions must be rejected, rather than counted twice.
  expect(() => parseGlossary({ terms: [{ canonical: "field width", aliases: ["ﬁeld width"] }] })).toThrow("duplicate");
});

test("Unicode contexts and unnormalized source lengths remain accurate", () => {
  const glossary = parseGlossary({ terms: [{ canonical: "field size", aliases: ["field width"] }] });
  const report = analyze([{ path: "paper.md", text: "连接集有定义。\nThe ﬁeld width is fixed." }], glossary);
  expect(report.aliasCandidates[0]!.count).toBe(1);
  expect(report.aliasCandidates[0]!.locations[0]!.line).toBe(2);
  expect(report.aliasCandidates[0]!.locations[0]!.column).toBe(5);
  expect(report.vocabulary.some((entry) => /连接/u.test(entry.word))).toBe(true);
});

test("invalid glossaries and thresholds fail explicitly", () => {
  expect(() => parseGlossary({ terms: [{ canonical: "parity interval", aliases: ["Parity-Interval"] }] })).toThrow("duplicate");
  expect(() => parseGlossary({ terms: [{ canonical: "", aliases: [] }] })).toThrow("canonical");
  expect(() => parseGlossary({ ignored: [] })).toThrow("unknown glossary field");
  expect(() => analyze([], undefined, 0)).toThrow("positive integer");
});

test("CLI produces JSON without modifying input and does not certify an alias-free manuscript", () => {
  const directory = mkdtempSync(join(tmpdir(), "writing-terms-test-"));
  try {
    const path = join(directory, "paper.md");
    const glossary = join(directory, "glossary.json");
    const text = "A parity band exists.\n";
    writeFileSync(path, text);
    writeFileSync(glossary, JSON.stringify({ terms: [{ canonical: "parity interval", aliases: ["parity band"] }] }));
    const script = resolve(import.meta.dir, "../skills/paper-editing/scripts/terminology.ts");
    const child = Bun.spawnSync([process.execPath, "--no-install", "--no-env-file", script, "--terms", glossary, path]);
    expect(child.exitCode).toBe(0);
    expect(JSON.parse(new TextDecoder().decode(child.stdout)).aliasCandidates).toHaveLength(1);
    expect(readFileSync(path, "utf8")).toBe(text);
    const invalid = Bun.spawnSync([process.execPath, "--no-install", "--no-env-file", script, "--rare", "0", path]);
    expect(invalid.exitCode).toBe(1);
  } finally { rmSync(directory, { recursive: true }); }
});

test.each(["prose-writing", "paper-writing", "paper-editing"])("%s bundles all its relative references and optional tool", (name) => {
  const root = resolve(import.meta.dir, `../skills/${name}`);
  const markdown = ["SKILL.md", ...readdirSync(join(root, "references")).filter((path) => path.endsWith(".md")).map((path) => `references/${path}`)];
  for (const path of markdown) {
    const text = readFileSync(join(root, path), "utf8");
    for (const link of text.matchAll(/\]\(([^\s)]+)\)/g)) {
      if (/^https?:/u.test(link[1]!)) continue;
      const target = resolve(root, path, "..", link[1]!);
      expect(target.startsWith(root + "/")).toBe(true);
      expect(existsSync(target)).toBe(true);
    }
  }
  expect(existsSync(join(root, "LICENSE"))).toBe(true);
  expect(existsSync(join(root, "scripts/terminology.ts"))).toBe(true);
});
