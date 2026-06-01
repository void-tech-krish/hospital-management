import { useState, useEffect } from 'react';
import axios from 'axios';
import './HospitalMap.css';

const API_URL = 'http://localhost:5000/api';

const HospitalMap = ({ onBack }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [floor, setFloor] = useState('All');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [path, setPath] = useState([]);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [avoidCrowded, setAvoidCrowded] = useState(false);


  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const url = floor === 'All' ? `${API_URL}/navigation/nodes` : `${API_URL}/navigation/nodes?floor=${floor}`;
        const res = await axios.get(url);
        setNodes(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchEdges = async () => {
      try {
        const res = await axios.get(`${API_URL}/navigation/edges`);
        setEdges(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNodes();
    fetchEdges();
  }, [floor]);

  const calculateRoute = async () => {
    if (!startNode || !endNode) {
      alert("Please select both a Source and Target destination.");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/navigation/route`, { startNodeId: startNode, endNodeId: endNode, wheelchairOnly });
      setPath(res.data.path.map(p => p.nodeId));
    } catch (err) {
      alert(err.response?.data?.error || 'Path not found');
    }
  };

  // Helper for multi-floor visualization
  const getFloorOffset = (floorLevel) => {
    if (floor !== 'All') return { x: 0, y: 0 };
    switch (floorLevel) {
      case 0: return { x: 0, y: 1000 };
      case 1: return { x: 200, y: 500 };
      case 2: return { x: 400, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const getFloorClassName = (floorLevel) => {
    switch (floorLevel) {
      case 0: return 'floor-ground';
      case 1: return 'floor-1';
      case 2: return 'floor-2';
      default: return '';
    }
  };
  
  const selectedNodeDetails = nodes.find(n => n.nodeId === endNode) || nodes.find(n => n.nodeId === startNode);

  return (
    <div className="hospital-map-container">
      <div className="map-sidebar">
        <div className="sidebar-ai-card">
           <span className="ai-badge">🤖 AI Hospital Navigator</span>
        </div>
        
        <div className="control-group">
          <label>📍 Source Location</label>
          <select className="control-select" value={startNode} onChange={e => setStartNode(e.target.value)}>
            <option value="" disabled>Select Source...</option>
            {nodes.map(n => <option key={n.nodeId} value={n.nodeId}>{n.name}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>🎯 Target Destination</label>
          <select className="control-select" value={endNode} onChange={e => setEndNode(e.target.value)}>
            <option value="" disabled>Select Target...</option>
            {nodes.map(n => <option key={n.nodeId} value={n.nodeId}>{n.name}</option>)}
          </select>
        </div>



        <div className="constraints-section">
          <label className="constraints-title">🔒 Constraints</label>
          <div className="toggle-group" onClick={() => setAvoidCrowded(!avoidCrowded)}>
            <div className={`toggle-switch ${avoidCrowded ? 'active' : ''}`}></div>
            <span className="toggle-label">Avoid Crowded Corridors</span>
          </div>
          <div className="toggle-group" onClick={() => setWheelchairOnly(!wheelchairOnly)}>
            <div className={`toggle-switch ${wheelchairOnly ? 'active' : ''}`}></div>
            <span className="toggle-label">♿ Wheelchair Route Only</span>
          </div>
          <p className="hint-text">💡 Click paths on the map to mark as crowded.</p>
        </div>

        <div className="calc-btn-group">
          <button className="calc-btn" onClick={calculateRoute}>Calculate Best Path</button>
          <button className="er-btn" onClick={() => {
            const erNode = nodes.find(n => n.name.toLowerCase().includes('emergency') || n.name.toLowerCase() === 'er');
            if (erNode) {
               setEndNode(erNode.nodeId);
               if (startNode) {
                  // Small delay to allow state update before calculating
                  setTimeout(() => document.querySelector('.calc-btn').click(), 100);
               } else {
                  alert("Please select a Source Location to route to the ER.");
               }
            } else {
               alert("Emergency Room not found on map.");
            }
          }}>🚨 ER</button>
        </div>

        <div className="floor-filter">
          <label className="filter-title">🏢 Floor Filter</label>
          <div className="floor-chips">
            {['All', 0, 1, 2].map(f => (
              <div key={f} className={`floor-chip ${floor === f ? 'active' : ''}`} onClick={() => setFloor(f)}>
                {f === 'All' ? 'All' : f === 0 ? 'Ground' : `Floor ${f}`}
              </div>
            ))}
          </div>
        </div>

        {selectedNodeDetails && (
          <div className="location-details-card">
            <h4>📌 Location Details</h4>
            <span className="badge-clinical">CLINICAL</span>
            <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop" alt="Location" className="location-img" />
            <h3 className="location-name">💊 {selectedNodeDetails.name}</h3>
            <div className="location-tags">
              <span className="tag-floor">Floor {selectedNodeDetails.floorLevel === 0 ? 'Ground' : selectedNodeDetails.floorLevel}</span>
              {selectedNodeDetails.isWheelchairAccessible && <span className="tag-accessible">♿ Accessible</span>}
            </div>
          </div>
        )}
      </div>

      <div className="map-main">
        <div className="map-header">
           <div className="map-title">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <button onClick={onBack} title="Go Back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', color: '#64748b', padding: '0 5px 0 0' }}>
                 ←
               </button>
               <h1>Hospital Floor Map</h1>
             </div>
             <p>Showing: {floor === 'All' ? 'All Floors' : floor === 0 ? 'Ground Floor' : `Floor ${floor}`}</p>
           </div>
           <div className="map-legend">
              <div className="legend-item"><span className="legend-dot start-dot"></span> Start</div>
              <div className="legend-item"><span className="legend-dot target-dot"></span> Target</div>
              <div className="legend-item"><span className="legend-dot path-dot"></span> Best Path</div>
              <div className="legend-item"><span className="legend-dot crowded-dot"></span> Crowded</div>
              <div className="legend-item">♿ Wheelchair</div>
           </div>
        </div>
        
        <div className="map-content-wrapper">
          <div className="map-content-inner">
            {/* Render Floor Boundaries (translucent boxes) only in 'All' mode */}
            {floor === 'All' && [0, 1, 2].map(fLevel => {
              const offset = getFloorOffset(fLevel);
              return (
                <div key={`floor-box-${fLevel}`} className={`floor-boundary ${getFloorClassName(fLevel)}`} 
                     style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
                  <span className="floor-boundary-label">{fLevel === 0 ? 'GROUND FLOOR' : `FLOOR ${fLevel}`}</span>
                </div>
              );
            })}

            <svg className="map-edges-svg">
              {edges.filter(e => {
                  const s = nodes.find(n => n._id === e.sourceNode);
                  const t = nodes.find(n => n._id === e.targetNode);
                  if (floor === 'All') return s && t;
                  return s && t && s.floorLevel === floor && t.floorLevel === floor;
              }).map(e => {
                const s = nodes.find(n => n._id === e.sourceNode);
                const t = nodes.find(n => n._id === e.targetNode);
                const isPath = path.includes(s.nodeId) && path.includes(t.nodeId);
                const sOffset = getFloorOffset(s.floorLevel);
                const tOffset = getFloorOffset(t.floorLevel);
                const x1 = s.x_coordinate + sOffset.x;
                const y1 = s.y_coordinate + sOffset.y;
                const x2 = t.x_coordinate + tOffset.x;
                const y2 = t.y_coordinate + tOffset.y;
                
                const isInterFloor = s.floorLevel !== t.floorLevel;

                return <line key={e._id} x1={x1} y1={y1} x2={x2} y2={y2} className={`map-edge ${isPath ? 'path-edge' : ''} ${isInterFloor ? 'inter-floor-edge' : ''}`} />
              })}
            </svg>

            {/* Nodes */}
            {nodes.filter(n => floor === 'All' || n.floorLevel === floor).map(node => {
              const isStart = node.nodeId === startNode;
              const isEnd = node.nodeId === endNode;
              const isPath = path.includes(node.nodeId);
              let className = 'map-node-item';
              if (isStart) className += ' start-node';
              if (isEnd) className += ' target-node';
              if (isPath && !isStart && !isEnd) className += ' path-node';

              const offset = getFloorOffset(node.floorLevel);
              const x = node.x_coordinate + offset.x;
              const y = node.y_coordinate + offset.y;

              return (
                <div key={node.nodeId} className={className} style={{ left: `${x}px`, top: `${y}px` }}>
                   <div className="node-icon-wrapper">
                     <span className="node-icon">{node.type === 'elevator' ? '🛗' : node.type === 'stair' ? '📶' : node.type === 'entrance' ? '🚪' : node.type === 'restroom' ? '🚻' : '📍'}</span>
                   </div>
                   <span className="node-label-text">{node.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;
