function toggleSimulation() { isSimulating = !isSimulating; if(isSimulating) { document.getElementById('main-button').innerHTML = 'Stop Simulation'; resetSimulation(); loop(); } else { document.getElementById('main-button').innerHTML = 'Start Simulation'; noLoop(); } }
function resetSimulation() {
    dayCounter=0; dayStartTime=millis(); weeklyHistory=[];
    setWorldSize();
    populations = { plants:[], butterflies:[], frogs:[], snakes:[], hawks:[] };
    const createPopulation=(arr,Cls,count)=>{for(let i=0;i<count;i++){let pos=getSafeSpawnPoint();arr.push(new Cls(pos.x,pos.y,i%2===0?'male':'female'));}};
    createPopulation(populations.plants,Plant,parseInt(initialInputs.plants.value));
    createPopulation(populations.butterflies,Butterfly,parseInt(initialInputs.butterflies.value));
    createPopulation(populations.frogs,Frog,parseInt(initialInputs.frogs.value));
    createPopulation(populations.snakes,Snake,parseInt(initialInputs.snakes.value));
    createPopulation(populations.hawks,Hawk,parseInt(initialInputs.hawks.value));
    generateEnvironment();
}
function runSimulationStep() {
    let qTrees = { hidingSpots: new QuadTree(new Rectangle(worldWidth/2,worldHeight/2,worldWidth/2,worldHeight/2), 4) };
    for (const item of backgroundTrees) qTrees.hidingSpots.insert(new Point(item.position.x, item.position.y, item));
    for (const key in populations) { qTrees[key] = new QuadTree(new Rectangle(worldWidth/2,worldHeight/2,worldWidth/2,worldHeight/2), 4); for(const item of populations[key]) qTrees[key].insert(new Point(item.position.x, item.position.y, item)); }
    const findMates = (arr,self) => arr.filter(a => a.gender!==self.gender && a.isReadyToMate());
    populations.butterflies.forEach(o => {o.applyBehaviors(qTrees.plants, qTrees.frogs, findMates(populations.butterflies,o), qTrees.hidingSpots); o.update();});
    populations.frogs.forEach(o => {o.applyBehaviors(qTrees.butterflies, qTrees.snakes, findMates(populations.frogs,o), qTrees.hidingSpots); o.update();});
    populations.snakes.forEach(o => {o.applyBehaviors(qTrees.frogs, qTrees.hawks, findMates(populations.snakes,o), qTrees.hidingSpots); o.update();});
    populations.hawks.forEach(o => {o.applyBehaviors(qTrees.snakes, null, findMates(populations.hawks,o), qTrees.hidingSpots); o.update();});
}
function handleInteractions() {
    const predation = (predators, prey) => { 
        for(let i=predators.length-1;i>=0;i--){
            if(!predators[i].isHungry()||predators[i].isHiding()) continue;
            for(let j=prey.length-1;j>=0;j--){
                if(predators[i].position.dist(prey[j].position)<(predators[i].size+prey[j].size)/2){
                    prey.splice(j,1);
                    predators[i].eat();
                    break; 
                }
            }
        }
    };
    predation(populations.butterflies, populations.plants);
    predation(populations.frogs, populations.butterflies);
    predation(populations.snakes, populations.frogs);
    predation(populations.hawks, populations.snakes);
}
function endOfDay() {
    dayCounter++;
    
    for (const key in populations) {
        if (key === 'plants') continue;
        for (let i = populations[key].length - 1; i >= 0; i--) {
            const animal = populations[key][i];
            if (animal.updateStats) animal.updateStats();
            if (animal.age > animal.maxAge || (animal.maxDaysWithoutFood && animal.daysWithoutFood > animal.maxDaysWithoutFood)) {
                populations[key].splice(i, 1);
            }
        }
    }

    const reproduce = (arr,Cls) => { let newBabies=[],males=arr.filter(a=>a.gender==='male'&&a.isReadyToMate()),females=arr.filter(a=>a.gender==='female'&&a.isReadyToMate()),pairings=min(males.length,females.length); for(let i=0;i<pairings;i++){let p1=males[i],p2=females[i];if(p1.position.dist(p2.position)<30){let pos=getSafeSpawnPoint();newBabies.push(new Cls(pos.x,pos.y,random()>.5?'male':'female'));p1.matingUrge=0;p2.matingUrge=0;}} arr.push(...newBabies); };
    reproduce(populations.butterflies,Butterfly); reproduce(populations.frogs,Frog); reproduce(populations.snakes,Snake); reproduce(populations.hawks,Hawk);
    for(let i=0;i<5;i++) populations.plants.push(new Plant(getSafeSpawnPoint().x, getSafeSpawnPoint().y));
    if(dayCounter%30===0 && populations.plants.length>100) populations.plants.splice(0,100);
    if(dayCounter>0 && dayCounter%7===0) weeklyHistory.push({week:dayCounter/7,butterflies:populations.butterflies.length,frogs:populations.frogs.length,snakes:populations.snakes.length,hawks:populations.hawks.length});
    let extinct=null;
    if(populations.butterflies.length===0)extinct="Butterflies";else if(populations.frogs.length===0)extinct="Frogs";else if(populations.snakes.length===0)extinct="Snakes";else if(populations.hawks.length===0)extinct="Hawks";
    if(extinct&&isSimulating){document.getElementById('info-display').innerHTML=`Ecosystem collapsed on Day ${dayCounter}: ${extinct} went extinct.`; if (shouldDownloadCSV) exportHistoryToCSV(); toggleSimulation();}
}
