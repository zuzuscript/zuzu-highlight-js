# AGENTS.md

## Repository Scope

This repository contains the browser-oriented ZuzuScript syntax highlighter
in `zuzu-highlight.js`.

Keep future work self-contained. Do not rely on sibling checkouts or files
outside this repository. The local submodules provide the reference material:

- `docs/userguide/zuzuscript-guide/AA-bnf.md`
- `docs/userguide/zuzuscript-guide/AB-operator-precedence.md`
- `docs/userguide/operators-table.html`
- `docs/examples/*.zzs`

If those paths are missing, initialize the submodules before making syntax
decisions.

## Keeping Syntax Current

When updating highlighting, compare `zuzu-highlight.js` against the BNF and
operator appendix above. Check all of these surfaces:

- reserved words and contextual words;
- word-like operators such as `eq`, `mod`, `typeof`, and `subsetof`;
- symbolic operators and delimiters, including Unicode spellings;
- literal forms: strings, binary strings, templates, regexps, booleans,
  null, empty set, and numeric forms;
- comments and embedded POD;
- syntax examples in `docs/examples`.

Do not preserve stale keyword highlighting unless the current local
userguide or examples still require it. Stale words should fall back to
ordinary identifiers.

## Validation

At minimum, run:

```bash
node --check zuzu-highlight.js
```

Also run a small DOM-stub tokenizer check for representative current
syntax. Include current keywords, stale keywords, operators, Unicode
literals, triple literals, template interpolation, regexp literals, POD,
and examples from `docs/examples`.

This highlighter is visual rather than parser-exact, so prefer conservative
token recognition that avoids breaking comments, strings, and ordinary
identifiers.
