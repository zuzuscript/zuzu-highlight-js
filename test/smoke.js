const assert = require( 'assert' );
const fs = require( 'fs' );
const vm = require( 'vm' );

const source = [
	'let nums := [0x1F, 0b1111, 0o100, 1E3, 2.5E-7];',
	'let divided := 2 divides 6 and 2 ∣ 6 and 4 ∤ 6;',
	'let logical := true nor? false xnor true onlyif? true butnot false;',
	'let symbolic := true ⊽? false ↔ true ⊨? true ⊭ false;',
	'let opts := capture(length: 42, method: "GET", class: "Widget");',
	'=pod',
	'plain POD',
	'=cut',
].join( '\n' );

const element = {
	dataset: {},
	innerHTML: '',
	textContent: source,
	matches() {
		return false;
	},
	querySelector() {
		return null;
	},
};

const document = {
	readyState: 'complete',
	head: {
		appendChild() {},
	},
	addEventListener() {},
	createElement() {
		return {};
	},
	getElementById() {
		return null;
	},
	querySelectorAll() {
		return [ element ];
	},
};

vm.runInNewContext(
	fs.readFileSync( 'zuzu-highlight.js', 'utf8' ),
	{ document }
);

const html = element.innerHTML;

for ( const token of [ '0x1F', '0b1111', '0o100', '1E3', '2.5E-7' ] ) {
	assert(
		html.includes( `<span class="zuzu-hl-number">${token}</span>` ),
		`${token} is highlighted as a number`
	);
}

for ( const token of [
	'divides', '∣', '∤', 'and', 'nor?', 'xnor', 'onlyif?', 'butnot',
	'⊽?', '↔', '⊨?', '⊭',
] ) {
	assert(
		html.includes( `<span class="zuzu-hl-operator">${token}</span>` ),
		`${token} is highlighted as an operator`
	);
}

for ( const key of [ 'length', 'method', 'class' ] ) {
	assert(
		html.includes(
			`<span class="zuzu-hl-operator">${key}</span><span class="zuzu-hl-operator">:</span>`
		)
			|| html.includes(
				`<span class="zuzu-hl-keyword">${key}</span><span class="zuzu-hl-operator">:</span>`
			)
			|| html.includes(
				`<span class="zuzu-hl-ident">${key}</span><span class="zuzu-hl-operator">:</span>`
			),
		`${key}: remains tokenized before a named-argument colon`
	);
}

assert( html.includes( '=pod\nplain POD\n=cut' ), 'POD remains plain text' );
