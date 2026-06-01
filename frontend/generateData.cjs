const fs = require('fs');

const floors = ['B', 'G', '1', '2', '3', '4', '5'];
const nodes = [];
const edges = [];

// Helper to add nodes
const addNode = (id, label, floor, category, x, y) => {
  nodes.push({ id, label, floor, category, x, y });
};

// Add universal nodes for floors 1-5
['1', '2', '3', '4', '5'].forEach(f => {
  addNode(`elev-main-${f}`, `Main Elevators`, f, 'elevator', 500, 500);
  addNode(`stair-A-${f}`, `Stairwell A`, f, 'stairwell', 200, 500);
  
  // Washrooms
  addNode(`wr-nw-${f}`, `Washroom NW`, f, 'facility', 100, 100);
  addNode(`wr-ne-${f}`, `Washroom NE`, f, 'facility', 900, 100);
  addNode(`wr-sw-${f}`, `Washroom SW`, f, 'facility', 100, 900);
  addNode(`wr-se-${f}`, `Washroom SE`, f, 'facility', 900, 900);
  
  // Water Filters
  addNode(`wf-nw-${f}`, `Water Filter NW`, f, 'facility', 150, 100);
  addNode(`wf-ne-${f}`, `Water Filter NE`, f, 'facility', 850, 100);
  addNode(`wf-sw-${f}`, `Water Filter SW`, f, 'facility', 150, 900);
  addNode(`wf-se-${f}`, `Water Filter SE`, f, 'facility', 850, 900);
});

// Ground & Basement also need elevators/stairs
['B', 'G'].forEach(f => {
  addNode(`elev-main-${f}`, `Main Elevators`, f, 'elevator', 500, 500);
  addNode(`stair-A-${f}`, `Stairwell A`, f, 'stairwell', 200, 500);
});

// Floor B
addNode('cssd', 'CSSD', 'B', 'facility', 300, 300);
addNode('mortuary', 'Mortuary', 'B', 'facility', 700, 300);
addNode('kitchen', 'Main Kitchen', 'B', 'facility', 300, 700);
addNode('laundry', 'Laundry', 'B', 'facility', 700, 700);
addNode('fac-eng', 'Facilities Engineering', 'B', 'facility', 400, 800);
addNode('pharm-supply', 'Central Pharmacy Supply', 'B', 'facility', 600, 800);

// Floor G
addNode('main-entrance', 'Main Entrance', 'G', 'facility', 500, 900);
addNode('er', 'ER & Trauma', 'G', 'clinical', 200, 800);
addNode('amb-bay', 'Ambulance Bay', 'G', 'facility', 100, 800);
addNode('valet', 'Valet Desk', 'G', 'facility', 600, 900);
addNode('main-rec', 'Main Reception', 'G', 'facility', 500, 700);
addNode('pharm-247', '24/7 Pharmacy', 'G', 'facility', 700, 700);
addNode('cafeteria', 'Cafeteria', 'G', 'facility', 800, 500);
addNode('rad', 'Radiology (MRI, CT, X-Ray)', 'G', 'diagnostics', 300, 500);

// Floor 1
addNode('gen-ot', 'General OT', '1', 'clinical', 300, 300);
addNode('neuro-ot', 'Neuro OT', '1', 'clinical', 500, 300);
addNode('cardio-ot', 'Cardio OT', '1', 'clinical', 700, 300);
addNode('pacu', 'PACU', '1', 'clinical', 300, 500);
addNode('micu', 'MICU', '1', 'clinical', 300, 700);
addNode('sicu', 'SICU', '1', 'clinical', 500, 700);
addNode('ccu', 'CCU', '1', 'clinical', 700, 700);
addNode('blood-bank', 'Blood Bank', '1', 'diagnostics', 700, 500);
addNode('cath-lab', 'Cath Lab', '1', 'clinical', 800, 600);

// Floor 2
addNode('maternity', 'Maternity Ward', '2', 'clinical', 300, 400);
addNode('labor', 'Labor & Delivery', '2', 'clinical', 300, 600);
addNode('nicu', 'NICU', '2', 'clinical', 700, 400);
addNode('picu', 'PICU', '2', 'clinical', 700, 600);
addNode('ivf', 'IVF Center', '2', 'clinical', 500, 700);

// Floor 3
addNode('cardiology', 'Cardiology', '3', 'clinical', 300, 400);
addNode('neurology', 'Neurology', '3', 'clinical', 300, 600);
addNode('orthopedics', 'Orthopedics', '3', 'clinical', 700, 400);
addNode('ophthalmology', 'Ophthalmology', '3', 'clinical', 700, 600);
addNode('path-lab', 'Central Pathology Lab', '3', 'diagnostics', 500, 700);

// Floor 4
addNode('ward-m', 'General Ward (Male)', '4', 'clinical', 300, 500);
addNode('ward-f', 'General Ward (Female)', '4', 'clinical', 700, 500);
addNode('physio', 'Physiotherapy', '4', 'clinical', 500, 300);
addNode('onco', 'Oncology Day-Care', '4', 'clinical', 500, 700);
addNode('dialysis', 'Dialysis Unit', '4', 'clinical', 300, 700);

