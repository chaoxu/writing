# Writing Skills

Portable agent skills for Chao Xu's prose and mathematical writing preferences: direct claims, exact attribution, concise proofs, consistent terminology, and preservation of the author's meaning.

| Skill | Use it for |
| --- | --- |
| [prose-writing](skills/prose-writing/SKILL.md) | Posts, essays, emails, documentation, applications, and other prose in any language. |
| [paper-writing](skills/paper-writing/SKILL.md) | New mathematical or TCS manuscripts, abstracts, introductions, contribution framing, and substantial restructuring. |
| [paper-editing](skills/paper-editing/SKILL.md) | Scoped revisions and audits of existing manuscripts, from wording changes to proof and citation review. |

Each folder contains all its instructions, references, and license. Install any one independently. No private knowledge base, personal files, service, model provider, or sibling skill is required. The user's task and the document's authoring rules determine the scope and format.

## Install

Clone the repository outside your skill directory, then link the skills you want:

```sh
git clone https://github.com/chaoxu/writing.git ~/writing-skills
mkdir -p ~/.codex/skills
ln -s "$HOME/writing-skills/skills/prose-writing" "$HOME/.codex/skills/"
ln -s "$HOME/writing-skills/skills/paper-writing" "$HOME/.codex/skills/"
ln -s "$HOME/writing-skills/skills/paper-editing" "$HOME/.codex/skills/"
```

Alternatively, download the repository ZIP and copy the desired folders from `skills/` into your client's skill directory. Copy the whole folder, including `references/`. For Claude Code, use `~/.claude/skills/`. Other agents can read a skill's `SKILL.md` and follow its relative references directly. The `agents/openai.yaml` files provide optional Codex UI metadata.

Existing skill names are left alone by the link commands. Replace an existing installation deliberately if it uses one of these names. This collection replaces the former single `chao-writing` skill.

To update a linked installation:

```sh
git -C ~/writing-skills pull --ff-only
```

## Use

```text
Use $paper-writing to turn these verified results into a short paper.
Cite established results instead of reproving them.

Use $paper-editing to check Section 3's proof and citations.
Preserve the rest of the manuscript.

Use $prose-writing to shorten this email while preserving its request and tone.
```

Clients with automatic skill discovery can also select the appropriate skill from an ordinary request.

## Why separate writing and editing?

Drafting decides the paper's architecture: which result leads, what belongs in the introduction, and how the argument is organized. Editing starts with an author's existing choices and changes only what the task calls for. A wording edit needs a local meaning check. A changed theorem needs its dependencies and sources checked. A full audit covers the manuscript.

Both paper skills use the same mathematical standards. In particular, **cite known results instead of proving them again**, verify exact hypotheses, and prove only the necessary adaptation or new argument. The split makes the intended level of intervention clear. Neither paper skill depends on the other.

## Tools and portability

Every writing deliverable uses an editor and a separate verifier agent. The verifier identifies concrete violations of the writing requirements, explains why they fail, and checks revisions until no unresolved issues remain in the requested scope. A clean verdict ends the loop. If independent verification is unavailable, report the draft's unfinished review status. The workflow uses the recipient's agent delegation tools and requires no particular model provider.

Each skill bundles an optional local terminology report at `scripts/terminology.ts`. Run it with Bun as described in that skill's `references/terminology-report.md`. It reports vocabulary frequencies, first occurrences, contexts, and aliases declared in an optional glossary. The verifier checks whether two expressions actually denote the same mathematical concept. The tool reads local text and makes no changes or network calls.

The instruction workflow has no executable dependency. Tasks can still require ordinary tools: source access for citation verification, a TeX distribution for a LaTeX build, or a PDF viewer for layout inspection. Use the recipient's available tools and report any checks that could not be completed. No particular PDF plugin or private toolchain is required.

The collection combines the earlier repository's prose and revision guidance with the current manuscript rules. It includes established terminology, mathematical pseudocode, citation-before-reproof, and an editor–verifier loop scaled to the requested work. Style reviews use concrete feedback. Numerical AI-likelihood scores are optional, uncalibrated judgments and are never completion criteria.

Licensed under [MIT](LICENSE).
