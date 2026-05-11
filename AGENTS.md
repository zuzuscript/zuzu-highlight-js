# ZuzuScript Browser Highlighter

This repository contains the browser-oriented ZuzuScript syntax highlighter
in `zuzu-highlight.js`.

Use Oxford English in documentation: mostly standard British English, with
`-ize` word endings.

## Relationship To Other Projects

This highlighter is used by browser-facing tooling such as the website and
webconsole. It should track the language documented in the `userguide`
submodule and examples from the `examples` submodule, but it must not invent
syntax or depend on sibling checkouts.

Local reference paths:

- `docs/userguide/zuzuscript-guide/AA-bnf.md`
- `docs/userguide/zuzuscript-guide/AB-operator-precedence.md`
- `docs/userguide/operators-table.html`
- `docs/examples/*.zzs`

If those paths are missing, initialize submodules before making syntax
decisions.

## Keeping Syntax Current

When updating highlighting, compare `zuzu-highlight.js` against the BNF and
operator appendix. Check:

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

Also run a small DOM-stub tokenizer check for representative current syntax.
Include current keywords, stale keywords, operators, Unicode literals,
triple literals, template interpolation, regexp literals, POD, and examples
from `docs/examples`.

This highlighter is visual rather than parser-exact, so prefer conservative
token recognition that avoids breaking comments, strings, and ordinary
identifiers.
