import React, { useState, useEffect, useMemo, useRef } from 'react';
import './AIHospitalNavigator.css';
import mapData from '../data/hospitalMapData.json';
import { findPath, nodesMap } from '../utils/pathfinding';

const { nodes, edges } = mapData;
const floors = ['B', 'G', '1', '2', '3', '4', '5'];

const floorConfigs = {
  'B': { x: 50, y: 650, color: 'rgba(226, 232, 240, 0.4)', borderColor: 'rgba(226, 232, 240, 0.8)', label: 'BASEMENT' },
  'G': { x: 150, y: 550, color: 'rgba(186, 230, 253, 0.4)', borderColor: 'rgba(186, 230, 253, 0.8)', label: 'GROUND FLOOR' },
  '1': { x: 250, y: 450, color: 'rgba(187, 247, 208, 0.4)', borderColor: 'rgba(187, 247, 208, 0.8)', label: 'FLOOR 1' },
  '2': { x: 350, y: 350, color: 'rgba(233, 213, 255, 0.4)', borderColor: 'rgba(233, 213, 255, 0.8)', label: 'FLOOR 2' },
  '3': { x: 450, y: 250, color: 'rgba(251, 207, 232, 0.4)', borderColor: 'rgba(251, 207, 232, 0.8)', label: 'FLOOR 3' },
  '4': { x: 550, y: 150, color: 'rgba(254, 215, 170, 0.4)', borderColor: 'rgba(254, 215, 170, 0.8)', label: 'FLOOR 4' },
  '5': { x: 650, y: 50,  color: 'rgba(254, 240, 138, 0.4)', borderColor: 'rgba(254, 240, 138, 0.8)', label: 'FLOOR 5' },
};

const MAP_WIDTH = 900;
const MAP_HEIGHT = 900;

