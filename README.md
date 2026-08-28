# Chao Writing

`chao-writing` is a self-contained agent skill for drafting and revising prose in Chao Xu's current style. It covers public prose and mathematical or theoretical-computer-science manuscripts.

The skill favors direct affirmative claims, concrete details, exact attribution, proof economy, notation discipline, and aggressive removal of repetition and metadiscourse. Its rules are distilled from Chao's working editing rules and published writing, with newer explicit judgments taking precedence over older frequency patterns.

## Install

Clone the repository into a skill directory:

```sh
git clone https://github.com/chaoxu/writing.git ~/.codex/skills/chao-writing
```

For Claude Code, clone or symlink the same directory at `~/.claude/skills/chao-writing`.

Invoke it as `$chao-writing`. Automatic discovery also works in clients that support skill descriptions.

## Contents

- `SKILL.md` routes each request and defines the output contract.
- `references/voice.md` contains the rules shared by all writing.
- `references/public-prose.md` covers essays, posts, emails, documentation, and applications.
- `references/math-writing.md` covers papers, proofs, algorithms, notation, and attribution.
- `references/revision.md` covers shortening, semantic preservation, de-AI work, manuscript review, and release checks.

The skill has no runtime dependencies and does not require access to Chao's private knowledge base.

