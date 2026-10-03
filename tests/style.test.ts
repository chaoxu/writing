import { expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { styleReport } from "../skills/prose-writing/scripts/style";

const installed = join(homedir(), ".local/bin/vale");
const executable = process.env.WRITING_TEST_VALE ?? Bun.which("vale") ?? (existsSync(installed) ? installed : undefined);
const integration = executable === undefined ? test.skip : test;
async function document(name: string, source: string, check: (file: string) => Promise<void>) {
  const directory = mkdtempSync(join(tmpdir(), "writing-style-"));
  const file = join(directory, name);
  writeFileSync(file, source);
  try { await check(file); expect(readFileSync(file, "utf8")).toBe(source); }
  finally { rmSync(directory, { recursive: true }); }
}

integration("academic concerns retain a conversational profile", async () => {
  await document("post.md", "It is worth noting that this is awesome; clearly this is groundbreaking.", async (file) => {
    const informal = await styleReport([file], "informal", executable);
    const academic = await styleReport([file], "academic", executable);
    expect(informal.assessment).toBe("review_required");
    expect(informal.files[0]!.findings.map((finding) => finding.match)).toEqual(["It is worth noting that", ";"]);
    expect(academic.files[0]!.findings.map((finding) => finding.match)).toEqual(["It is worth noting that", "awesome", ";", "clearly", "groundbreaking"]);
  });
});

integration("established terms and substantive logical transitions survive", async () => {
  await document("paper.tex", "A simple graph differs from a multigraph. An essentially bounded function has a bound. Statistical significance concerns a test. However, rank and dimension name distinct concepts here.", async (file) => {
    const report = await styleReport([file], "auto", executable);
    expect(report.files[0]!.profile).toBe("academic");
    expect(report.files[0]!.findings).toEqual([]);
  });
});

integration("Markdown code, math, comments, citations, and URLs supply no phrase flags", async () => {
  const source = "`obviously;` $\\text{obviously;}$\n```text\nIt is worth noting that;\n```\n<!-- groundbreaking; -->\n[@obviously; @groundbreaking]\nhttps://example.org/obviously;\nThe bound holds.\n";
  await document("paper.md", source, async (file) => expect((await styleReport([file], "academic", executable)).files[0]!.findings).toEqual([]));
});

integration("TeX control data and displayed mathematics supply no phrase flags", async () => {
  const source = String.raw`\section{A simple graph}
% It is worth noting that this is groundbreaking;
\[ \text{obviously groundbreaking;} \]
\cite{groundbreaking;obviously} \label{groundbreaking;obviously}
\begin{verbatim} It is worth noting that this is groundbreaking; \end{verbatim}
The bound holds.`;
  await document("paper.tex", source, async (file) => expect((await styleReport([file], "academic", executable)).files[0]!.findings).toEqual([]));
});

integration.each(["\n", "\r\n"])("wrapped and formatted expressions retain exact original ranges with %j", async (newline) => {
  const source = ["# Heading", "", "It is", "worth noting that this holds.", "It is **worth noting** that this holds.", ""].join(newline);
  await document("paper.md", source, async (file) => {
    const findings = (await styleReport([file], "informal", executable)).files[0]!.findings;
    expect(findings.map(({ line, column, endLine, endColumn, match }) => [line, column, endLine, endColumn, match])).toEqual([
      [3, 1, 4, 17, `It is${newline}worth noting that`], [5, 1, 5, 27, "It is **worth noting** that"],
    ]);
  });
});

integration("paragraphs, headings, formulas, and citations separate phrases", async () => {
  const source = "It is\n\nworth noting that this holds.\n# It is\nworth noting that this holds.\nIt is $x$ worth noting that this holds.\nIt is [@citation] worth noting that this holds.\n";
  await document("paper.md", source, async (file) => expect((await styleReport([file], "informal", executable)).files[0]!.findings).toEqual([]));
});

integration("Unicode and masked supplementary characters retain UTF-16 columns", async () => {
  const prefix = `${String.fromCodePoint(0x1f63a)} ${String.fromCodePoint(0x8fd9, 0x662f)} $${String.fromCodePoint(0x1f63a)}$ `;
  const source = `${prefix}It is worth noting that this holds.`;
  await document("paper.md", source, async (file) => {
    const finding = (await styleReport([file], "informal", executable)).files[0]!.findings[0]!;
    expect(finding.column).toBe(prefix.length + 1);
    expect(source.slice(finding.column - 1, finding.endColumn)).toBe(finding.match);
  });
});

integration("Chinese framing and punctuation retain exact ranges", async () => {
  const phrase = String.fromCodePoint(0x503c, 0x5f97, 0x6ce8, 0x610f, 0x7684, 0x662f);
  const source = `${phrase}${String.fromCodePoint(0x7ed3, 0x8bba)}${String.fromCodePoint(0xff1b)}`;
  await document("post.txt", source, async (file) => {
    const findings = (await styleReport([file], "informal", executable)).files[0]!.findings;
    expect(findings.map((finding) => finding.rule)).toEqual(["Writing.EmptyFraming", "Writing.Punctuation"]);
    for (const finding of findings) expect(source.slice(finding.column - 1, finding.endColumn)).toBe(finding.match);
  });
});

test("invalid profiles and absent inputs fail explicitly", async () => {
  await expect(styleReport([], "academic", executable)).rejects.toThrow("provide at least one");
  await expect(styleReport(["paper.tex"], "other" as "academic", executable)).rejects.toThrow("--profile must be");
});
