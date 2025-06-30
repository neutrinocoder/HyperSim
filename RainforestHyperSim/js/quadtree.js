class Point { constructor(x, y, userData) { this.x = x; this.y = y; this.userData = userData; } }
class Rectangle {
    constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; }
    contains(point) { return (point.x >= this.x - this.w && point.x <= this.x + this.w && point.y >= this.y - this.h && point.y <= this.y + this.h); }
    intersects(range) { return !(range.x - range.w > this.x + this.w || range.x + range.w < this.x - this.w || range.y - range.h > this.y + this.h || range.y + range.h < this.y - this.h); }
}
class QuadTree {
    constructor(boundary, capacity) { this.boundary = boundary; this.capacity = capacity; this.points = []; this.divided = false; }
    subdivide() {
        let { x, y, w, h } = this.boundary;
        let hw = w / 2, hh = h / 2;
        this.northeast = new QuadTree(new Rectangle(x + hw, y - hh, hw, hh), this.capacity); this.northwest = new QuadTree(new Rectangle(x - hw, y - hh, hw, hh), this.capacity);
        this.southeast = new QuadTree(new Rectangle(x + hw, y + hh, hw, hh), this.capacity); this.southwest = new QuadTree(new Rectangle(x - hw, y + hh, hw, hh), this.capacity);
        this.divided = true;
    }
    insert(point) {
        if (!this.boundary.contains(point)) return false;
        if (this.points.length < this.capacity) { this.points.push(point); return true; }
        if (!this.divided) this.subdivide();
        return this.northeast.insert(point) || this.northwest.insert(point) || this.southeast.insert(point) || this.southwest.insert(point);
    }
    query(range, found = []) {
        if (!this.boundary.intersects(range)) return found;
        for (let p of this.points) { if (range.contains(p)) found.push(p); }
        if (this.divided) { this.northwest.query(range, found); this.northeast.query(range, found); this.southwest.query(range, found); this.southeast.query(range, found); }
        return found;
    }
}