// Floor 5
addNode('vip', 'VIP Suites', '5', 'facility', 300, 300);
addNode('private-rms', 'Private Rooms', '5', 'facility', 700, 300);
addNode('dir-office', 'Hospital Director’s Office', '5', 'facility', 500, 700);
addNode('it-control', 'IT Control Room', '5', 'facility', 300, 700);
addNode('doc-lounge', 'Doctors Lounge', '5', 'facility', 700, 700);

// Add Edges
const addEdge = (n1, n2, weight) => {
  if (nodes.find(n => n.id === n1) && nodes.find(n => n.id === n2)) {
    edges.push({ source: n1, target: n2, weight });
  }
};

// Vertical connections
for (let i = 0; i < floors.length - 1; i++) {
  const f1 = floors[i];
  const f2 = floors[i+1];
  addEdge(`elev-main-${f1}`, `elev-main-${f2}`, 5);
  addEdge(`stair-A-${f1}`, `stair-A-${f2}`, 10);
}

// Floor-level horizontal connections (Basic central hub model connecting to elevators/stairs)
floors.forEach(f => {
  // connect stairs to elevators
  addEdge(`elev-main-${f}`, `stair-A-${f}`, 15);
  
  if (['1','2','3','4','5'].includes(f)) {
    addEdge(`elev-main-${f}`, `wr-nw-${f}`, 30);
    addEdge(`elev-main-${f}`, `wr-ne-${f}`, 30);
    addEdge(`elev-main-${f}`, `wr-sw-${f}`, 30);
    addEdge(`elev-main-${f}`, `wr-se-${f}`, 30);
    addEdge(`wr-nw-${f}`, `wf-nw-${f}`, 5);
    addEdge(`wr-ne-${f}`, `wf-ne-${f}`, 5);
    addEdge(`wr-sw-${f}`, `wf-sw-${f}`, 5);
    addEdge(`wr-se-${f}`, `wf-se-${f}`, 5);
  }
});

// Base Edges Floor B
addEdge('elev-main-B', 'cssd', 20);
addEdge('elev-main-B', 'mortuary', 25);
addEdge('elev-main-B', 'kitchen', 25);
addEdge('elev-main-B', 'laundry', 20);
addEdge('elev-main-B', 'fac-eng', 30);
addEdge('elev-main-B', 'pharm-supply', 15);

// Base Edges Floor G
addEdge('main-entrance', 'main-rec', 20);
addEdge('main-rec', 'elev-main-G', 20);
addEdge('main-rec', 'pharm-247', 15);
addEdge('main-entrance', 'valet', 10);
addEdge('main-entrance', 'er', 30);
addEdge('er', 'amb-bay', 10);
addEdge('elev-main-G', 'rad', 20);
addEdge('elev-main-G', 'cafeteria', 35);
addEdge('rad', 'er', 20);

// Base Edges Floor 1
addEdge('elev-main-1', 'pacu', 20);
addEdge('pacu', 'gen-ot', 20);
addEdge('elev-main-1', 'neuro-ot', 20);
addEdge('elev-main-1', 'cardio-ot', 25);
addEdge('elev-main-1', 'blood-bank', 15);
addEdge('elev-main-1', 'sicu', 15);
addEdge('sicu', 'micu', 15);
addEdge('sicu', 'ccu', 15);
addEdge('blood-bank', 'cath-lab', 15);

// Base Edges Floor 2
addEdge('elev-main-2', 'maternity', 20);
addEdge('maternity', 'labor', 15);
addEdge('elev-main-2', 'nicu', 20);
addEdge('nicu', 'picu', 15);
addEdge('elev-main-2', 'ivf', 15);

// Base Edges Floor 3
addEdge('elev-main-3', 'cardiology', 20);
addEdge('elev-main-3', 'neurology', 20);
addEdge('elev-main-3', 'orthopedics', 20);
addEdge('elev-main-3', 'ophthalmology', 20);
addEdge('elev-main-3', 'path-lab', 15);

// Base Edges Floor 4
addEdge('elev-main-4', 'physio', 20);
addEdge('elev-main-4', 'onco', 20);
addEdge('elev-main-4', 'ward-m', 20);
addEdge('elev-main-4', 'ward-f', 20);
addEdge('ward-m', 'dialysis', 15);

// Base Edges Floor 5
addEdge('elev-main-5', 'vip', 20);
addEdge('elev-main-5', 'private-rms', 20);
addEdge('elev-main-5', 'dir-office', 15);
addEdge('elev-main-5', 'it-control', 20);
addEdge('elev-main-5', 'doc-lounge', 15);

fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/hospitalMapData.json', JSON.stringify({ nodes, edges }, null, 2));
console.log('Generated src/data/hospitalMapData.json');
