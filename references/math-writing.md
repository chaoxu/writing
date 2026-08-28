# Mathematical and TCS Writing

## Choose the paper's level

Work at one conceptual level. Pick the cleanest setting in which the main result is interesting and restate every imported fact at that level. Move a substantially more general companion theorem to a separate paper or a self-contained appendix.

The body contains the cleanest self-contained proof of the main result. The paper must remain complete if the appendix is removed.

## Introduction

A reliable order is:

1. define the problem concretely
2. state the relevant prior results with exact attribution
3. identify the unresolved case or quantitative gap
4. state the new result, its assumptions, and its sharpness
5. give the proof idea in one or two sentences
6. include one short organization sentence when the document is long enough to need it

This order is a tool, not a paragraph quota. Combine or omit stages when the paper reads better without them.

Contribution bullets state results, running times, parameter assumptions, and the comparison with prior work. Keep mechanisms and secondary bounds out of the bullets. State each result once in its strongest useful form.

## Known work and novelty

Classify every load-bearing theorem, lemma, algorithm, and proof step before presenting it:

- exact known result
- routine consequence or modification
- new synthesis of known ingredients
- genuinely new result

Replace an exact known proof with a precise primary-source citation when possible. For a routine specialization, dualization, translation, or modification, cite the source next to the statement and prove only the delta. Do not call a notation change or standard transport a contribution.

For a synthesis, attribute each imported ingredient and isolate the new bridge. Verify theorem numbers and hypotheses against the primary sources. Failure to find a result supports cautious wording, not a priority claim.

Every claim that a bound is sharp, tight, optimal, or best possible needs a citation or an explicit example.

## Preliminaries and locality

Include only definitions and known results used by the proofs. Introduce a definition used by one late section in that section. Define every term and symbol before first use.

Theorem, lemma, proposition, corollary, and definition blocks contain exactly the hypotheses and conclusion. Put motivation, comparison, consequences, and commentary in surrounding prose.

Name each load-bearing object once and use that name consistently. Use one symbol per role. Check for collisions across sections. Prefer plain uppercase for sets, calligraphic letters for collections or families, and lowercase letters for elements. Use `\subseteq` or `\subsetneq`, not ambiguous `\subset`, and `\setminus` for set difference.

Use `$...$` for inline mathematics. Use display mathematics for labelled, aligned, or genuinely multi-line expressions. Follow the document's native syntax when it differs.

## Proofs

Keep a named lemma or claim when it is reused, structurally important, or gives the reader a real checkpoint. Inline one-use observations that an expert can reconstruct immediately.

Fill load-bearing gaps. If injectivity is used, give the reconstruction. If a parity or counting identity drives the proof, spell it out once. Cite the exact condition used rather than referring vaguely to “the lemma.”

Long arguments may use short claims as verification units. State the claim, prove it, and return to the main argument without a readiness announcement such as “with this lemma in hand.”

Use direct logical verbs: follows, shows, implies, yields, induces, and reduces to. A standard closing such as “The desired result follows” is appropriate when it records the completed inference. Do not use it for theatrical rhythm.

## Algorithms and dynamic programs

State a dynamic program through its state, base case, recurrence, and complexity. Display the recurrence with clear quantifiers, then explain the meaning of each term. Dependencies already determine computation order, so do not narrate initialization and iteration unless order itself is part of the argument.

Name a device only when it is non-obvious and reused. Write “remove loops” or “output a cocircuit contained in the set” when that is the whole operation.

Correctness proofs verify invariants and bounds. They do not narrate a loop line by line.

## Deduplication and final passes

Nothing is explained twice outside the necessary abstract–introduction overlap. A repeated argument becomes one lemma. A result stated formally is invoked later, not paraphrased.

Run separate passes for:

1. simplification and proof economy
2. duplicate claims and echo sentences
3. undefined terms, synonyms, and symbol collisions
4. self-containment without the appendix or introduction
5. exact attribution and honest novelty
6. cross-references, citation keys, theorem numbers, build output, and rendered mathematics

