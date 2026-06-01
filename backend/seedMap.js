require('dotenv').config();
const mongoose = require('mongoose');

const mapNodeSchema = new mongoose.Schema({
  nodeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  floorLevel: { type: Number, required: true },
  x_coordinate: { type: Number, required: true },
  y_coordinate: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['room', 'corridor', 'elevator', 'stair', 'entrance', 'reception', 'restroom'], 
    required: true 
  },
  department: { type: String },
  isWheelchairAccessible: { type: Boolean, default: true }
});

const mapEdgeSchema = new mongoose.Schema({
  sourceNode: { type: mongoose.Schema.Types.ObjectId, ref: 'MapNode', required: true },
  targetNode: { type: mongoose.Schema.Types.ObjectId, ref: 'MapNode', required: true },
  distanceWeight: { type: Number, required: true },
  isWheelchairAccessible: { type: Boolean, default: true },
  isBidirectional: { type: Boolean, default: true }
});

const MapNode = mongoose.model('MapNode', mapNodeSchema);
const MapEdge = mongoose.model('MapEdge', mapEdgeSchema);

const seedMap = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await MapEdge.deleteMany({});
  await MapNode.deleteMany({});
  console.log('Cleared existing map data');

  const nodes = [
    // Ground Floor (Floor 0)
    { nodeId: 'G-ENTRANCE', name: 'Main Entrance', floorLevel: 0, x_coordinate: 400, y_coordinate: 500, type: 'entrance' },
    { nodeId: 'G-RECEPTION', name: 'Main Reception & Help Desk', floorLevel: 0, x_coordinate: 400, y_coordinate: 400, type: 'reception' },
    { nodeId: 'G-ER', name: 'Emergency Room (ER)', floorLevel: 0, x_coordinate: 200, y_coordinate: 400, type: 'room', department: 'Emergency' },
    { nodeId: 'G-PHARMACY', name: '24/7 Pharmacy', floorLevel: 0, x_coordinate: 600, y_coordinate: 400, type: 'room', department: 'Pharmacy' },
    { nodeId: 'G-ELEVATOR', name: 'Main Elevators (G)', floorLevel: 0, x_coordinate: 400, y_coordinate: 300, type: 'elevator' },
    { nodeId: 'G-RESTROOM', name: 'Ground Floor Restroom', floorLevel: 0, x_coordinate: 300, y_coordinate: 300, type: 'restroom' },
    { nodeId: 'G-AMBULANCE', name: 'Ambulance Bay', floorLevel: 0, x_coordinate: 100, y_coordinate: 500, type: 'entrance' },

    // Floor 1 (Diagnostics & Imaging)
    { nodeId: '1-ELEVATOR', name: 'Main Elevators (1st Floor)', floorLevel: 1, x_coordinate: 400, y_coordinate: 300, type: 'elevator' },
    { nodeId: '1-RADIOLOGY', name: 'Radiology (X-Ray & MRI)', floorLevel: 1, x_coordinate: 200, y_coordinate: 300, type: 'room', department: 'Radiology' },
    { nodeId: '1-LAB', name: 'Pathology Lab', floorLevel: 1, x_coordinate: 600, y_coordinate: 300, type: 'room', department: 'Pathology' },
    { nodeId: '1-BLOOD', name: 'Blood Bank', floorLevel: 1, x_coordinate: 600, y_coordinate: 400, type: 'room' },

    // Floor 2 (Outpatient Departments)
    { nodeId: '2-ELEVATOR', name: 'Main Elevators (2nd Floor)', floorLevel: 2, x_coordinate: 400, y_coordinate: 300, type: 'elevator' },
    { nodeId: '2-CARDIOLOGY', name: 'Cardiology Center', floorLevel: 2, x_coordinate: 200, y_coordinate: 300, type: 'room', department: 'Cardiology' },
    { nodeId: '2-ORTHO', name: 'Orthopedics', floorLevel: 2, x_coordinate: 600, y_coordinate: 300, type: 'room', department: 'Orthopedics' },
    { nodeId: '2-PEDIATRICS', name: 'Pediatrics', floorLevel: 2, x_coordinate: 400, y_coordinate: 150, type: 'room', department: 'Pediatrics' },

    // Floor 3 (Surgery & ICU)
    { nodeId: '3-ELEVATOR', name: 'Main Elevators (3rd Floor)', floorLevel: 3, x_coordinate: 400, y_coordinate: 300, type: 'elevator' },
    { nodeId: '3-ICU', name: 'Intensive Care Unit (ICU)', floorLevel: 3, x_coordinate: 200, y_coordinate: 300, type: 'room', department: 'ICU' },
    { nodeId: '3-OT', name: 'Operation Theaters', floorLevel: 3, x_coordinate: 600, y_coordinate: 300, type: 'room', department: 'Surgery' },

    // Floor 4 (Inpatient Wards)
    { nodeId: '4-ELEVATOR', name: 'Main Elevators (4th Floor)', floorLevel: 4, x_coordinate: 400, y_coordinate: 300, type: 'elevator' },
    { nodeId: '4-GENERAL', name: 'General Wards', floorLevel: 4, x_coordinate: 200, y_coordinate: 300, type: 'room' },
    { nodeId: '4-PRIVATE', name: 'Private Suites', floorLevel: 4, x_coordinate: 600, y_coordinate: 300, type: 'room' },
  ];

  const createdNodes = await MapNode.insertMany(nodes);
  console.log('Inserted map nodes');

  const getNodeId = (id) => createdNodes.find(n => n.nodeId === id)._id;

  const edges = [
    // Ground Floor Edges
    { sourceNode: getNodeId('G-ENTRANCE'), targetNode: getNodeId('G-RECEPTION'), distanceWeight: 10 },
    { sourceNode: getNodeId('G-RECEPTION'), targetNode: getNodeId('G-ER'), distanceWeight: 20 },
    { sourceNode: getNodeId('G-RECEPTION'), targetNode: getNodeId('G-PHARMACY'), distanceWeight: 20 },
    { sourceNode: getNodeId('G-RECEPTION'), targetNode: getNodeId('G-ELEVATOR'), distanceWeight: 10 },
    { sourceNode: getNodeId('G-RECEPTION'), targetNode: getNodeId('G-RESTROOM'), distanceWeight: 15 },
    { sourceNode: getNodeId('G-ER'), targetNode: getNodeId('G-AMBULANCE'), distanceWeight: 15 },

    // Floor 1 Edges
    { sourceNode: getNodeId('1-ELEVATOR'), targetNode: getNodeId('1-RADIOLOGY'), distanceWeight: 20 },
    { sourceNode: getNodeId('1-ELEVATOR'), targetNode: getNodeId('1-LAB'), distanceWeight: 20 },
    { sourceNode: getNodeId('1-LAB'), targetNode: getNodeId('1-BLOOD'), distanceWeight: 10 },

    // Floor 2 Edges
    { sourceNode: getNodeId('2-ELEVATOR'), targetNode: getNodeId('2-CARDIOLOGY'), distanceWeight: 20 },
    { sourceNode: getNodeId('2-ELEVATOR'), targetNode: getNodeId('2-ORTHO'), distanceWeight: 20 },
    { sourceNode: getNodeId('2-ELEVATOR'), targetNode: getNodeId('2-PEDIATRICS'), distanceWeight: 15 },

    // Floor 3 Edges
    { sourceNode: getNodeId('3-ELEVATOR'), targetNode: getNodeId('3-ICU'), distanceWeight: 20 },
    { sourceNode: getNodeId('3-ELEVATOR'), targetNode: getNodeId('3-OT'), distanceWeight: 20 },

    // Floor 4 Edges
    { sourceNode: getNodeId('4-ELEVATOR'), targetNode: getNodeId('4-GENERAL'), distanceWeight: 20 },
    { sourceNode: getNodeId('4-ELEVATOR'), targetNode: getNodeId('4-PRIVATE'), distanceWeight: 20 },

    // Elevators (connecting floors)
    { sourceNode: getNodeId('G-ELEVATOR'), targetNode: getNodeId('1-ELEVATOR'), distanceWeight: 5 },
    { sourceNode: getNodeId('1-ELEVATOR'), targetNode: getNodeId('2-ELEVATOR'), distanceWeight: 5 },
    { sourceNode: getNodeId('2-ELEVATOR'), targetNode: getNodeId('3-ELEVATOR'), distanceWeight: 5 },
    { sourceNode: getNodeId('3-ELEVATOR'), targetNode: getNodeId('4-ELEVATOR'), distanceWeight: 5 },
  ];

  await MapEdge.insertMany(edges);
  console.log('Inserted map edges');

  mongoose.disconnect();
};

seedMap().catch(err => console.error(err));
