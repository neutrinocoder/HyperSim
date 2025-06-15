// --- BASE ANIMAL CLASS ---
class Animal {
    constructor(x, y, gender) {
        this.position = createVector(x, y); this.velocity = p5.Vector.random2D(); this.acceleration = createVector(); this.gender = gender; this.foodEaten = 0;
    }
    seek(target) { let desired = p5.Vector.sub(target.position, this.position); desired.setMag(this.maxSpeed); return p5.Vector.sub(desired, this.velocity).limit(this.maxForce); }
    flee(target) { return this.seek(target).mult(-1.5); }
    applyBehaviors(preyQT, predatorQT, mates) {
         let searchArea = new Rectangle(this.position.x, this.position.y, this.searchRadius, this.searchRadius);
         let predatorsNearby = predatorQT ? predatorQT.query(searchArea) : [];
         if (predatorsNearby.length > 0) { this.acceleration.add(this.flee(predatorsNearby[0].userData)); }
         else if (this.foodEaten > 0 && mates.length > 0) { this.acceleration.add(this.seek(mates[0])); }
         else { let preyNearby = preyQT ? preyQT.query(searchArea) : []; if(preyNearby.length > 0) { this.acceleration.add(this.seek(preyNearby[0].userData)); } }
    }
    update() { this.velocity.add(this.acceleration); this.velocity.limit(this.maxSpeed); this.position.add(this.velocity); this.acceleration.mult(0); this.boundaries(); }
    boundaries() { if (this.position.x < 0) this.position.x = width; if (this.position.x > width) this.position.x = 0; if (this.position.y < 0) this.position.y = height; if (this.position.y > height) this.position.y = 0; }
}
