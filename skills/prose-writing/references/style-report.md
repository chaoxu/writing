# Style report

Run the bundled Vale helper before verifier review of prose or a mathematical manuscript when Vale and Bun are available:

```sh
bun /path/to/skill/scripts/style.ts --profile academic main.tex appendix.tex > style.json
bun /path/to/skill/scripts/style.ts --profile informal post.md > style.json
```

Vale is the maintained prose-lint engine at https://github.com/vale-cli/vale. Install its CLI through an appropriate package manager or an upstream release. The helper finds `vale` on PATH or at `~/.local/bin/vale`. Use `--vale /path/to/vale` to select an executable explicitly. The fleet installation uses the checksum-verified upstream release. The helper performs no downloads or installations.

The academic profile checks empty framing, prose punctuation, unsupported contribution language, proof transitions such as “obviously,” and forced informality. The informal profile checks framing and punctuation while permitting conversational wording. Auto mode selects academic for `.tex` and informal for `.md`, `.markdown`, and `.txt`. Select academic explicitly for a paper written in Markdown or plain text.

Each finding includes the file, profile, rule, severity, original start and end lines and UTF-16 columns, matched expression, reason, and source context. A successful command means the report was produced. Findings require contextual judgment. Preserve quotations, supported uncertainty, logical transitions, and technical expressions such as “simple graph,” “statistical significance,” and “essentially bounded.” The editor fixes supported violations and the separate verifier checks the revision. Tool findings do not certify mathematical correctness or voice similarity.

The helper reuses the terminology tool's heuristic prose inventory to mask common math, code, comments, citations, URLs, and control names before sending plain text to Vale. Skipped material separates phrase matches and source positions remain available. It does not expand TeX macros, follow included files, or parse every Markdown extension. Supply relevant source files explicitly. Inspect source and rendering when a construct or quotation needs interpretation.

The configs and YAML rules are bundled under `vale/` in each skill. They use no spelling dictionary or synonym substitutions. To change checks, edit the applicable bundled rules. On the fleet, edit the canonical KB copies and keep the published bundles synchronized. If either tool is unavailable, report that the automated check could not run and continue the required editor–verifier review.
