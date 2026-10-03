import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Keep each published skill standalone without maintaining divergent copies.
const root = resolve(import.meta.dir, "..");
const names = ["prose-writing", "paper-writing", "paper-editing"];
const shared = ["voice.md", "editor-verifier.md", "terminology-report.md", "style-report.md"];
const pairs: [string, string][] = [];
for (const name of names) {
  for (const reference of shared) {
    const source = resolve(root, "skills/prose-writing/references", reference);
    const destination = resolve(root, `skills/${name}/references`, reference);
    if (source !== destination) pairs.push([source, destination]);
  }
  const source = resolve(root, "skills/paper-editing/scripts/terminology.ts");
  const destination = resolve(root, `skills/${name}/scripts/terminology.ts`);
  if (source !== destination) pairs.push([source, destination]);
  const styleScript = resolve(root, "skills/prose-writing/scripts/style.ts");
  const styleDestination = resolve(root, `skills/${name}/scripts/style.ts`);
  if (styleScript !== styleDestination) pairs.push([styleScript, styleDestination]);
  const vale = resolve(root, "skills/prose-writing/vale");
  for (const file of readdirSync(vale, { recursive: true })) {
    const rule = resolve(vale, String(file));
    if (!statSync(rule).isFile()) continue;
    const bundled = resolve(root, `skills/${name}/vale`, String(file));
    if (rule !== bundled) pairs.push([rule, bundled]);
  }
}
pairs.push([resolve(root, "skills/paper-writing/references/mathematics.md"), resolve(root, "skills/paper-editing/references/mathematics.md")]);
const check = process.argv[2] === "--check";
if (process.argv.length > 3 || (process.argv[2] !== undefined && !check)) throw new Error("expected sync-bundles.ts [--check]");
for (const [source, destination] of pairs) {
  if (check) {
    if (readFileSync(source, "utf8") !== readFileSync(destination, "utf8")) throw new Error(`bundled copy differs: ${destination}`);
  } else { mkdirSync(dirname(destination), { recursive: true }); copyFileSync(source, destination); }
}
console.log(check ? "Bundled copies match." : "Bundled copies updated.");
