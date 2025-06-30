class Animal {
    constructor(x, y, gender) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector();
        this.gender = gender;
        this.hunger = 0; this.matingUrge = 0; this.panic = 0;
        this.wanderTheta = random(TWO_PI);
        this.timeSpentHiding = 0;
        this.age = 0; 
        this.daysWithoutFood = 0;
    }

    isHungry() { return this.hunger > this.hungerThreshold; }
    isReadyToMate() { return this.matingUrge >= 100; }
    isHiding() { return this.timeSpentHiding > 0; }

    seek(targetVector, multiplier = 1) { let desired=p5.Vector.sub(targetVector,this.position); desired.setMag(this.maxSpeed * multiplier); return p5.Vector.sub(desired,this.velocity).limit(this.maxForce * multiplier); }
    flee(targetVector, multiplier = 1.5) { return this.seek(targetVector).mult(-multiplier); }
    wander() {
        let wanderPoint = this.velocity.copy(); wanderPoint.setMag(100); wanderPoint.add(this.position);
        let wanderRadius = 50, theta = this.wanderTheta + this.velocity.heading();
        let x = wanderRadius * cos(theta), y = wanderRadius * sin(theta);
        wanderPoint.add(x, y);
        let steer = p5.Vector.sub(wanderPoint, this.position); steer.setMag(this.maxForce);
        this.acceleration.add(steer); this.wanderTheta += random(-0.5, 0.5);
    }
    findClosest(qtree) {
        if (!qtree) return null;
        let searchArea = new Rectangle(this.position.x, this.position.y, this.searchRadius, this.searchRadius);
        let nearby = qtree.query(searchArea);
        let closest = null, closestDist = Infinity;
        for (let p of nearby) { let d=this.position.dist(p.userData.position); if (d < closestDist){closestDist=d; closest=p.userData;}}
        return closest;
    }
    
    applyBehaviors(preyQT, predatorQT, mates, hidingSpotsQT) {
         let closestPredator = this.findClosest(predatorQT);
         if (closestPredator) {
            let d = this.position.dist(closestPredator.position);
            this.panic = map(d, 0, this.searchRadius, 100, 20);
            this.timeSpentHiding++;

            let closestHidingSpot = this.findClosest(hidingSpotsQT);
            if (closestHidingSpot && this.timeSpentHiding < 120) { 
                this.acceleration.add(this.seek(closestHidingSpot.position));
            } else {
                this.acceleration.add(this.flee(closestPredator.position, map(this.panic,0,100,1,2.5)));
            }
         } else {
            this.panic = 0;
            this.timeSpentHiding = 0;
            
            if (this.isHungry()) { let target = this.findClosest(preyQT); if(target) this.acceleration.add(this.seek(target.position)); else this.wander(); }
            else if (this.isReadyToMate() && mates.length > 0) { this.acceleration.add(this.seek(mates[0].position)); }
            else { this.wander(); }
         }
    }
    
    updateStats() { 
        this.age++;
        this.hunger=min(100, this.hunger + this.hungerRate); 
        if (!this.isHungry()) {
            this.matingUrge = min(100, this.matingUrge + 5); 
            this.daysWithoutFood = 0;
        } else {
            this.daysWithoutFood++;
        }
    }
    update() { this.maxSpeed=this.baseMaxSpeed*speedMultiplier; this.maxForce=this.baseMaxForce*speedMultiplier; this.velocity.add(this.acceleration); this.velocity.limit(this.maxSpeed); this.position.add(this.velocity); this.acceleration.mult(0); this.boundaries(); }
    boundaries() { if (this.position.x < 0) this.position.x = worldWidth; if (this.position.x > worldWidth) this.position.x = 0; if (this.position.y < 0) this.position.y = worldHeight; if (this.position.y > worldHeight) this.position.y = 0; }
    
    displayState() {
        if (!showStatusBars) return;
        const barWidth = 25, barHeight = 4, spacing = 1;
        const x = this.position.x - barWidth / 2, y = this.position.y - this.size - (barHeight + spacing) * 3 - 2;
        const drawBar = (value, color, yOffset) => { push(); fill(50); noStroke(); rect(x,y+yOffset,barWidth,barHeight,1); let w=map(value,0,100,0,barWidth); fill(color); rect(x,y+yOffset,w,barHeight,1); pop(); };
        drawBar(this.panic, color(255,0,0), 0);
        drawBar(this.matingUrge, color(255,105,180), barHeight + spacing);
        drawBar(this.hunger, color(255,165,0), (barHeight + spacing) * 2);
    }
    displayHoverStats() {
        let m = screenToWorld(mouseX, mouseY);
        if (showStatusBars && dist(m.x, m.y, this.position.x, this.position.y) < this.size + 10) {
            push();
            fill(0,0,0,150); noStroke(); rect(this.position.x+15,this.position.y-30,80,45,5);
            fill(255); textSize(10); textAlign(LEFT, TOP);
            text(`P: ${floor(this.panic)}`, this.position.x+20, this.position.y-28);
            text(`M: ${floor(this.matingUrge)}`, this.position.x+20, this.position.y-18);
            text(`H: ${floor(this.hunger)}`, this.position.x+20, this.position.y-8);
            pop();
        }
    }
}
