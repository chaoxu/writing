# Mathematical and TCS Manuscripts

## Scope and architecture

Choose one coherent level of generality suited to the user's result. Preserve the exact hypotheses, quantifiers, targets, and parameter dependence. Do not replace the requested problem with a more tractable neighboring statement. Label restricted-case results as partial.

Write imported facts at the level of the paper. Keep the main argument complete in the body by default. A more general companion result can have an independent appendix when appropriate. Respect venue and user requirements for proof placement, and make any body-to-appendix dependencies explicit.

Present a one-line consequence of the main theorem in prose when a separate corollary adds no value. Retain named consequences that are reused or structurally important. Separate cases where the mathematics differs, and frame multiple algorithms by their assumptions or regimes.

## Introduction and preliminaries

Introduce the problem concretely, give the relevant prior work with precise attribution, and state the result and its assumptions. This is an order of explanation, not a paragraph quota. State each result in its strongest useful form without repeating weaker parameterizations.

Keep the abstract focused on the headline result. Name secondary results briefly unless their precise bounds are essential to the paper's purpose. Contribution lists state results, running times, assumptions, and comparisons with prior work. Define technical machinery before using it to explain a contribution.

Give a short proof idea naming the mechanisms that make the result work. Preserve useful author-written proof-idea prose. A longer overview is appropriate when the argument needs it. Include an organization sentence only when it helps navigation.

Preliminaries contain the definitions and established facts actually used. Introduce objects used only by a later section there. After establishing the vocabulary, use it consistently. Discussions should explain a connection or consequence rather than repeat the introduction.

## Attribution and proof economy

For substantive drafting or mathematical revision, classify the affected load-bearing claims in a compact working ledger:

| Kind | Presentation |
| --- | --- |
| Exact known result | Give a precise citation and only the statement needed in the paper's notation. |
| Routine consequence or modification | Cite the source beside the claim, identify the specialization or change, and prove only that difference. |
| Synthesis of known ingredients | Attribute the ingredients and isolate the new bridge or combined conclusion. |
| New argument | Give the proof and state exactly which part appears to be new. |

**Cite known results instead of reproving them.** First check that the theorem actually covers the needed hypotheses and conclusion. Retain a proof when the claim is new, the source does not cover the required form, or the requested exposition needs a self-contained argument. For a routine adaptation, keep enough detail to establish the difference.

Read the relevant primary-source passage. Verify the theorem, proposition, section, or page locator where available, the source version, and any relevant correction or withdrawal. Check the direction of the implication and the conventions behind terms. A survey or search snippet can locate a source but does not verify its theorem.

If a source is inaccessible, record the claim that remains unchecked. Do not invent theorem numbers, citations, or certainty. Failure to find an earlier result supports cautious wording and does not establish priority. Cite known sharpness examples or supply a checked example for “tight,” “optimal,” or “best possible” claims.

A notation change, dualization, specialization, or standard transport is not a new theorem merely because it is rewritten. Use wording such as “Applying [source, Theorem X] with ... gives ...” or “The proof applies with ... replaced by ...”.

## Statements, notation, and terminology

Use established literature terminology. Define or cite each technical term before use. Introduce definitions where needed and avoid unused vocabulary. A sparse term should earn its place through necessary content or repeated use.

Theorem, lemma, proposition, corollary, and definition blocks contain their hypotheses and conclusion. Symbols must be defined in the block, in the established setup, or by precise reference to a named setting. Move motivation, comparison, consequences, attribution discussion, and commentary into surrounding prose.

Use one stable name per concept and one role per symbol. Check for collisions across sections. Prefer plain uppercase for sets, calligraphic letters for collections, and lowercase letters for elements when the field and existing manuscript allow it. Keep established notation when changing it would confuse the reader.

Preserve names already introduced in the manuscript or established in the cited literature. For a suspected alias, quote both expressions and use their definitions or context to explain why they name the same concept. New terminology is justified by a necessary mathematical distinction, rather than by variety. Inspect sparse terms and first uses. The optional [terminology report](terminology-report.md) supplies word frequencies, contexts, and declared aliases. A smaller vocabulary count does not establish clearer or correct mathematics.

Use unambiguous inclusion symbols such as `\subseteq` and `\subsetneq`, and `\setminus` for set difference. Follow the document's native math delimiters, bibliography format, and label conventions. Prefix labels by their kind where supported, for example `thm:`, `lem:`, `eq:`, and `sec:`.

Use conventional asymptotic expressions with all relevant parameter factors visible. Simplify harmless shifts only when the stated domain supports it, handling exceptional small or empty cases explicitly. Check every logarithmic factor and distinguish arithmetic time, bit complexity, and oracle calls when the result does.

## Proofs

Keep named lemmas for reusable arguments or meaningful structural steps. Inline obvious one-use observations. Name a device only when its name improves understanding. An operation such as “remove loops” usually needs no new terminology.

Fill every load-bearing gap. If injectivity is used, supply the reconstruction or another sufficient argument. Spell out decisive parity, counting, and arithmetic identities once. Cite the exact condition of a lemma that makes an inference valid.

Proof economy preserves enough detail to verify the reasoning. Do not cut a necessary hypothesis or silently add one that weakens the promised result. If a proof requires a missing assumption, identify the mismatch and its effect on the theorem.

Long proofs can use short claims as checkpoints. Return to the main argument without ceremonial transitions. Direct verbs such as “follows,” “implies,” and “yields” work well. A short closing sentence should record the inference just completed.

## Algorithms and dynamic programs

Let pseudocode read as mathematics. Once an optimization capability is established, use a direct `arg min` or `arg max` assignment, including initialization. Explain the implementation and oracle-call count in prose. Keep helper calls or search bookkeeping when their mechanics matter to the result. State tie-breaking and infeasibility conventions once.

Describe a dynamic program through its states, base cases, recurrence, and complexity. Display the recurrence with clear quantifiers and explain each term. State computation order when it is needed to justify correctness or complexity. Prove invariants and bounds without narrating every loop step.

## Revision and validation

Preserve deliberate author wording, qualifications, and proof ideas within the requested scope. Remove duplicate explanations, echo sentences, and synonym cycling. Abstract–introduction overlap is often necessary. Elsewhere invoke an established fact instead of deriving it again.

For the affected material, check proof economy, duplication, undefined terms, symbol clashes, load-bearing implications, attribution, and cross-references. Combine these checks in one pass when practical. Check that the body and any appendices have the dependencies the text promises.

Validate citation keys, source locators, theorem numbers, and the actual build or rendering when tools are available. Every writing deliverable uses the [editor and verifier](editor-verifier.md) loop. A local wording edit needs a separate verifier for local meaning and terminology. Proof changes need relevant dependency and source checks. A full audit needs manuscript-wide scrutiny. Return each revision to the verifier until no unresolved issues remain in the requested scope.

Review reports should identify concrete issues with locations, quoted text, and reasons. Distinguish mathematical defects, unverified claims, and optional style changes. Verify reviewer claims before applying them. Report the validation performed and any remaining mathematical or source uncertainty.
