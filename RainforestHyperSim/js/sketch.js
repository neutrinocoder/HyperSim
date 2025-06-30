// --- Global Simulation State ---
let isSimulating = false, isPaused = false;
let dayCounter = 0, dayStartTime, pauseEndTime;
let populations = { trees: [], butterflies: [], frogs: [], snakes: [], hawks: [] };
let simMode = 'normal'; // 'normal' or 'hyper'
let dayLengthMillis = 10000;
let hyperSimTotalDays = 0;

function setup() {
    // --- CORRECTED CANVAS SIZING ---
    let canvasContainer = select('#canvas-container');
    // Use .elt.offsetWidth to get the HTML element's actual width
    let canvasWidth = canvasContainer.elt.offsetWidth; 
    let canvasHeight = windowHeight * 0.5; // Keep height relative to window
    
    // Fallback if the container has no width initiallylet isSimulating=false,dayCounter=0,dayStartTime,populations={plants:[],butterflies:[],frogs:[],snakes:[],hawks:[]},simMode='normal',dayLengthMillis=10000,speedMultiplier=1,showStatusBars=false,weeklyHistory=[],ponds=[],backgroundTrees=[],riverPoints=[];
let worldWidth, worldHeight;
let camera = { x: 0, y: 0, zoom: 1 };
let panStart = { x: 0, y: 0 };
let isPanning = false;
let shouldDownloadCSV = true;

function setWorldSize() {
    const size = document.getElementById('map-size-select').value;
    if(size === 'small') { worldWidth = 1200; worldHeight = 800; }
    else if(size === 'large') { worldWidth = 2400; worldHeight = 1600; }
    else { worldWidth = 1800; worldHeight = 1200; }
    camera.x = worldWidth / 2;
    camera.y = worldHeight / 2;
}

function getSafeSpawnPoint() {
    let point, attempts = 0;
    do {
        point = createVector(random(worldWidth), random(worldHeight));
        attempts++;
    } while (isPosInWater(point, 15) && attempts < 100); 
    return point;
}

function isPosInWater(pos, buffer = 0) {
    for(const pond of ponds){if(pos.dist(pond.position)<pond.size.x/2 + buffer)return!0;}
    return!1;
}

function screenToWorld(x, y) { return { x: (x - width / 2) / camera.zoom + camera.x, y: (y - height / 2) / camera.zoom + camera.y }; }
function generateEnvironment() {
    let numPonds, numTrees;
    noiseSeed(millis());
    
    if (worldWidth === 1200) { numPonds = floor(random(1, 2)); }
    else if (worldWidth === 2400) { numPonds = floor(random(1, 4)); }
    else { numPonds = floor(random(1, 3)); }
    
    ponds = []; for(let i=0; i<numPonds; i++) {
        let p = { position: getSafeSpawnPoint(), size: {x: random(40,100), y: random(30,60)}, vertices: [] };
        let yoff_pond = random(100);
        for (let angle = 0; angle < TWO_PI; angle += 0.5) { let r = map(noise(yoff_pond), 0, 1, 0.8, 1.2); p.vertices.push(createVector(cos(angle) * (p.size.x/2 * r), sin(angle) * (p.size.y/2 * r))); yoff_pond += 0.2; }
        ponds.push(p);
    }
    backgroundTrees = []; let spacing = 75;
    for (let x = 0; x < worldWidth + spacing; x += spacing) {
        for (let y = 0; y < worldHeight + spacing; y += spacing) {
            let pos = createVector(x + random(-spacing/2, spacing/2), y + random(-spacing/2, spacing/2));
            if (!isPosInWater(pos, 20)) { 
                backgroundTrees.push({position: pos, size: random(20,40), color: color(0,random(80,120),0)});
            }
        }
    }
}

function drawEnvironment() {
    ponds.forEach(p => { 
        push();
        translate(p.position.x, p.position.y);
        fill(65,105,225); noStroke();
        beginShape(); for (const v of p.vertices) vertex(v.x, v.y); endShape(CLOSE);
        pop();
    });

    backgroundTrees.forEach(t => { noStroke(); fill(t.color); ellipse(t.position.x, t.position.y, t.size); });
}

function setup() {
    let canvasContainer = select('#canvas-container'); let canvas = createCanvas(canvasContainer.width, 500); canvas.parent('canvas-container');
    let canvasEl = document.querySelector('#canvas-container canvas');
    canvasEl.addEventListener('mousedown', (e) => { isPanning=true; panStart.x = e.clientX; panStart.y = e.clientY; });
    canvasEl.addEventListener('mousemove', (e) => { if(isPanning){ camera.x -= (e.clientX-panStart.x)/camera.zoom; camera.y -= (e.clientY-panStart.y)/camera.zoom; panStart.x=e.clientX; panStart.y=e.clientY; }});
    canvasEl.addEventListener('mouseup', () => { isPanning = false; });
    canvasEl.addEventListener('mouseout', () => { isPanning = false; });
    canvasEl.addEventListener('wheel', (e) => { e.preventDefault(); let zoomFactor=0.001; let oldZoom=camera.zoom; camera.zoom -= e.deltaY * zoomFactor; camera.zoom = constrain(camera.zoom, 0.1, 5); let m=screenToWorld(mouseX,mouseY); camera.x = m.x + (camera.x - m.x) * (oldZoom/camera.zoom); camera.y = m.y + (camera.y - m.y) * (oldZoom/camera.zoom); });
    
    initializeUI(); updateControlsView(); noLoop();
}

function draw() {
    background(10, 50, 10);
    
    translate(width/2, height/2); scale(camera.zoom); translate(-camera.x, -camera.y);
    
    noFill(); stroke(100); strokeWeight(2/camera.zoom); rect(0,0,worldWidth,worldHeight);
    drawEnvironment();
    
    if(isSimulating) {
        if (simMode === 'normal') {
            runSimulationStep(); 
            const timeElapsed = millis() - dayStartTime;
            if (timeElapsed > dayLengthMillis) { handleInteractions(); endOfDay(); dayStartTime = millis(); }
        } else { 
            const totalDays = parseInt(document.getElementById('years-input').value) * 365;
            for(let i=0; i < 10; i++) {
                if(dayCounter >= totalDays || !isSimulating) { if(isSimulating) toggleSimulation(); break; }
                runSimulationStep(); handleInteractions(); endOfDay();
            }
        }
    }
    
    Object.values(populations).flat().forEach(o=>o.display());
    updateInfoDisplay();
}

function windowResized() { resizeCanvas(select('#canvas-container').width, 500); }

    if (canvasWidth <= 0) {
        canvasWidth = windowWidth * 0.9; 
    }

    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');

    // **CRITICAL FIX**: Initialize UI from here, after p5.js is ready.
    initializeUI();
    updateControlsView();
    noLoop(); // Wait for user to press start
}

