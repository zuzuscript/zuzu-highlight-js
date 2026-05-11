# ZuzuScript Browser Highlighter

`zuzu-highlight.js` adds syntax highlighting for ZuzuScript code shown in a
web page. It is a small, self-contained browser script: include it on the page,
mark ZuzuScript code blocks with the `zuzu-highlight` class, and the script
will highlight them when the document loads.

The script recognizes current ZuzuScript keywords, operators, literals,
comments, strings, regular expressions, templates, and embedded POD. It also
adds a default dark colour scheme, so no extra CSS is required for basic use.

## Basic Use

Add the script to your page:

```html
<script src="zuzu-highlight.js"></script>
```

Then add `zuzu-highlight` to each ZuzuScript code block:

```html
<pre class="zuzu-highlight"><code>say "Hello from ZuzuScript"</code></pre>
```

You can also put the class directly on an inline or block `code` element:

```html
<code class="zuzu-highlight">let answer = 42</code>
```

The highlighter runs automatically. It reads the original text content of each
matching element and replaces it with highlighted HTML.

## Styling

By default, the script adds CSS for the `.zuzu-highlight` container and the
token classes it creates:

- `.zuzu-hl-keyword`
- `.zuzu-hl-string`
- `.zuzu-hl-literal`
- `.zuzu-hl-number`
- `.zuzu-hl-comment`
- `.zuzu-hl-operator`
- `.zuzu-hl-punct`
- `.zuzu-hl-ident`

To customize the colours, add your own CSS after loading the script, or use
more specific selectors in your stylesheet.
