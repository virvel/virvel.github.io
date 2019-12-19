export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	dist(b) {
		return Math.pow(this.x - b.x,2) + Math.pow(this.y - b.y,2);
	}
}

export function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}


export function quickSortPt(list, pt) {
	if (list.length < 2) {
		return list;
	}
	let mid = pt.dist(list[Math.round(list.length/2)]);

	return 	quickSortPt(list.filter(x => pt.dist(x) < mid), pt)
				.concat(list.filter(x => pt.dist(x) == mid))
	.concat(quickSortPt(list.filter(x => pt.dist(x) > mid),pt));
}

// functional
export const reduce = ((xs, f, id) => xs.length == 0 ? id : f(xs[0], reduce(xs.slice(1), f, id)));
export const cumsum = (xs => reduce(xs, add, 0));
// helpers
export const add = ((x,y) => x+y);

