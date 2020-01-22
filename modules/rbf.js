'use strict';

const norm = (x, y) => {return Math.sqrt(x*x + y*y) };

function fastexp(x) {
  if (Math.abs(x) < 0.0001) {
    return 1.0;
  }
  else {
    x = 1.0 + x / 256.0;
    x *= x; x *= x; x *= x; x *= x; x *= x; x *= x; x *= x; x *= x;
    return x;
  }
}

const fastgauss = (r,gamma) => { return fastexp(-Math.pow(r/gamma,2)) };
const gauss = (r,gamma) => { return Math.exp(-Math.pow(r/gamma,2)) };
const inverse_quadratic = (r,gamma) => { return 1/(1 + Math.pow(gamma+r,2)) };
const inverse_multiquadratic = (r,gamma) => { return 1/(Math.sqrt(gamma+r)) };
const multiquadratic = (r,gamma) => { return Math.sqrt(1 + Math.pow(r*gamma,2)) }; // Not working
const thin_plate_spline = (r,gamma) => { return r * Math.log(r) }; // Not working
const polyharmonic_spline = (r,gamma) => { return Math.pow(r,3) };

var radialfunctions = {
  'fastgauss' : fastgauss,
  'gauss' : gauss,
  'inverse_quadratic' : inverse_quadratic,
  'inverse_multiquadratic' : inverse_multiquadratic,
  'multiquadratic' : multiquadratic,
  'thin_plate_spline' : thin_plate_spline,
  'polyharmonic_spline' : polyharmonic_spline
};

// Compute Cholesky decomposition and return L
function cholesky(A) {
	const n = A.length;
	const L = new Array(n);
	for (let i = 0; i < n; ++i) {
		L[i] = new Array(n);
		for (let k = i; k < n; ++k) L[i][k] = 0;
		for (let j = 0; j < (i+1); ++j) {
			let s = 0
			for (let m = 0; m < j; m++) s += L[i][m] * L[j][m];
			L[i][j] = (i == j) ?
				L[i][j] = Math.sqrt(A[i][i] - s) : L[i][j] = (1.0/L[j][j]*(A[i][j] - s));
		}
	}
	return L;
}

// Transpose square matrix
function transpose(A) {
  let n = A.length;
  let B = new Array(n);
  for (let i = 0; i < n; ++i) {
    B[i] = new Array(n);
    for (let j = 0; j < n; ++j) {
      B[i][j] = A[j][i];
    }
  }
  return B;
}

// Solve linear system of n equations for n unknown
// Uses Cholesky decomposition (requires positive definite matrix)
// followed by forward substitution and backward substitution.

function solve(A, b) {
	let L = cholesky(A);
  // Forward substitution
  let n = L.length;
  let y = new Array(n);
  y[0] = b[0]/L[0][0];
  for (let i = 1; i < n; ++i) {
    let s = b[i];
    for (let j = 0; j < i; ++j) {
      s -= L[i][j] * y[j];
    }
      y[i] = s/L[i][i];
  }

  const LL = transpose(L);

  // Backward substitution
  let x = new Array(n);
  x[n-1] = y[n-1]/LL[n-1][n-1];
  for (let i = (n-1); i >= 0; --i) {
    let s = y[i];
    for (let j = (n-1); j > i; --j) {
      s -= LL[i][j] * x[j];
    }
    x[i] = s/LL[i][i];
  }
  return x;
}

function avgdist(x,y) {
  const len = x.length;
  var dist = 0;
  for (let i = 0; i < len-1; ++i) {
    dist += norm(x[i] - x[i+1], y[i] - y[i+1]);
  }
  return dist/(len);
}

function rbf_interp(x, y, f, w, func) {

  let rbf = radialfunctions[func];
  let gamma = avgdist(x,y);
  const n = x.length;
  const A = new Array(n);
  for (let i = 0; i < n; ++i) {
    A[i] = new Array(n);
    for (let j = 0; j < n; ++j) {
      A[i][j] = rbf( norm(x[j]-x[i], y[j]-y[i]), gamma);
    }
  }
  const soln = solve(A, f);
  const S = new Array(w);
    for (let i = 0; i < w; ++i) {
      S[i] = new Array(w);
      for (let o = 0; o < w; ++o) S[i][o] = 0;
      for (let k = 0; k < x.length; k++) {
        for (let j = 0; j < w; ++j) {
          S[i][j] += soln[k]*rbf( norm(i-x[k], j-y[k]), gamma);
        }
    }
  }

  return S;
}

export {rbf_interp};
