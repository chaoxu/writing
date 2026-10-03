---
name: paper-editing
description: Edit or audit existing mathematical and theoretical-computer-science manuscripts for exposition, proof correctness, self-containment, and exact attribution, with verification scaled to the requested changes. New manuscripts and major contribution design fit paper-writing.
license: MIT
---

# Paper Editing

Improve the requested material while preserving the author's mathematical claims, hypotheses, modality, and deliberate choices. Follow the manuscript's format and applicable authoring rules. User instructions take precedence over these style defaults.

**Cite established results instead of proving them again.** For proof and citation work, check the exact source and hypotheses, make routine adaptations visibly routine, and prove only the necessary difference or new argument.

Read the relevant sections of [references/mathematics.md](references/mathematics.md) and [references/voice.md](references/voice.md). Both are bundled here. A local edit requires only the guidance and context needed to preserve meaning.

Use the [editor and verifier](references/editor-verifier.md) loop for every writing deliverable. A separate verifier checks the current text against the original and applicable requirements, explains concrete violations, and rechecks revisions until no unresolved issues remain.

## Match the review to the request

| Task | Work and verification |
| --- | --- |
| Wording or formatting | Inspect the passage and its notation context. Preserve facts, quantifiers, qualifications, and modality. Check affected syntax and references. |
| Proof, theorem, or citation change | Inspect the changed argument, its dependencies, and the exact primary sources. Classify any affected contribution as known, routine, synthesis, or new. Recheck downstream claims affected by the change. |
| Structural revision | Preserve a recoverable version. Reorganize within the authorized scope and verify moved definitions, arguments, and references. Retain deliberate proof-idea prose where possible. |
| Full audit | Inspect the manuscript, bibliography, and available verification records. Prioritize correctness, proof gaps, hypotheses, attribution, and self-containment. |

A wording edit does not require a manuscript-wide literature audit. A mathematical error affecting the requested passage should be reported explicitly. Do not silently weaken a theorem, change its target, or widen the edit to resolve it.

## Review and revise

- Report concrete issues with file or section locations, quoted text, the reason, and a proposed correction when available. Separate a proved defect from an unresolved concern or a style preference.
- Before applying a reviewer finding, verify it against the proof, definitions, or source. Reviewers can be wrong about standard facts and local notation.
- Every writing deliverable requires the separate verifier. A substantive proof change or full audit may warrant additional reviewers for distinct obligations within the user's delegation limits.
- Preserve defined and established names. For suspected aliases, identify both expressions and explain from their definitions or uses why they denote the same concept. Review sparse and new terms in context. Use the optional [terminology report](references/terminology-report.md) for frequencies, contexts, and declared aliases.
- Check affected cross-references, citation keys, theorem numbers, and the build or rendering. Inspect layout when relevant. Report unavailable source or tool checks accurately.
- Fix supported findings and return the revised text to the verifier. A clean verdict ends the loop. Later edits reopen verification.

Return the revised material or requested audit. Summarize substantive changes and validation briefly, including any contribution reclassification or remaining mathematical question. Preserve the user's requested delivery format.
