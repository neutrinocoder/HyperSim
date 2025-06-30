let initialInputs = {};
function initializeUI() {
    document.getElementById('main-button').addEventListener('click', toggleSimulation);
    document.getElementById('mode-toggle').addEventListener('change', (e) => { simMode=e.target.checked?'hyper':'normal'; updateControlsView(); });
    document.getElementById('day-length-slider').addEventListener('input', (e) => { dayLengthMillis=e.target.value*1000; document.getElementById('day-length-value').innerHTML=e.target.value; speedMultiplier=10/e.target.value; });
    speedMultiplier=10/document.getElementById('day-length-slider').value;
    document.getElementById('status-toggle').addEventListener('click', (e) => { showStatusBars=!showStatusBars; e.target.classList.toggle('active',showStatusBars); e.target.innerHTML=showStatusBars?'Hide Status':'Show Status'; });
    document.getElementById('trees-toggle').addEventListener('click', (e) => { showBgTrees=!showBgTrees; e.target.classList.toggle('active',showBgTrees); e.target.innerHTML=showBgTrees?'Hide Trees':'Show Trees'; });
    document.getElementById('download-toggle').addEventListener('click', (e) => { shouldDownloadCSV=!shouldDownloadCSV; e.target.classList.toggle('active',shouldDownloadCSV); e.target.innerHTML = shouldDownloadCSV ? 'Download on Collapse' : 'No Download';});
    initialInputs={plants:document.getElementById('initial-plants'),butterflies:document.getElementById('initial-butterflies'),frogs:document.getElementById('initial-frogs'),snakes:document.getElementById('initial-snakes'),hawks:document.getElementById('initial-hawks')};
}

function updateControlsView() {
    const normalEl=document.getElementById('normal-controls'),hyperEl=document.getElementById('hyper-controls');
    if (simMode==='hyper'){normalEl.classList.add('hidden');hyperEl.classList.remove('hidden');}else{normalEl.classList.remove('hidden');hyperEl.classList.add('hidden');}
}

function updateInfoDisplay() {
    const infoEl=document.getElementById('info-display'); if(!infoEl)return; if(!isSimulating&&infoEl.innerHTML.includes("collapsed"))return;
    let p=populations,counts=`🌿:${p.plants.length} | 🦋:${p.butterflies.length} | 🐸:${p.frogs.length} | 🐍:${p.snakes.length} | 🦅:${p.hawks.length}`;
    if(simMode==='hyper'&&isSimulating){const total=parseInt(document.getElementById('years-input').value)*365;infoEl.innerHTML=`Simulating Day: ${dayCounter}/${total} | ${counts}`;}else{infoEl.innerHTML=`Day: ${dayCounter} | ${counts}`;}}

function exportHistoryToCSV() {
    let csv="data:text/csv;charset=utf-8,Week,Butterflies,Frogs,Snakes,Hawks\n";
    weeklyHistory.forEach(r=>{csv+=`${r.week},${r.butterflies},${r.frogs},${r.snakes},${r.hawks}\n`;});
    const link=document.createElement("a");link.setAttribute("href",encodeURI(csv));link.setAttribute("download","population_history.csv");document.body.appendChild(link);link.click();document.body.removeChild(link);
}
