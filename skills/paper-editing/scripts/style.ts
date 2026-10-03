#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, extname } from "node:path";
import { parseArgs } from "node:util";
import { proseText } from "./terminology.ts";

type Profile = "academic" | "informal";
interface Alert { Check: string; Severity: string; Line: number; Span: number[]; Match: string; Message: string }

async function run(argv: string[], input?: string) {
  const child = Bun.spawn(argv, { stdin: input === undefined ? "ignore" : new TextEncoder().encode(input), stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
  if (code !== 0) throw new Error(`Vale exited ${code}: ${stderr || stdout}`);
  return stdout;
}

export async function styleReport(files: string[], profile: "auto" | Profile = "auto", executable?: string) {
  if (!["auto", "academic", "informal"].includes(profile)) throw new Error("--profile must be auto, academic, or informal");
  if (files.length === 0) throw new Error("provide at least one Markdown, plain-text, or TeX source file");
  const local = resolve(homedir(), ".local/bin/vale");
  const binary = executable ?? Bun.which("vale") ?? (existsSync(local) ? local : undefined);
  if (binary === undefined) throw new Error("Vale is unavailable. Install Vale and put it on PATH, or supply --vale /path/to/vale.");
  const version = (await run([binary, "--version"])).trim();
  const reports = [];
  for (const file of files) {
    const extension = extname(file).toLowerCase();
    if (![".md", ".markdown", ".txt", ".tex"].includes(extension)) throw new Error(`unsupported source format: ${file}`);
    const selected = profile === "auto" ? extension === ".tex" ? "academic" : "informal" : profile;
    const source = readFileSync(file, "utf8");
    // The shared inventory preserves UTF-16 offsets. Dots keep skipped material
    // from joining phrases across a formula, citation, code block, or heading.
    const masked = proseText(source, extension === ".tex").replaceAll("\r", " ").replace(/\n(?=[ \t]*\n)/g, ".").replaceAll("\0", ".");
    const config = resolve(import.meta.dir, "../vale", `${selected}.ini`);
    const output = await run([binary, `--config=${config}`, "--no-global", "--no-exit", "--output=JSON", "--ext=.txt"], masked);
    const records = JSON.parse(output) as Record<string, Alert[]>;
    const sourceLines = source.split("\n");
    const maskedLines = masked.split("\n");
    const starts = (text: string) => [0, ...[...text.matchAll(/\n/g)].map((match) => match.index! + 1)];
    const sourceStarts = starts(source);
    const maskedStarts = starts(masked);
    function locate(index: number) {
      let low = 0, high = sourceStarts.length;
      while (low + 1 < high) {
        const middle = Math.floor((low + high) / 2);
        if (sourceStarts[middle]! <= index) low = middle; else high = middle;
      }
      return { line: low + 1, column: index - sourceStarts[low]! + 1 };
    }
    const findings = Object.values(records).flat().map((alert) => {
      const line = maskedLines[alert.Line - 1];
      if (line === undefined || alert.Span.length !== 2) throw new Error("invalid Vale finding location");
      // Vale columns count code points. Convert against the masked line so
      // skipped supplementary characters still map to the original source.
      const firstIndex = maskedStarts[alert.Line - 1]! + [...line].slice(0, alert.Span[0]! - 1).join("").length;
      const endIndex = firstIndex + alert.Match.length;
      if (alert.Match.length === 0 || masked.slice(firstIndex, endIndex) !== alert.Match) throw new Error("Vale finding does not match the source location");
      const first = locate(firstIndex), last = locate(endIndex - 1);
      return { rule: alert.Check, severity: alert.Severity, line: first.line, column: first.column,
        endLine: last.line, endColumn: last.column, match: source.slice(firstIndex, endIndex),
        reason: alert.Message, context: sourceLines.slice(first.line - 1, last.line).join("\n") };
    });
    reports.push({ file, profile: selected, findings });
  }
  return { engine: { name: "Vale", version }, assessment: "review_required", files: reports };
}

export async function main(args: string[]) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: {
    profile: { type: "string", default: "auto" }, vale: { type: "string" }, help: { type: "boolean", short: "h" },
  } });
  if (values.help) {
    console.log("Usage: bun style.ts [--profile auto|academic|informal] [--vale /path/to/vale] FILE...\n\nRead-only Vale findings with source locations and reasons. Auto uses academic for TeX and informal for Markdown/plain text. Findings require contextual verifier review.");
    return;
  }
  console.log(JSON.stringify(await styleReport(positionals, values.profile as "auto" | Profile, values.vale), null, 2));
}

if (import.meta.main) {
  try { await main(process.argv.slice(2)); }
  catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
