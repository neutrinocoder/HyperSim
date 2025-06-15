function toggleSimulation() {
    isSimulating = !isSimulating;
    if(isSimulating) {
        mainButton.html('Stop Simulation');
        resetSimulation();
        loop();
    } else {
        mainButton.html('Start Simulation');
        noLoop();
    }
}

function resetSimulation() {
    dayCounter = 0; isPaused = false;
    dayStartTime = millis();
    populations = { trees: [], butterflies: [], frogs: [], snakes: [], hawks: [] };
    const createPopulation = (arr, Cls, count) => { for(let i=0; i<count; i++) arr.push(new Cls(random(width), random(height), i%2===0?'male':'female')); };
    
    // This part depends on UI elements, which are global
    createPopulation(populations.trees, Tree, int(initialInputs.trees.value()));
    createPopulation(populations.butterflies, Butterfly, int(initialInputs.butterflies.value()));
    createPopulation(populations.frogs, Frog, int(initialInputs.frogs.value()));
    createPopulation(populations.snakes, Snake, int(initialInputs.snakes.value()));
    createPopulation(populations.hawks, Hawk, int(initialInputs.hawks.value()));
}

function runSimulationStep(shouldUpdateBehaviors = true) {
    let qTrees = {};
    for (const key in populations) {
        qTrees[key] = new QuadTree(new Rectangle(width / 2, height / 2, width / 2, height / 2), 4);
        for (const item of populations[key]) {
            qTrees[key].insert(new Point(item.position.x, item.position.y, item));
        }
    }

    if (shouldUpdateBehaviors) {
        const findMates = (speciesArray, self) => speciesArray.filter(a => a.gender !== self.gender && a.foodEaten > 0);
        populations.butterflies.forEach(o => { o.applyBehaviors(qTrees.trees, qTrees.frogs, findMates(populations.butterflies, o)); o.update(); });
        populations.frogs.forEach(o => { o.applyBehaviors(qTrees.butterflies, qTrees.snakes, findMates(populations.frogs, o)); o.update(); });
        populations.snakes.forEach(o => { o.applyBehaviors(qTrees.frogs, qTrees.hawks, findMates(populations.snakes, o)); o.update(); });
        populations.hawks.forEach(o => { o.applyBehaviors(qTrees.snakes, null, findMates(populations.hawks, o)); o.update(); });
    }
    
    handleInteractions();
}

function handleInteractions() {
    const predation = (predators, prey) => {
        for(let i = predators.length - 1; i>=0; i--) {
            for(let j = prey.length-1; j>=0; j--) {
                if(predators[i].position.dist(prey[j].position) < (predators[i].size + prey[j].size) / 2) {
                    prey.splice(j,1); predators[i].foodEaten++; return;
                }
            }
        }
    };
    predation(populations.butterflies, populations.trees);
    predation(populations.frogs, populations.butterflies);
    predation(populations.snakes, populations.frogs);
    predation(populations.hawks, populations.snakes);
}

function endOfDay() {
    const reproduce = (speciesArray, SpeciesClass) => {
        const newBabies=[]; let males=speciesArray.filter(a=>a.gender==='male'&&a.foodEaten>0); let females=speciesArray.filter(a=>a.gender==='female'&&a.foodEaten>0);
        let pairings=min(males.length,females.length);
        for(let i=0;i<pairings;i++){ let p1=males[i], p2=females[i]; if(p1.position.dist(p2.position)<30){let pos=p5.Vector.add(p1.position,p2.position).div(2);newBabies.push(new SpeciesClass(pos.x,pos.y,random()>0.5?'male':'female'));}}
        speciesArray.push(...newBabies); speciesArray.forEach(a=>a.foodEaten=0);
    };
    reproduce(populations.butterflies,Butterfly); reproduce(populations.frogs,Frog); reproduce(populations.snakes,Snake); reproduce(populations.hawks,Hawk);
    
    for(let i=0;i<5;i++) populations.trees.push(new Tree(random(width),random(height)));
    if(dayCounter % 30 === 0 && populations.trees.length > 100) { populations.trees.splice(0,100); }
    
    let extinctSpecies = null;
    if (populations.butterflies.length === 0) extinctSpecies = "Butterflies";
    else if (populations.frogs.length === 0) extinctSpecies = "Frogs";
    else if (populations.snakes.length === 0) extinctSpecies = "Snakes";
    else if (populations.hawks.length === 0) extinctSpecies = "Hawks";

    if (extinctSpecies && isSimulating) {
        infoDisplay.html(`Ecosystem collapsed on Day ${dayCounter}: ${extinctSpecies} went extinct.`);
        toggleSimulation(); // This stops the simulation
    }
}
