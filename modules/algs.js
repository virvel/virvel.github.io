export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	dist = (b) => Math.pow(this.x - b.x, 2) + Math.pow(this.y - b.y, 2);
}

export class Queue {
	constructor(n) {
		this.length = n;
		this.queue = new Array();
	}

	enqueue(x) {
		this.queue.push(x);
		if (this.queue.length > this.length)
			this.queue = this.queue.slice(1,this.length+1);
	}

	dequeue(x) {
		if (this.queue.length < 1)
			return [];
		else {
			var pop = this.queue[0];
			this.queue = this.queue.slice(1);
			return pop;
		}
	}
}

export function scale(x, a1, a2, b1, b2) {
  return clip((b2-b1)*(x-a1)/(a2-a1) + b1, Math.min(b1,b2), Math.max(b1,b2));
}

export var clip = (x, min, max) => Math.max(Math.min(x, max),min);

export function fold(x, min, max) {
	if (x > max) {
		return max - x%max;
	}
	else if (x <= min) {
		return min + (-x)%max
	}
	else {
		return x;
	}
}

export function drunk(prev, step) {
	return prev + ((Math.round(Math.random())*2)-1)*step;
}

export var reduce = (f, xs, id) => { return (xs.length < 1) ? id : f(xs[0], reduce(f, xs.slice(1), id))};
export var sum = (xs) => reduce(add, xs, 0);
export var add = (a,b) => Number(a)+Number(b);