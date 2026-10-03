# Editor and verifier

Every writing deliverable uses an editor and a separate verifier agent. The editor may be the primary agent. Ordinary progress messages are outside this workflow. Keep the review within the user's requested scope, with enough surrounding context to check the affected claims.

1. The editor drafts or revises the text and retains the original when editing existing material.
2. Give the verifier the current text, the original or diff when applicable, the user's requirements, relevant writing rules, and necessary context. The verifier checks meaning, facts, mathematical claims, terminology, exposition, and requested format as applicable. It checks the edits themselves and their effect on the surrounding argument.
3. Each finding identifies a location, quotes the affected text, names the violated requirement, explains why it fails, and proposes a correction when possible. Distinguish a defect from an unresolved concern or an optional preference. For a suspected terminology alias, identify both expressions and explain why they name the same concept.
4. The editor checks each finding against the source and requirements, fixes supported defects, and explains any disputed finding to the verifier. A disputed issue remains open until the verifier accepts its resolution.
5. Return the revised text to the verifier. Continue until it reports no unresolved issues in the requested scope. Any edit after that verdict requires verification again. A clean verdict ends the loop without another ceremonial clean round.

The verifier judges the text independently. It receives the requirements and evidence, rather than an instruction to approve the editor's conclusions. A reviewer finding alone does not establish a mathematical defect. Confirm it against the argument or exact source before applying it.

If an independent verifier is unavailable, a required source cannot be checked, or the agents cannot resolve an issue without a user decision, report the unfinished verification and the concrete reason. Keep any draft distinguishable from a verified deliverable. A build, vocabulary count, or self-review does not replace the verifier.

For requested de-AI work, first give a fresh verifier only the final text and intended audience for blind style feedback. Then provide the original and requirements for a separate meaning-preservation check. Resolve concrete findings through the same loop. AI-likelihood scores are optional, uncalibrated stylistic judgments and never completion criteria.

For mathematical terminology, preserve established names and the author's defined terms. Use one name for each concept and distinguish different concepts explicitly. Review new names, sparse terms, and first uses. Keep a new term when it expresses a necessary distinction. Word frequencies and alias reports supply candidates for semantic review, rather than a target vocabulary score.
