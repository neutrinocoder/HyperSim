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
    
    // Fallback if the container has no width initially
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
