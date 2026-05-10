(function () {
	'use strict';

	if ( typeof document === 'undefined' ) {
		return;
	}

	var STYLE_ID = 'zuzu-highlight-js-style';
	var KEYWORDS = new Set( [
		'abs', 'and', 'as', 'assert', 'async', 'await', 'but', 'can', 'case',
		'catch', 'ceil', 'class', 'clear', 'cmp', 'cmpi', 'const', 'continue',
		'debug', 'default', 'die', 'do', 'does', 'else', 'eq', 'eqi',
		'equivalentof', 'extends', 'false', 'floor', 'fn', 'for', 'from',
		'function', 'ge', 'gei', 'get', 'gt', 'gti', 'has', 'if', 'import',
		'in', 'instanceof', 'int', 'intersection', 'last', 'lc', 'le', 'lei',
		'length', 'let', 'lt', 'lti', 'method', 'mod', 'nand', 'ne', 'nei',
		'new', 'next', 'not', 'null', 'or', 'print', 'return', 'round', 'say',
		'self', 'set', 'spawn', 'sqrt', 'static', 'subsetof', 'supersetof',
		'super', 'switch', 'throw', 'trait', 'true', 'try', 'typeof', 'uc',
		'union', 'unless', 'warn', 'weak', 'while', 'with', 'xor'
	] );

	var BUILTIN_TYPES = new Set( [
		'Array', 'Bag', 'Boolean', 'Class', 'Collection', 'Dict', 'Function',
		'Number', 'Object', 'Pair', 'PairList', 'Set', 'String', 'Trait'
	] );
	var IDENTIFIER_SOURCE = '(?:[A-Za-z]|_[A-Za-z0-9_])[A-Za-z0-9_]*';
	var IDENTIFIER_FLAGS = '';
	try {
		new RegExp( '\\p{ID_Start}', 'u' );
		IDENTIFIER_SOURCE = '(?:\\p{ID_Start}|_[\\p{ID_Continue}_])[\\p{ID_Continue}_]*';
		IDENTIFIER_FLAGS = 'u';
	} catch ( err ) {
	}
	var IDENTIFIER_RE = new RegExp( '^(?:' + IDENTIFIER_SOURCE + ')$', IDENTIFIER_FLAGS );
	var TOKEN_PATTERN_SOURCE = [
		'\\/\\/[^\\n]*',
		'\\/\\*[\\s\\S]*?\\*\\/',
		'"""[\\s\\S]*?"""',
		"'''[\\s\\S]*?'''",
		'```[\\s\\S]*?```',
		'"(?:\\\\.|[^"\\\\])*"',
		"'(?:\\\\.|[^'\\\\])*'",
		'`(?:\\\\.|[^`\\\\])*`',
		'\\/(?![\\/\\*=\\s])(?:\\\\.|[^\\/\\\\\\n])+\\/[i]?',
		'0x[\\da-fA-F]+',
		'0b[01]+',
		'\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?',
		'⊤|⊥|∅',
		'\\.\\.\\.',
		'<<<|>>>',
		'\\*\\*=',
		'\\?:=',
		'<=>',
		'\\?:',
		'=>',
		'->|→',
		'@\\?|@@',
		'~=',
		':=',
		'\\.\\(',
		'\\{\\{|\\}\\}',
		'<<|>>',
		'«|»',
		'\\.\\.',
		'==|!=|<=|>=',
		'≠|≤|≥|≡|≢|≶|≷',
		'\\+=|-=|\\*=|\\/=|%=|_=',
		'\\+\\+|--',
		'\\*\\*',
		'⊂⊃',
		'×=|÷=',
		'[+\\-*/%<>=!?:|&.^~×÷⋀⋁⊻⊼¬∈∉⋃⋂∖\\\\⊂⊃@√⌊⌋⌈⌉]',
		'[{}()[\\],;.]',
		'\\s+',
		IDENTIFIER_SOURCE
	].join( '|' );
	var TOKEN_PATTERN_FLAGS = 'g' + IDENTIFIER_FLAGS;

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

		if ( /^(?:"""[\s\S]*?"""|'''[\s\S]*?'''|```[\s\S]*?```|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)$/s.test( token ) ) {
			return 'string';
		}

		if ( /^\/(?![\/\*=\s])(?:\\.|[^\/\\\n])+\/[i]?$/.test( token ) ) {
			return 'string';
		}

		if ( /^(?:0x[\da-f]+|0b[01]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)$/i.test( token ) ) {
			return 'number';
		}

		if ( /^[⊤⊥∅]$/.test( token ) ) {
			return 'literal';
		}

		if ( /^(?:\.\.\.|<<<|>>>|\*\*=|\?:=|<=>|\?:|=>|->|→|@\?|@@|~=|:=|\.\(|\{\{|\}\}|<<|>>|«|»|\.\.|==|!=|<=|>=|≠|≤|≥|≡|≢|≶|≷|\+=|-=|\*=|\/=|%=|_=|\+\+|--|\*\*|⊂⊃|×=|÷=|[+\-*/%<>=!?:|&.^~×÷⋀⋁⊻⊼¬∈∉⋃⋂∖\\⊂⊃«»@√⌊⌋⌈⌉])$/.test( token ) ) {
			return 'operator';
		}

		if ( /^[{}()[\],;.]$/.test( token ) ) {
			return 'punct';
		}

		if ( IDENTIFIER_RE.test( token ) && KEYWORDS.has( token ) ) {
			return 'keyword';
		}

		if ( IDENTIFIER_RE.test( token ) && BUILTIN_TYPES.has( token ) ) {
			return 'keyword';
		}

		if ( IDENTIFIER_RE.test( token ) ) {
			return 'ident';
		}

		return 'plain';
	}

	function tokenizeCode( source ) {
		var tokenPattern = new RegExp( TOKEN_PATTERN_SOURCE, TOKEN_PATTERN_FLAGS );
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
			'.zuzu-highlight .zuzu-hl-literal { color: #f29e74; }',
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
