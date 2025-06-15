// --- Global UI Element Variables ---
// We only DECLARE the variables here. They will be assigned values in sketch.js
let mainButton, infoDisplay, normalControls, hyperControls, modeToggle, dayLengthSlider, dayLengthValue, yearsInput;
let initialInputs = {};

// This function will be called from setup() in sketch.js
function initializeUI() {
    mainButton = select('#main-button');
    infoDisplay = select('#info-display');
    normalControls = select('#normal-controls');
    hyperControls = select('#hyper-controls');
    modeToggle = select('#mode-toggle');
    dayLengthSlider = select('#day-length-slider');
    dayLengthValue = select('#day-length-value');
    yearsInput = select('#years-input');
    
    initialInputs = {
        trees: select('#initial-trees'), butterflies: select('#initial-butterflies'), frogs: select('#initial-frogs'), snakes: select('#initial-snakes'), hawks: select('#initial-hawks')
    };
    
    mainButton.mousePressed(toggleSimulation);
    modeToggle.changed(() => { simMode = modeToggle.elt.checked ? 'hyper' : 'normal'; updateControlsView(); });
    dayLengthSlider.input(() => { dayLengthMillis = dayLengthSlider.value() * 1000; dayLengthValue.html(dayLengthSlider.value()); });
}

function updateControlsView() {
    if (simMode === 'hyper') {
        normalControls.addClass('hidden');
        hyperControls.removeClass('hidden');
    } else {
        normalControls.removeClass('hidden');
        hyperControls.addClass('hidden');
    }
}

function updateInfoDisplay() {
    if (!infoDisplay) return;
    // Don't update the info display if the simulation has stopped due to extinction
    if (!isSimulating && infoDisplay.html().includes("collapsed")) {
        return;
    }
    let p = populations;
    let counts = `🌳:${p.trees.length} | 🦋:${p.butterflies.length} | 🐸:${p.frogs.length} | 🐍:${p.snakes.length} | 🦅:${p.hawks.length}`;
    if(simMode === 'hyper' && isSimulating) {
        infoDisplay.html(`Simulating Day: ${dayCounter} / ${hyperSimTotalDays} | ${counts}`);
    } else {
        infoDisplay.html(`Day: ${dayCounter} | ${counts}`);
    }
}
