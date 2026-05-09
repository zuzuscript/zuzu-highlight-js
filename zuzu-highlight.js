(function () {
	'use strict';

	if ( typeof document === 'undefined' ) {
		return;
	}

	var STYLE_ID = 'zuzu-highlight-js-style';
	var KEYWORDS = new Set( [
		'abs', 'and', 'as', 'assert', 'async', 'await', 'but', 'can', 'case',
		'catch', 'ceil', 'class', 'cmp', 'cmpi', 'const', 'contains', 'continue',
		'debug', 'default', 'die', 'difference', 'do', 'does', 'else', 'elsif',
		'eq', 'eqi', 'equivalentof', 'export', 'extends', 'false', 'floor', 'fn',
		'for', 'foreach', 'from', 'function', 'ge', 'gei', 'given', 'gt', 'gti',
		'if', 'import', 'in', 'instanceof', 'int', 'intersection', 'isa', 'last',
		'lc', 'le', 'lei', 'length', 'let', 'lt', 'lti', 'method', 'mod', 'my',
		'nand', 'ne', 'nei', 'new', 'next', 'not', 'not_in', 'null', 'or', 'our',
		'package', 'print', 'return', 'round', 'say', 'self', 'spawn', 'sqrt',
		'static', 'sub', 'subsetof', 'supersetof', 'super', 'switch', 'then',
		'throw', 'trait', 'true', 'try', 'typeof', 'uc', 'union', 'unless', 'use',
		'warn', 'when', 'while', 'with', 'xor'
	] );

	var BUILTIN_TYPES = new Set( [
		'Array', 'Bag', 'Boolean', 'Class', 'Collection', 'Dict', 'Function',
		'Number', 'Object', 'Pair', 'PairList', 'Set', 'String', 'Trait'
	] );
	function escapeHtml( text ) {
		return text
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' );
	}

	function classifyToken( token ) {
		if ( /^\s+$/.test( token ) ) {
			return 'ws';
		}

		if ( /^\/\//.test( token ) || /^\/\*/.test( token ) ) {
			return 'comment';
		}

		if ( /^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)$/s.test( token ) ) {
			return 'string';
		}

		if ( /^(?:0x[\da-f]+|0b[01]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)$/i.test( token ) ) {
			return 'number';
		}

		if ( /^(?:\.\.\.|<<<|>>>|\*\*=|\?:=|<=>|\?:|=>|->|→|@\?|@@|~=|\{\{|\}\}|<<|>>|«|»|\.\.|==|!=|<=|>=|≠|≤|≥|≡|≢|≶|≷|\+=|-=|\*=|\/=|%=|_=|\+\+|--|\*\*|⊂⊃|×=|÷=|[+\-*/%<>=!?:|&.^~×÷⋀⋁⊻⊼¬∈∉⋃⋂∖\\⊂⊃«»@√⌊⌋⌈⌉])$/.test( token ) ) {
			return 'operator';
		}

		if ( /^[{}()[\],;.]$/.test( token ) ) {
			return 'punct';
		}

		if ( /^[A-Za-z_][\w$]*$/.test( token ) && KEYWORDS.has( token ) ) {
			return 'keyword';
		}

		if ( /^[A-Za-z_][\w$]*$/.test( token ) && BUILTIN_TYPES.has( token ) ) {
			return 'keyword';
		}

		if ( /^[A-Za-z_][\w$]*$/.test( token ) ) {
			return 'ident';
		}

		return 'plain';
	}

	function tokenizeCode( source ) {
		var tokenPattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|0x[\da-fA-F]+|0b[01]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?|\.\.\.|<<<|>>>|\*\*=|\?:=|<=>|\?:|=>|->|→|@\?|@@|~=|\{\{|\}\}|<<|>>|«|»|\.\.|==|!=|<=|>=|≠|≤|≥|≡|≢|≶|≷|\+=|-=|\*=|\/=|%=|_=|\+\+|--|\*\*|⊂⊃|×=|÷=|[+\-*/%<>=!?:|&.^~×÷⋀⋁⊻⊼¬∈∉⋃⋂∖\\⊂⊃@√⌊⌋⌈⌉]|[{}()[\],;.]|\s+|[A-Za-z_][\w$]*)/g;
		var html = '';
		var match;
		var lastIndex = 0;

		while ( ( match = tokenPattern.exec( source ) ) !== null ) {
			if ( match.index > lastIndex ) {
				html += escapeHtml( source.slice( lastIndex, match.index ) );
			}

			var token = match[0];
			var type = classifyToken( token );
			if ( type === 'ws' || type === 'plain' ) {
				html += escapeHtml( token );
			} else {
				html += '<span class="zuzu-hl-' + type + '">' + escapeHtml( token ) + '</span>';
			}

			lastIndex = tokenPattern.lastIndex;
		}

		if ( lastIndex < source.length ) {
			html += escapeHtml( source.slice( lastIndex ) );
		}

		return html;
	}

	function tokenize( source ) {
		var html = '';
		var inPod = false;
		var codeLines = [];
		var lines = source.match( /[^\n]*\n|[^\n]+/g ) || [];
		var flushCode = function () {
			if ( codeLines.length === 0 ) {
				return;
			}
			html += tokenizeCode( codeLines.join( '' ) );
			codeLines = [];
		};

		lines.forEach( function ( line ) {
			if ( !inPod && /^=\w+\b/.test( line ) ) {
				flushCode();
				inPod = true;
			}

			if ( inPod ) {
				html += escapeHtml( line );
				if ( /^=cut\b/.test( line ) ) {
					inPod = false;
				}
				return;
			}

			codeLines.push( line );
		} );

		flushCode();

		return html;
	}

	function ensureStyle() {
		if ( document.getElementById( STYLE_ID ) ) {
			return;
		}

		var style = document.createElement( 'style' );
		style.id = STYLE_ID;
		style.textContent = [
			'.zuzu-highlight { color: #d9dde7; background: #1f2430; }',
			'.zuzu-highlight .zuzu-hl-keyword { color: #ffcc66; font-weight: 600; }',
			'.zuzu-highlight .zuzu-hl-string { color: #95e6cb; }',
			'.zuzu-highlight .zuzu-hl-number { color: #f29e74; }',
			'.zuzu-highlight .zuzu-hl-comment { color: #5c6773; font-style: italic; }',
			'.zuzu-highlight .zuzu-hl-operator { color: #89ddff; }',
			'.zuzu-highlight .zuzu-hl-punct { color: #c3a6ff; }',
			'.zuzu-highlight .zuzu-hl-ident { color: #d9dde7; }'
		].join( '\n' );
		document.head.appendChild( style );
	}

	function highlightElement( element ) {
		if ( !element || element.dataset.zuzuHighlighted === '1' ) {
			return;
		}

		var target = element;
		if ( element.matches( 'pre.zuzu-highlight' ) ) {
			var childCode = element.querySelector( ':scope > code' );
			if ( childCode ) {
				target = childCode;
			}
		}

		if ( target.dataset.zuzuHighlighted === '1' ) {
			element.dataset.zuzuHighlighted = '1';
			return;
		}

		target.innerHTML = tokenize( target.textContent || '' );
		target.dataset.zuzuHighlighted = '1';
		element.dataset.zuzuHighlighted = '1';
	}

	function runHighlight() {
		ensureStyle();
		var nodes = document.querySelectorAll( 'pre.zuzu-highlight, code.zuzu-highlight' );
		nodes.forEach( highlightElement );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', runHighlight, { once: true } );
	} else {
		runHighlight();
	}
})();