function draw() {
    background('#87ceeb');
    
    if(!isSimulating) {
        // If not simulating, just draw the last state and do nothing else.
        Object.values(populations).flat().forEach(o => o.display());
        return;
    }

    if (simMode === 'normal') {
        const timeElapsed = millis() - dayStartTime;
        if(!isPaused && timeElapsed > dayLengthMillis) { 
            isPaused=true; 
            pauseEndTime=millis()+1500; 
            endOfDay(); 
        }
        if(isPaused && millis() > pauseEndTime) { 
            dayCounter++; 
            dayStartTime=millis(); 
            isPaused=false; 
        }
        if(!isPaused) {
            runSimulationStep();
        }
    } else { // Hyper mode
         hyperSimTotalDays = int(yearsInput.value()) * 365;
         let daysPerFrame = 10;
         for(let i=0; i<daysPerFrame; i++) {
             if(dayCounter > hyperSimTotalDays || !isSimulating) { 
                 if(isSimulating) toggleSimulation(); 
                 break; 
             }
             runSimulationStep(false); // don't update behaviors for every single step in hyper
             endOfDay(); 
             dayCounter++;
         }
    }
    
    // Always draw in normal mode, or the final state in hyper mode when it stops
    if (simMode === 'normal' || !isSimulating) {
        Object.values(populations).flat().forEach(o => o.display());
    }

    // Only show the "Day X Ended" pause message if the sim is paused AND still running.
    if(isPaused && isSimulating) { 
        fill(255,200);
        rectMode(CENTER);
        rect(width/2,height/2,450,100,10);
        fill(0);textAlign(CENTER,CENTER);
        textSize(24);
        text(`Day ${dayCounter} Ended`,width/2,height/2);
    }
    updateInfoDisplay();
}

function windowResized() {
    let canvasContainer = select('#canvas-container');
    let canvasWidth = canvasContainer.elt.offsetWidth;
    let canvasHeight = windowHeight * 0.5;
    resizeCanvas(canvasWidth, canvasHeight);
}
