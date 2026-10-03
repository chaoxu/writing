# Maintaining the skills

- Keep every folder under `skills/` independently usable. All required guidance belongs inside that folder, with relative links. Do not add private paths, external instruction dependencies, or required sibling skills.
- The two paper skills intentionally bundle identical `references/mathematics.md` files. All three skills bundle identical `references/voice.md` files. Update matching copies together so a recipient can share one folder without losing rules.
- Shared `editor-verifier.md` and `terminology-report.md` references are maintained in `skills/prose-writing/references/`. The terminology script is maintained in `skills/paper-editing/scripts/`. Run `bun tools/sync-bundles.ts` after changing a shared source, and `bun tools/sync-bundles.ts --check` to detect drift.
- Preserve user scope and mathematical meaning. Cite established results instead of reproving them, and keep review proportional to the change.
- Every writing deliverable uses a separate verifier. Its findings name the violated requirement and explain the defect. Return revisions to it until no unresolved issues remain in the requested scope.
- Preserve the MIT notice when packaging individual folders.
- For instruction-only changes, check frontmatter, internal links, standalone folder contents, and the affected guidance. Add executable tooling or behavioral tests only when a demonstrated need warrants them.
