import mapData from '../data/hospitalMapData.json';

const { nodes, edges } = mapData;

// Create a map for quick node lookup
export const nodesMap = new Map();
nodes.forEach(n => nodesMap.set(n.id, n));

// Build adjacency list
// Graph: { [nodeId]: [ { node: targetId, weight: weight } ] }
const buildGraph = (wheelchairOnly) => {
  const graph = {};
  
  nodes.forEach(n => {
    graph[n.id] = [];
  });

  edges.forEach(e => {
    const { source, target, weight } = e;
    const sourceNode = nodesMap.get(source);
    const targetNode = nodesMap.get(target);

    // If wheelchair mode is on, avoid stairwells
    if (wheelchairOnly) {
      if (sourceNode?.category === 'stairwell' || targetNode?.category === 'stairwell') {
        return; // Skip this edge
      }
    }

    if (graph[source] && graph[target]) {
      // Undirected graph
      graph[source].push({ node: target, weight });
      graph[target].push({ node: source, weight });
    }
  });
  
  return graph;
};

// A* heuristic (Euclidean distance between two nodes)
const heuristic = (nodeAId, nodeBId) => {
  const nodeA = nodesMap.get(nodeAId);
  const nodeB = nodesMap.get(nodeBId);
  if (!nodeA || !nodeB) return 0;

  // Since coordinates represent a specific floor layout, vertical movement should be 
  // prioritized or weighted. We'll add a penalty for different floors.
  const floorMap = { 'B': -1, 'G': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };
  
  const fA = floorMap[nodeA.floor] || 0;
  const fB = floorMap[nodeB.floor] || 0;
  
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  const dz = (fA - fB) * 1000; // Large penalty for being on different floors to prioritize elevators/stairs

  return Math.sqrt(dx*dx + dy*dy + dz*dz);
};

export const findPath = (startId, endId, wheelchairOnly = false) => {
  if (!startId || !endId || startId === endId) return [];

  const graph = buildGraph(wheelchairOnly);
  
  const openSet = new Set([startId]);
  const cameFrom = new Map();

  const gScore = new Map();
  nodes.forEach(n => gScore.set(n.id, Infinity));
  gScore.set(startId, 0);

  const fScore = new Map();
  nodes.forEach(n => fScore.set(n.id, Infinity));
  fScore.set(startId, heuristic(startId, endId));

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let current = null;
    let lowestFScore = Infinity;
    
    for (const nodeId of openSet) {
      const score = fScore.get(nodeId);
      if (score < lowestFScore) {
        lowestFScore = score;
        current = nodeId;
      }
    }

    if (current === endId) {
      // Reconstruct path
      const path = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        path.unshift(current);
      }
      return path;
    }

    openSet.delete(current);

    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      const tentativeGScore = gScore.get(current) + neighbor.weight;
      
      if (tentativeGScore < gScore.get(neighbor.node)) {
        cameFrom.set(neighbor.node, current);
        gScore.set(neighbor.node, tentativeGScore);
        fScore.set(neighbor.node, tentativeGScore + heuristic(neighbor.node, endId));
        
        if (!openSet.has(neighbor.node)) {
          openSet.add(neighbor.node);
        }
      }
    }
  }

  // Path not found
  return [];
};
