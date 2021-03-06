jQuery.extend(KhanUtil, {
	trigFuncs: ["sin", "cos", "tan"],
	ddxTrigFuncs: {
		"sin": function( expr ) {
			return ["cos", expr];
		},
		"cos": function( expr ) {
			return ["-", ["sin", expr]];
		},
		"tan": function( expr ) {
			return ["^", ["sec", expr], 2];
		}
	},

	generateFunction: function( variable ) {
		// Generate a differentiable expression object
		// {fofx, ddxF, wrongs}
		// x being the name of the variable we differentiate with respect to
		// ensure that the function isn"t just 0 as well
		var f;
		do {
			f = new KhanUtil.randFromArray(KhanUtil.CalcFunctions)( variable );
		} while (f.f === "0");
		return f;
	},

	generateSpecialFunction: function( variable ) {
		// Different emphasis from normal generateFunction
		// For the special_derivatives exercise
		var f;
		do {
			var r = KhanUtil.rand(10);
			if ( r < 2 ) { // 20% chance of power rule
				f = new KhanUtil.CalcFunctions[0]( variable );
			} else if ( r < 6 ) { // 40% chance of trig
				f = new KhanUtil.CalcFunctions[1]( variable );
			} else if ( r < 10 ) { // 40% chance of e^x / ln x
				f = new KhanUtil.CalcFunctions[3]( variable );
			}
		} while (f.f === "0");
		return f;
	},

	ddxPolynomial: function( poly ) {
		var ddxCoefs = [];
		
		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i - 1] = i * poly.coefs[i];
		}
		
		return new KhanUtil.Polynomial(poly.minDegree - 1, poly.maxDegree - 1, ddxCoefs, poly.variable);
	},

	// doesn't decrement exponents
	ddxPolynomialWrong1: function( poly ) {
		var ddxCoefs = [];
		
		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i] = i * poly.coefs[i];
		}
		
		return new KhanUtil.Polynomial( poly.minDegree, poly.maxDegree, ddxCoefs, poly.variable );
	},

	// increments negative exponents
	ddxPolynomialWrong2: function( poly ) {
		var ddxCoefs = [];
		
		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			if (i < 0) {
				ddxCoefs[i + 1] = i * poly.coefs[i];
			} else {
				ddxCoefs[i - 1] = i * poly.coefs[i];
			}
		}
		
		return new KhanUtil.Polynomial( poly.minDegree, poly.maxDegree, ddxCoefs, poly.variable );
	},

	// reversed signs on all terms
	ddxPolynomialWrong3: function( poly ) {
		var ddxCoefs = [];
		
		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i - 1] = -1 * i * poly.coefs[i];
		}
		
		return new KhanUtil.Polynomial( poly.minDegree - 1, poly.maxDegree - 1, ddxCoefs, poly.variable );
	},

	// doesn't multiply coefficients
	ddxPolynomialWrong4: function( poly ) {
		var ddxCoefs = [];
		
		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i - 1] = poly.coefs[i];
		}
		
		return new KhanUtil.Polynomial( poly.minDegree - 1, poly.maxDegree - 1, ddxCoefs, poly.variable );
	},

	// original with flipped signs
	ddxPolynomialWrong5: function( poly ) {
		var ddxCoefs = [];
		
		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i] = poly.coefs[i] * -1;
		}
		
		return new KhanUtil.Polynomial( poly.minDegree, poly.maxDegree, ddxCoefs, poly.variable );
	},

	funcNotation: function( variable ) {
		if (!variable) {
			variable = "x";
		}
		
		var notations = [
			["y", "\\frac{dy}{d"+variable+"}"],
			["f("+variable+")", "f'("+variable+")"],
			["g("+variable+")", "g'("+variable+")"],
			["y", "y'"],
			["f("+variable+")", "\\frac{d}{d"+variable+"} f("+variable+")"],
			["a", "a'"],
			["a", "\\frac{da}{d"+variable+"}"]
		];
		var n_idx = KhanUtil.rand( notations.length );
		return {
			f: notations[n_idx][0],
			ddxF: notations[n_idx][1]
		};
	},

	CalcFunctions: [
		function( variable ) {
			// power rule, polynomials
			var maxDegree = KhanUtil.randRange(2, 4);
			var minDegree = KhanUtil.randRange(-2, 2);
			var coefs = KhanUtil.randCoefs(minDegree, maxDegree);
			
			var poly = new KhanUtil.Polynomial(minDegree, maxDegree, coefs, variable);
			
			this.f = poly.expr();
			this.ddxF = KhanUtil.ddxPolynomial(poly).expr();

			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );

			this.wrongs = [
				KhanUtil.ddxPolynomialWrong1(poly).expr(),
				KhanUtil.ddxPolynomialWrong2(poly).expr(),
				KhanUtil.ddxPolynomialWrong3(poly).expr(),
				KhanUtil.ddxPolynomialWrong4(poly).expr(),
				KhanUtil.ddxPolynomialWrong5(poly).expr()
			];

			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});

			return this;
		},

		function( variable ) {
			// random trig func
			var idx = KhanUtil.rand(3); // 0 - 2 in trig funcs

			this.wrongs = [];
			
			this.wrongs[0] = ["sin", variable];
			this.wrongs[1] = ["csc", variable];
			this.wrongs[2] = ["sec", variable];
			this.wrongs[3] = ["tan", variable];
			this.wrongs[4] = ["-", ["sec", variable]];
			this.wrongs[5] = ["-", ["cos", variable]];
			
			this.f = [ KhanUtil.trigFuncs[idx], variable ];
			this.ddxF = KhanUtil.ddxTrigFuncs[ KhanUtil.trigFuncs[idx] ](variable);

			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );
			
			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});

			return this;
		},

		function( variable ) {
			// basic x^power, simplified version of polynomials in [0]
			// kept KhanUtil around mainly for easy wrong answer generation
			var maxDegree = KhanUtil.randRange(2, 6);
			var minDegree = maxDegree;
			
			var coefs = [];
			coefs[maxDegree] = 1;

			var poly = new KhanUtil.Polynomial(minDegree, maxDegree, coefs, variable);
			
			this.f = poly.expr();
			this.ddxF = KhanUtil.ddxPolynomial(poly).expr();
			
			this.wrongs = [
				KhanUtil.ddxPolynomialWrong1(poly).expr(),
				KhanUtil.ddxPolynomialWrong2(poly).expr(),
				KhanUtil.ddxPolynomialWrong3(poly).expr(),
				KhanUtil.ddxPolynomialWrong4(poly).expr(),
				KhanUtil.ddxPolynomialWrong5(poly).expr()
			];

			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );
			
			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});

			return this;
		},

		function( variable ) {
			// ln x and e^x, combined in one because these should not be too likely
			this.wrongs = [];

			if (KhanUtil.rand(2)) {
				this.wrongs[0] = ["frac", 1, ["ln", variable]];
				this.wrongs[1] = ["^", "e", variable];
				this.wrongs[2] = ["frac", 1, ["^", "e", variable]];
				this.wrongs[3] = ["ln", variable];
				this.wrongs[4] = ["frac", 1, ["^", variable, 2]];
				this.wrongs[5] = variable;

				this.f = ["ln", variable];
				this.ddxF = ["frac", 1, variable];
			} else {
				this.wrongs[0] = ["*", variable, ["^", "e", ["-", variable, 1]]];
				this.wrongs[1] = ["frac", 1, variable];
				this.wrongs[2] = ["*", variable, ["^", "e", variable]];
				this.wrongs[3] = ["^", "e", ["-", variable, 1]];
				this.wrongs[4] = ["^", ["-", "e", variable], variable];
				this.wrongs[5] = ["frac", "e", variable];
				
				this.f = ["^", "e", variable];
				this.ddxF = ["^", "e", variable];
			}

			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );
			
			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});
			
			return this;
		} ]
});