const AIHospitalNavigator = () => {
  const [activeFloor, setActiveFloor] = useState('All');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [path, setPath] = useState([]);
  
  const canvasRef = useRef(null);

  useEffect(() => {
    if (sourceId && targetId) {
      const calculatedPath = findPath(sourceId, targetId, wheelchairOnly);
      setPath(calculatedPath);
      
      // Auto-switch to "All" to show full path if it spans multiple floors
      const startNode = nodesMap.get(sourceId);
      const endNode = nodesMap.get(targetId);
      if (startNode && endNode && startNode.floor !== endNode.floor) {
        setActiveFloor('All');
      }
    } else {
      setPath([]);
    }
  }, [sourceId, targetId, wheelchairOnly]);

  const isAll = activeFloor === 'All';
  const scale = isAll ? 0.45 : 0.8;

  const getTransformedCoords = (node) => {
    if (!isAll) {
      // Center the single floor view
      return { 
        x: node.x * scale + 150, 
        y: node.y * scale + 50
      };
    }
    const offset = floorConfigs[node.floor];
    if (!offset) return { x: node.x * scale, y: node.y * scale };
    return {
      x: node.x * scale + offset.x,
      y: node.y * scale + offset.y
    };
  };

  const visibleNodes = useMemo(() => {
    if (isAll) return nodes;
    return nodes.filter(n => n.floor === activeFloor);
  }, [activeFloor, isAll]);

  const visibleEdges = useMemo(() => {
    if (isAll) return edges;
    // For single floor, only show edges where BOTH nodes are on this floor
    return edges.filter(e => {
      const s = nodesMap.get(e.source);
      const t = nodesMap.get(e.target);
      return s && t && s.floor === activeFloor && t.floor === activeFloor;
    });
  }, [activeFloor, isAll]);

  // Generate SVG path for the calculated route
  const routeSvgPathD = useMemo(() => {
    if (path.length < 2) return '';
    let d = '';
    let isFirst = true;

    for (let i = 0; i < path.length; i++) {
      const nodeId = path[i];
      const node = nodesMap.get(nodeId);
      if (!node) continue;

      if (isAll || node.floor === activeFloor) {
        const { x, y } = getTransformedCoords(node);
        if (isFirst) {
          d += `M ${x} ${y} `;
          isFirst = false;
        } else {
          d += `L ${x} ${y} `;
        }
      } else {
        // Line breaks when changing floors in single-floor view
        isFirst = true; 
      }
    }
    return d.trim();
  }, [path, activeFloor, isAll]);

  // Handle Canvas Panning/Dragging
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.ai-node')) return; // Don't drag if clicking a node
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Reset position when switching views
  useEffect(() => {
    if (isAll) {
      setPosition({ x: -50, y: -200 }); // Default offset for "All" view to center the diagonal
    } else {
      setPosition({ x: 100, y: 0 });
    }
  }, [isAll]);

  return (
    <div className="ai-navigator-container">
      {/* Sidebar Controls */}
      <aside className="ai-sidebar">
        <h2>AI Hospital Navigator</h2>
        <p style={{fontSize: '12px', color: '#64748b', marginTop: '-5px', marginBottom: '15px'}}>Intelligent pathfinding using A*, multi-floor routing with wheelchair access.</p>
        
        <div className="ai-control-group">
          <label>Source Location</label>
          <select 
            className="ai-select"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
          >
            <option value="">Select starting point...</option>
            {nodes.sort((a, b) => a.label.localeCompare(b.label)).map(n => (
              <option key={n.id} value={n.id}>{n.label} (Floor {n.floor})</option>
            ))}
          </select>
        </div>

        <div className="ai-control-group">
          <label>Target Destination</label>
          <select 
            className="ai-select"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">Select destination...</option>
            {nodes.sort((a, b) => a.label.localeCompare(b.label)).map(n => (
              <option key={n.id} value={n.id}>{n.label} (Floor {n.floor})</option>
            ))}
          </select>
        </div>

        <label className="ai-toggle-wrapper">
          <input 
            type="checkbox" 
            className="ai-toggle-input"
            checked={wheelchairOnly}
            onChange={(e) => setWheelchairOnly(e.target.checked)}
          />
          <div className="ai-toggle-switch"></div>
          <span style={{fontSize: '14px', fontWeight: '500', color: '#475569'}}>Wheelchair Route Only ♿</span>
        </label>

        <div className="ai-control-group" style={{marginTop: '20px'}}>
          <label>Floor Filter</label>
          <div className="ai-floor-selector">
            <button 
              className={`ai-floor-pill ${activeFloor === 'All' ? 'active' : ''}`}
              onClick={() => setActiveFloor('All')}
            >
              All Floors
            </button>
            {floors.map(f => (
              <button 
                key={f}
                className={`ai-floor-pill ${activeFloor === f ? 'active' : ''}`}
                onClick={() => setActiveFloor(f)}
              >
                Floor {f}
              </button>
            ))}
          </div>
        </div>

        {path.length > 0 && (
          <div style={{marginTop: '20px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
            <h3 style={{fontSize: '14px', margin: '0 0 5px 0', color: '#1e40af'}}>Route Calculated</h3>
            <p style={{fontSize: '12px', color: '#3b82f6', margin: 0}}>
              {path.length} steps in path. {wheelchairOnly ? '(Avoiding Stairs)' : ''}
            </p>
          </div>
        )}
      </aside>

      {/* Canvas Area */}
      <main 
        className="ai-canvas" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="ai-canvas-inner" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
          
          {/* SVG Base Edges Layer */}
          <svg className="ai-svg-layer">
            {visibleEdges.map((e, idx) => {
              const sNode = nodesMap.get(e.source);
              const tNode = nodesMap.get(e.target);
              if (!sNode || !tNode) return null;
              
              const sCoord = getTransformedCoords(sNode);
              const tCoord = getTransformedCoords(tNode);
              
              const isVertical = sNode.floor !== tNode.floor;
              
              return (
                <line 
                  key={`edge-${idx}`}
                  x1={sCoord.x} 
                  y1={sCoord.y} 
                  x2={tCoord.x} 
                  y2={tCoord.y} 
                  className={`ai-base-edge ${isVertical ? 'vertical-edge' : ''}`}
                />
              );
            })}
            
            {/* SVG Calculated Route Overlay */}
            {routeSvgPathD && (
              <path className="ai-route-line" d={routeSvgPathD} />
            )}
          </svg>

          {/* Floor Bounding Boxes */}
          {isAll && floors.map(f => {
            const config = floorConfigs[f];
            return (
              <div 
                key={`box-${f}`}
                className="ai-floor-box"
                style={{
                  left: `${config.x}px`,
                  top: `${config.y}px`,
                  width: `${MAP_WIDTH * scale}px`,
                  height: `${MAP_HEIGHT * scale}px`,
                  backgroundColor: config.color,
                  borderColor: config.borderColor,
                }}
              >
                <div className="ai-floor-box-label" style={{ color: config.borderColor }}>
                  {config.label}
                </div>
              </div>
            );
          })}

          {/* Nodes Layer */}
          {visibleNodes.map(node => {
            const { x, y } = getTransformedCoords(node);
            const isStart = node.id === sourceId;
            const isEnd = node.id === targetId;
            const inPath = path.includes(node.id);

            return (
              <div 
                key={node.id} 
                className={`ai-node category-${node.category} ${isStart ? 'is-source' : ''} ${isEnd ? 'is-target' : ''} ${inPath && !isStart && !isEnd ? 'in-path' : ''}`}
                style={{ left: `${x}px`, top: `${y}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!sourceId) setSourceId(node.id);
                  else if (!targetId) setTargetId(node.id);
                  else {
                    setSourceId(node.id);
                    setTargetId('');
                  }
                }}
              >
                <div className="ai-node-indicator"></div>
                {/* Always show label if zooming/panning, but let's keep them visible */}
                <span className="ai-node-label">{node.label}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AIHospitalNavigator;
