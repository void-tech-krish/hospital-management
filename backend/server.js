require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hospital_super_secret';

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MONGOOSE SCHEMAS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'staff', 'patient'], required: true },
  department: String,
  status: { type: String, default: 'Approved' },
  licenseNumber: String,
  certificateUrl: String,
  availability: String,
  gender: String,
  contact: String,
  specialization: String,
  experience: String,
  bio: String,
  notifications: Boolean,
  signature: String,
  insuranceProvider: String,
  insuranceId: String,
  dependents: [{
    name: String,
    relation: String,
    age: String
  }],
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  status: { type: String, default: 'Scheduled' } // Scheduled, Completed, Cancelled, Rescheduled
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const billSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ description: String, cost: Number }],
  total: Number,
  status: { type: String, default: 'Unpaid' },
  date: { type: Date, default: Date.now }
});
const Bill = mongoose.model('Bill', billSchema);

const salarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  month: String,
  status: { type: String, default: 'Paid' },
  date: { type: Date, default: Date.now }
});
const Salary = mongoose.model('Salary', salarySchema);

const departmentSchema = new mongoose.Schema({
  name: String,
  hodName: String,
  members: [String]
});
const Department = mongoose.model('Department', departmentSchema);

const grievanceSchema = new mongoose.Schema({
  patientName: String,
  complaint: String,
  status: { type: String, default: 'Pending' },
  assignedStaffName: String,
  date: { type: Date, default: Date.now }
});
const Grievance = mongoose.model('Grievance', grievanceSchema);

const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  date: { type: Date, default: Date.now }
});
const Expense = mongoose.model('Expense', expenseSchema);

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const bedRequestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: String,
  bedType: String,
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
});
const BedRequest = mongoose.model('BedRequest', bedRequestSchema);

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
const MapNode = mongoose.model('MapNode', mapNodeSchema);

const mapEdgeSchema = new mongoose.Schema({
  sourceNode: { type: mongoose.Schema.Types.ObjectId, ref: 'MapNode', required: true },
  targetNode: { type: mongoose.Schema.Types.ObjectId, ref: 'MapNode', required: true },
  distanceWeight: { type: Number, required: true },
  isWheelchairAccessible: { type: Boolean, default: true },
  isBidirectional: { type: Boolean, default: true }
});
const MapEdge = mongoose.model('MapEdge', mapEdgeSchema);

// --- HELPER ---
const addLog = async (userId, action) => {
  await AuditLog.create({ userId, action });
};

// --- MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access Denied' });
  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};

