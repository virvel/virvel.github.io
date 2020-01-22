export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	dist(b) {
		return Math.pow(this.x - b.x, 2) + Math.pow(this.y - b.y, 2);
	}
}

export function quickSortPt(list, pt) {
	if (list.length < 2) {
		return list;
	}
	let mid = pt.dist(list[Math.round(list.length/2)][0]);
	return 	quickSortPt (list.filter(x => x[0].dist(pt) < mid), pt)
				.concat (list.filter(x => x[0].dist(pt) == mid) )
	.concat (quickSortPt(list.filter(x => x[0].dist(pt) > mid), pt));
}

export function scale(x, a1, a2, b1, b2) {
  return clip((b2-b1)*(x-a1)/(a2-a1) + b1, Math.min(b1,b2), Math.max(b1,b2));
}

export function clip(x, min, max) {
  return Math.max(Math.min(x, max),min);
}