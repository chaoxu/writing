# Terminology report

Use the optional `scripts/terminology.ts` bundled with a writing skill to inspect vocabulary and declared terminology aliases. Run it with an available Bun runtime:

```sh
bun /path/to/skill/scripts/terminology.ts section.tex appendix.tex > terminology.json
bun /path/to/skill/scripts/terminology.ts --terms glossary.json --rare 2 paper.md > terminology.json
```

The JSON report contains total and distinct prose word counts, a vocabulary filtered by common English function words and an optional ignore list, words appearing at most the selected frequency, source locations and contexts, and occurrences of canonical terms and aliases from a supplied glossary. Counts combine all input files. Locations retain the original source's file, line, and column. Each entry shows up to three occurrence contexts.

An optional glossary declares equivalent expressions already justified by the manuscript's definitions or a verifier's review:

```json
{
  "terms": [
    { "canonical": "parity interval", "aliases": ["parity band"] }
  ],
  "ignore": ["suppose"]
}
```

The tool matches case and common hyphen variants through Unicode word segmentation, while preserving numerical parts and other separators declared in a glossary expression. Names such as “type 1” and “type 2” remain distinct. Symbol affixes in names such as “#P-complete” and “C++” are significant and must touch their words; unsupported outer punctuation in a glossary expression is rejected explicitly. Common emphasis and text-formatting commands preserve phrase matches. Skipped math, code, and structural boundaries separate phrases. The report includes declared aliases even when the canonical expression is absent. It filters the vocabulary without suppressing glossary matches. It does not infer synonyms, merge concepts, rename text, or reject a manuscript on a numerical threshold. Running it successfully means the report was produced.

The editor and verifier inspect the contexts. For a suspected alias, quote both terms and explain from their definitions or uses why they denote the same concept. Replace a redundant name with the established term. Retain a new name when it expresses a necessary mathematical distinction. Review sparse terms and first uses without treating every rare ordinary word as jargon.

This is a heuristic source-prose inventory. It skips common Markdown code blocks, inline code, math, comments, citations, URLs, and LaTeX control names. It retains prose inside formatting commands. It does not expand TeX macros or follow included files. Supply the relevant source files explicitly and inspect the actual manuscript for definitions, mathematical notation, and constructs the inventory cannot interpret. The report supports the required verifier review.