const isAdmin = (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin only' });

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, licenseNumber, certificateUrl } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let initialStatus = 'Approved';
    if (role === 'doctor' || role === 'staff') initialStatus = 'Pending';

    const user = await User.create({
      name, 
      email: normalizedEmail, 
      password: hashedPassword, 
      role, 
      department: role === 'doctor' ? 'General Medicine' : undefined,
      status: initialStatus,
      licenseNumber: role === 'doctor' || role === 'staff' ? licenseNumber : undefined,
      certificateUrl: role === 'doctor' || role === 'staff' ? certificateUrl : undefined
    });

    const token = jwt.sign({ _id: user._id, role: user.role, name: user.name }, JWT_SECRET);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(400).json({ error: 'No user found with this email address.' });
    }
    
    if (user.role !== role) {
      return res.status(400).json({ error: `Invalid role selected. Please select ${user.role}.` });
    }
    
    
    if (user.status === 'Pending') {
      return res.status(403).json({ error: 'Your account is pending admin approval. Please wait until your license and certificate are verified.' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign({ _id: user._id, role: user.role, name: user.name }, JWT_SECRET);
    await addLog(user._id, `Logged in to system`);
    
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    res.json({ totalPatients, totalDoctors, totalAppointments });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/users/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await addLog(user._id, `Admin approved ${user.role} registration`);
    res.json({ message: 'User approved successfully' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/users/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User rejected and removed' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/users/:id/availability', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { availability: req.body.availability }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Availability updated successfully', availability: user.availability });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await addLog(req.user._id, `Deleted user ${user.name}`);
    res.json({ message: 'User deleted successfully' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- MESSAGES ROUTES ---
app.post('/api/messages', verifyToken, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const msg = await Message.create({ senderId: req.user._id, receiverId, text });
    res.status(201).json(msg);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] 
    }).populate('senderId', 'name role').sort({ date: 1 });
    
    const populated = messages.map(m => ({
      _id: m._id,
      text: m.text,
      senderId: m.senderId?._id,
      receiverId: m.receiverId,
      date: m.date,
      senderName: m.senderId?.name || 'Unknown',
      senderRole: m.senderId?.role || 'unknown'
    }));
    res.json(populated);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- COMMON & USER ROUTES ---
app.put('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    await addLog(user._id, `Updated profile details`);
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ message: 'Profile updated successfully', user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/dependents', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    user.dependents.push({ name: req.body.name, relation: req.body.relation, age: req.body.age });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ message: 'Dependent added', user: userObj });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/doctors/availability', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { availability: req.body.availability }, { new: true });
    res.json({ message: 'Availability updated successfully', availability: user.availability });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/doctors', verifyToken, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', status: 'Approved' }, 'name role availability department');
    res.json(doctors);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- APPOINTMENTS ---
app.post('/api/appointments', verifyToken, async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const appointment = await Appointment.create({ patientId: req.user._id, doctorId, date, status: 'Scheduled' });
    res.status(201).json(appointment);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id/cancel', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Cancelled successfully' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id/reschedule', verifyToken, async (req, res) => {
  try {
    const { date } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { date, status: 'Rescheduled' }, { new: true });
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Rescheduled successfully' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/appointments', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query = { patientId: req.user._id };
    else if (req.user.role === 'doctor') query = { doctorId: req.user._id };

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort({ date: -1 });
    res.json(appointments);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- BILLING & SALARIES ---
app.post('/api/admin/bills', verifyToken, isAdmin, async (req, res) => {
  try {
    const { patientId, items } = req.body;
    const total = items.reduce((acc, curr) => acc + Number(curr.cost), 0);
    const bill = await Bill.create({ patientId, items, total });
    await addLog(req.user._id, `Generated bill for patient ${patientId}`);
    res.status(201).json(bill);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/bills', verifyToken, isAdmin, async (req, res) => {
  try {
    const bills = await Bill.find().populate('patientId', 'name').sort({ date: -1 });
    const populated = bills.map(b => ({ ...b.toObject(), patient: b.patientId }));
    res.json(populated);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bills', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Patients only' });
    const myBills = await Bill.find({ patientId: req.user._id }).sort({ date: -1 });
    res.json(myBills);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bills/:id/pay', verifyToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.patientId.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    
    bill.status = 'Paid';
    await bill.save();
    await addLog(req.user._id, `Marked bill ${bill._id} as Paid`);
    res.json(bill);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/salaries', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, amount, month } = req.body;
    const payment = await Salary.create({ userId, amount, month });
    await addLog(req.user._id, `Paid salary ($${amount}) to user ${userId}`);
    res.status(201).json(payment);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/salaries', verifyToken, isAdmin, async (req, res) => {
  try {
    const salaries = await Salary.find().populate('userId', 'name role').sort({ date: -1 });
    const populated = salaries.map(p => ({ ...p.toObject(), user: p.userId }));
    res.json(populated);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN FEATURES (DEPT, GRIEVANCES, EXPENSES) ---
app.post('/api/admin/departments', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, hodName } = req.body;
    const dept = await Department.create({ name, hodName });
    await addLog(req.user._id, `Created department ${name}`);
    res.status(201).json(dept);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/departments/:id/hod', verifyToken, isAdmin, async (req, res) => {
  try {
    const { hodName } = req.body;
    const dept = await Department.findByIdAndUpdate(req.params.id, { hodName }, { new: true });
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    await addLog(req.user._id, `Updated HOD of ${dept.name} to ${hodName}`);
    res.json(dept);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/departments', verifyToken, isAdmin, async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/grievances', verifyToken, isAdmin, async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ date: -1 });
    res.json(grievances);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/grievances/:id/assign', verifyToken, isAdmin, async (req, res) => {
  try {
    const g = await Grievance.findByIdAndUpdate(req.params.id, { assignedStaffName: req.body.staffName }, { new: true });
    if(g) {
      await addLog(req.user._id, `Assigned staff ${req.body.staffName} to grievance ${g._id}`);
      res.json(g);
    } else res.status(404).json({error: 'Not found'});
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/grievances/:id/resolve', verifyToken, isAdmin, async (req, res) => {
  try {
    const g = await Grievance.findByIdAndUpdate(req.params.id, { status: 'Resolved' }, { new: true });
    if(g) {
      await addLog(req.user._id, `Resolved grievance ${g._id}`);
      res.json(g);
    } else res.status(404).json({error: 'Not found'});
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/expenses', verifyToken, isAdmin, async (req, res) => {
  try {
    const { description, amount } = req.body;
    const exp = await Expense.create({ description, amount });
    await addLog(req.user._id, `Added expense: ${description} ($${amount})`);
    res.status(201).json(exp);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/expenses', verifyToken, isAdmin, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/audit', verifyToken, isAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('userId', 'name').sort({ timestamp: -1 });
    const populated = logs.map(l => ({ ...l.toObject(), userName: l.userId ? l.userId.name : 'System' }));
    res.json(populated);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/beds', verifyToken, (req, res) => {
  // Static beds for now
  res.json([
    { _id: '1', type: 'Normal', price: 50 },
    { _id: '2', type: 'AC', price: 100 },
    { _id: '3', type: 'Deluxe', price: 200 },
    { _id: '4', type: 'Super Deluxe', price: 300 },
    { _id: '5', type: 'Suite', price: 500 },
  ]);
});

// --- BED REQUESTS ---
app.post('/api/bed-requests', verifyToken, async (req, res) => {
  try {
    const { bedType, patientId, patientName } = req.body;
    // If admin or doctor is assigning, they send patientId, otherwise it's the logged-in patient
    const pId = (req.user.role !== 'patient' && patientId) ? patientId : req.user._id;
    
    // Find patient name if not provided
    let pName = patientName;
    if (!pName) {
      const patient = await User.findById(pId);
      pName = patient ? patient.name : 'Unknown';
    }

    const request = await BedRequest.create({ 
      patientId: pId, 
      patientName: pName,
      bedType, 
      status: req.user.role === 'patient' ? 'Pending' : 'Approved',
      assignedBy: req.user.role !== 'patient' ? req.user._id : undefined
    });
    
    if (req.user.role !== 'patient') {
      await addLog(req.user._id, `Assigned bed type ${bedType} to patient ${pName}`);
    } else {
      await addLog(req.user._id, `Requested bed type ${bedType}`);
    }
    
    res.status(201).json(request);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bed-requests', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query = { patientId: req.user._id };
    const requests = await BedRequest.find(query).populate('patientId', 'name').sort({ date: -1 });
    res.json(requests);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bed-requests/:id/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'patient') return res.status(403).json({ error: 'Unauthorized' });
    const { status } = req.body;
    const request = await BedRequest.findByIdAndUpdate(req.params.id, { status, assignedBy: req.user._id }, { new: true });
    await addLog(req.user._id, `Updated bed request ${request._id} to ${status}`);
    res.json(request);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- INDOOR NAVIGATION ROUTES ---
app.get('/api/navigation/nodes', async (req, res) => {
  try {
    const query = req.query.floor ? { floorLevel: Number(req.query.floor) } : {};
    const nodes = await MapNode.find(query);
    res.json(nodes);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/navigation/nodes/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const nodes = await MapNode.find({ name: { $regex: q, $options: 'i' } });
    res.json(nodes);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/navigation/edges', async (req, res) => {
  try {
    const edges = await MapEdge.find();
    res.json(edges);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/navigation/route', async (req, res) => {
  try {
    const { startNodeId, endNodeId, wheelchairOnly } = req.body;
    
    // 1. Fetch all nodes and edges
    const nodes = await MapNode.find().lean();
    const edges = await MapEdge.find().populate('sourceNode').populate('targetNode').lean();
    
    // Map nodes by ID for quick lookup
    const nodeMap = new Map(nodes.map(n => [n.nodeId, n]));
    
    const startNode = nodeMap.get(startNodeId);
    const endNode = nodeMap.get(endNodeId);
    
    if (!startNode || !endNode) {
      return res.status(404).json({ error: 'Start or End node not found' });
    }
    
    // 2. Build Adjacency List for A* Search
    const adjacencyList = new Map();
    nodes.forEach(n => adjacencyList.set(n._id.toString(), []));
    
    edges.forEach(edge => {
      // Filter out non-wheelchair accessible paths if requested
      if (wheelchairOnly && !edge.isWheelchairAccessible) return;
      
      const srcId = edge.sourceNode._id.toString();
      const tgtId = edge.targetNode._id.toString();
      
      adjacencyList.get(srcId).push({ target: tgtId, weight: edge.distanceWeight });
      if (edge.isBidirectional) {
        adjacencyList.get(tgtId).push({ target: srcId, weight: edge.distanceWeight });
      }
    });
    
    // 3. A* Search Algorithm
    // Heuristic: Euclidean distance between nodes (assumes 1 unit per pixel/coordinate roughly)
    const heuristic = (id1, id2) => {
      const n1 = nodes.find(n => n._id.toString() === id1);
      const n2 = nodes.find(n => n._id.toString() === id2);
      if (!n1 || !n2) return 0;
      // Add a large penalty for changing floors to prefer same-floor routes when possible
      const floorPenalty = Math.abs(n1.floorLevel - n2.floorLevel) * 1000;
      return Math.sqrt(Math.pow(n1.x_coordinate - n2.x_coordinate, 2) + Math.pow(n1.y_coordinate - n2.y_coordinate, 2)) + floorPenalty;
    };

    const openSet = new Set([startNode._id.toString()]);
    const cameFrom = new Map();
    
    const gScore = new Map();
    nodes.forEach(n => gScore.set(n._id.toString(), Infinity));
    gScore.set(startNode._id.toString(), 0);
    
    const fScore = new Map();
    nodes.forEach(n => fScore.set(n._id.toString(), Infinity));
    fScore.set(startNode._id.toString(), heuristic(startNode._id.toString(), endNode._id.toString()));
    
    let currentId = null;
    let pathFound = false;

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      currentId = [...openSet].reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);
      
      if (currentId === endNode._id.toString()) {
        pathFound = true;
        break;
      }
      
      openSet.delete(currentId);
      
      const neighbors = adjacencyList.get(currentId) || [];
      for (let neighbor of neighbors) {
        const tentativeGScore = gScore.get(currentId) + neighbor.weight;
        
        if (tentativeGScore < gScore.get(neighbor.target)) {
          cameFrom.set(neighbor.target, currentId);
          gScore.set(neighbor.target, tentativeGScore);
          fScore.set(neighbor.target, tentativeGScore + heuristic(neighbor.target, endNode._id.toString()));
          if (!openSet.has(neighbor.target)) {
            openSet.add(neighbor.target);
          }
        }
      }
    }
    
    if (!pathFound) {
      return res.status(404).json({ error: 'No path found between these locations' });
    }
    
    // 4. Reconstruct Path
    const path = [];
    let curr = endNode._id.toString();
    while (cameFrom.has(curr)) {
      path.unshift(nodes.find(n => n._id.toString() === curr));
      curr = cameFrom.get(curr);
    }
    path.unshift(startNode);
    
    res.json({
      path,
      totalDistance: gScore.get(endNode._id.toString()),
      estimatedTimeMins: Math.ceil(gScore.get(endNode._id.toString()) / 80) // rough estimate, 80 units per min
    });
    
  } catch(err) { res.status(500).json({ error: err.message }); }
});

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('krishna06', 10);
    await User.findOneAndUpdate(
      { email: 'krishna@gmail.com' },
      { 
        name: 'Admin Krishna',
        password: hashedPassword,
        role: 'admin',
        status: 'Approved'
      },
      { upsert: true, new: true }
    );
    console.log('Admin user seeded/updated.');
  } catch(err) { console.error('Seeding error:', err); }
};
seedAdmin();

const seedDepartments = async () => {
  try {
    const defaultDepartments = [
      'Emergency Department (ED)',
      'Outpatient Department (OPD)',
      'Inpatient Department (IPD)',
      'Intensive Care Unit (ICU)',
      'Operation Theatre (OT)',
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Gynecology & Obstetrics',
      'Dermatology',
      'Psychiatry',
      'Radiology',
      'Pathology',
      'Pharmacy',
      'Ophthalmology',
      'Gastroenterology',
      'Oncology',
      'ENT (Ear, Nose & Throat)',
      'Dental Care'
    ];

    for (const name of defaultDepartments) {
      await Department.findOneAndUpdate(
        { name },
        { name, hodName: 'Pending' },
        { upsert: true, new: true }
      );
    }
    console.log('Hospital departments synchronized.');
  } catch (err) {
    console.error('Seeding departments error:', err);
  }
};
seedDepartments();

app.listen(PORT, () => console.log(`Backend Server running on port ${PORT} (MongoDB Atlas connected)`));
