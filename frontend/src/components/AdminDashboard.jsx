import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import axios from 'axios';

const AdminDashboard = ({ user, activeTab, setActiveTab, logout, goToHome, goToMap, stats, appointments, bills, fetchAdminBills, token }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisCharge, setDiagnosisCharge] = useState(0);
  const [patientId, setPatientId] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHod, setNewDeptHod] = useState('');
  
  const [grievances, setGrievances] = useState([]);
  
  const [expenses, setExpenses] = useState([]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [selectedViewDept, setSelectedViewDept] = useState('All');

  const [bedRequests, setBedRequests] = useState([]);

  const minimalCharge = 50; // Minimal fixed charge

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsersList(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSalaries = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/salaries', { headers: { Authorization: `Bearer ${token}` } });
      setSalaryHistory(res.data);
    } catch (err) {
      console.error('Error fetching salaries:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } });
      setDepartments(res.data);
    } catch (err) {}
  };

  const fetchGrievances = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/grievances', { headers: { Authorization: `Bearer ${token}` } });
      setGrievances(res.data);
    } catch (err) {}
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/expenses', { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data);
    } catch (err) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/audit', { headers: { Authorization: `Bearer ${token}` } });
      setAuditLogs(res.data);
    } catch (err) {}
  };

  const fetchBedRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bed-requests', { headers: { Authorization: `Bearer ${token}` } });
      setBedRequests(res.data);
    } catch(err) {}
  };

  useEffect(() => {
    if (activeTab === 'Users' || activeTab === 'Pending Approvals' || activeTab === 'Doctor Availability' || activeTab === 'Salaries' || activeTab === 'Departments') {
      fetchUsers();
    }
    if (activeTab === 'Salaries') fetchSalaries();
    if (activeTab === 'Departments') fetchDepartments();
    if (activeTab === 'Grievances') fetchGrievances();
    if (activeTab === 'Expenses') fetchExpenses();
    if (activeTab === 'Audit Logs') fetchAuditLogs();
    if (activeTab === 'Beds') fetchBedRequests();
  }, [activeTab]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('User removed successfully!');
      fetchUsers();
    } catch (err) {
      alert('Error removing user');
    }
  };

  const handleApproveUser = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('User approved successfully!');
      fetchUsers();
    } catch (err) {
      alert('Error approving user');
    }
  };

  const handleRejectUser = async (id) => {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('User rejected successfully!');
      fetchUsers();
    } catch (err) {
      alert('Error rejecting user');
    }
  };

  const handleUpdateAvailability = async (id) => {
    const newAvail = prompt('Enter new availability for doctor:');
    if (newAvail === null) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/availability`, { availability: newAvail }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Availability updated!');
      fetchUsers();
    } catch (err) {
      alert('Error updating availability');
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      const items = [
        { description: 'Minimal Charge', cost: minimalCharge },
        { description: `Diagnosis: ${diagnosis}`, cost: Number(diagnosisCharge) }
      ];
      await axios.post('http://localhost:5000/api/admin/bills', { patientId, items }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Bill generated successfully!');
      fetchAdminBills();
      setDiagnosis('');
      setDiagnosisCharge(0);
      setPatientId('');
    } catch (err) {
      alert('Error generating bill');
    }
  };

  const handlePaySalary = async (userId) => {
    const amount = prompt('Enter salary amount ($):');
    if (!amount) return;
    const month = prompt('Enter month (e.g., April 2026):');
    if (!month) return;

    try {
      await axios.post('http://localhost:5000/api/admin/salaries', { userId, amount: Number(amount), month }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Salary paid successfully!');
      fetchSalaries();
    } catch (err) {
      alert('Error paying salary');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/departments', { name: newDeptName, hodName: newDeptHod }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Department created');
      setNewDeptName('');
      setNewDeptHod('');
      fetchDepartments();
    } catch (err) { alert('Error creating department'); }
  };

  const handleUpdateHod = async (deptId, hodName) => {
    if (!hodName) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/departments/${deptId}/hod`, { hodName }, { headers: { Authorization: `Bearer ${token}` } });
      alert('HOD updated successfully!');
      fetchDepartments();
    } catch (err) { alert('Error updating HOD'); }
  };

  const handleAssignStaff = async (id) => {
    const staffName = prompt('Enter staff name to assign:');
    if(!staffName) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/grievances/${id}/assign`, { staffName }, { headers: { Authorization: `Bearer ${token}` } });
      fetchGrievances();
    } catch(err) { alert('Error'); }
  };

  const handleResolveGrievance = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/grievances/${id}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchGrievances();
    } catch(err) { alert('Error'); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/expenses', { description: expenseDesc, amount: expenseAmount }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenseDesc('');
      setExpenseAmount('');
      fetchExpenses();
    } catch (err) { alert('Error'); }
  };

  const updateBedRequestStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bed-requests/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchBedRequests();
    } catch(err) {
      alert('Error updating status');
    }
  };

  return (
    <>
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="logo">MediVerse (Admin)</div>
        <ul className="nav-links">
          <li className={activeTab === 'Dashboard' ? 'active' : ''} onClick={() => setActiveTab('Dashboard')}>Dashboard</li>
          <li className={activeTab === 'Users' ? 'active' : ''} onClick={() => setActiveTab('Users')}>User Management</li>
          <li className={activeTab === 'Pending Approvals' ? 'active' : ''} onClick={() => setActiveTab('Pending Approvals')}>Pending Approvals</li>
          <li className={activeTab === 'Doctor Availability' ? 'active' : ''} onClick={() => setActiveTab('Doctor Availability')}>Doctor Availability</li>
          <li className={activeTab === 'Appointments' ? 'active' : ''} onClick={() => setActiveTab('Appointments')}>Appointments</li>
          <li className={activeTab === 'Bills' ? 'active' : ''} onClick={() => setActiveTab('Bills')}>Bills</li>
          <li className={activeTab === 'Salaries' ? 'active' : ''} onClick={() => setActiveTab('Salaries')}>Salaries</li>
          <li className={activeTab === 'Departments' ? 'active' : ''} onClick={() => setActiveTab('Departments')}>Departments</li>
          <li className={activeTab === 'Grievances' ? 'active' : ''} onClick={() => setActiveTab('Grievances')}>Grievances</li>
          <li className={activeTab === 'Expenses' ? 'active' : ''} onClick={() => setActiveTab('Expenses')}>Expenses</li>
          <li className={activeTab === 'Audit Logs' ? 'active' : ''} onClick={() => setActiveTab('Audit Logs')}>Audit Logs</li>
          <li className={activeTab === 'Beds' ? 'active' : ''} onClick={() => setActiveTab('Beds')}>Beds</li>
          <li className={activeTab === 'Pharmacy' ? 'active' : ''} onClick={() => setActiveTab('Pharmacy')}>Pharmacy</li>
          <li className={activeTab === 'My Profile' ? 'active' : ''} onClick={() => setActiveTab('My Profile')}>My Profile</li>
          <li onClick={goToMap} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#3b82f6' }}>📍 Indoor Map</li>
        </ul>
        <button onClick={logout} className="logout-btn">Logout</button>
      </nav>
      <main className="main-content">
        <header className="dashboard-header">
          <h2>Welcome, {user?.name}</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <span className="role-badge">{user?.role}</span>
            <button onClick={() => setActiveTab('My Profile')} className="btn outline-btn" title="My Profile" style={{padding: '8px', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', borderColor: 'var(--border-color)', background: 'var(--surface-color)'}}>
              👤
            </button>
            <button onClick={goToHome} className="btn outline-btn" style={{padding: '8px 15px', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}>Home Page</button>
            <button onClick={logout} className="btn primary-btn" style={{padding: '8px 15px'}}>Switch User</button>
          </div>
        </header>
        
        <section className="dashboard-widgets">
          {activeTab === 'Dashboard' && stats && (
            <div className="stats-grid">
              <div className="stat-card"><h3>Total Patients</h3><p>{stats.totalPatients}</p></div>
              <div className="stat-card"><h3>Total Doctors</h3><p>{stats.totalDoctors}</p></div>
              <div className="stat-card"><h3>Appointments</h3><p>{stats.totalAppointments}</p></div>
            </div>
          )}

          {activeTab === 'Users' && (
             <div>
               <div className="header-row">
                   <h2>User Management</h2>
               </div>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                    <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{background: '#f8fafc'}}>
                                <th style={{padding: '10px'}}>Name</th>
                                <th style={{padding: '10px'}}>Email</th>
                                <th style={{padding: '10px'}}>Role</th>
                                <th style={{padding: '10px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.length === 0 && <tr><td colSpan="4" style={{padding: '10px'}}>No users found.</td></tr>}
                            {usersList.filter(u => u.status === 'Approved' || !u.status).map(u => (
                               <tr key={u._id} style={{borderBottom: '1px solid #eee'}}>
                                   <td style={{padding: '10px'}}>{u.name}</td>
                                   <td style={{padding: '10px'}}>{u.email}</td>
                                   <td style={{padding: '10px', textTransform: 'capitalize'}}>{u.role}</td>
                                   <td style={{padding: '10px'}}>
                                       {u.role !== 'admin' && (
                                         <button onClick={() => handleDeleteUser(u._id)} className="btn primary-btn" style={{padding: '5px 10px', background: '#ef4444'}}>Remove</button>
                                       )}
                                   </td>
                               </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {activeTab === 'Pending Approvals' && (
             <div>
               <div className="header-row">
                   <h2>Pending Professional Verifications</h2>
               </div>
               <p style={{color: '#64748b', marginTop: '10px'}}>Review licenses and certificates before granting system access.</p>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                    <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{background: '#f8fafc'}}>
                                <th style={{padding: '10px'}}>Name</th>
                                <th style={{padding: '10px'}}>Role</th>
                                <th style={{padding: '10px'}}>License / ID</th>
                                <th style={{padding: '10px'}}>Certificate Link</th>
                                <th style={{padding: '10px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.filter(u => u.status === 'Pending').length === 0 && <tr><td colSpan="5" style={{padding: '10px'}}>No pending approvals.</td></tr>}
                            {usersList.filter(u => u.status === 'Pending').map(u => (
                               <tr key={u._id} style={{borderBottom: '1px solid #eee'}}>
                                   <td style={{padding: '10px'}}>
                                      <strong>{u.name}</strong><br/>
                                      <small style={{color: '#64748b'}}>{u.email}</small>
                                   </td>
                                   <td style={{padding: '10px', textTransform: 'capitalize'}}>{u.role}</td>
                                   <td style={{padding: '10px', fontWeight: '500'}}>{u.licenseNumber || 'N/A'}</td>
                                   <td style={{padding: '10px'}}>
                                      <a href={u.certificateUrl || '#'} target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6'}}>View Document</a>
                                   </td>
                                   <td style={{padding: '10px'}}>
                                       <button onClick={() => handleApproveUser(u._id)} className="btn primary-btn" style={{padding: '5px 10px', background: '#10b981', borderColor: '#10b981', marginRight: '5px'}}>Approve</button>
                                       <button onClick={() => handleRejectUser(u._id)} className="btn outline-btn" style={{padding: '5px 10px', color: '#ef4444', borderColor: '#ef4444'}}>Reject</button>
                                   </td>
                               </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {activeTab === 'Doctor Availability' && (
             <div>
               <div className="header-row">
                   <h2>Doctor Availability</h2>
               </div>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                    <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{background: '#f8fafc'}}>
                                <th style={{padding: '10px'}}>Doctor Name</th>
                                <th style={{padding: '10px'}}>Email</th>
                                <th style={{padding: '10px'}}>Current Availability</th>
                                <th style={{padding: '10px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.filter(u => u.role === 'doctor').length === 0 && <tr><td colSpan="4" style={{padding: '10px'}}>No doctors found.</td></tr>}
                            {usersList.filter(u => u.role === 'doctor').map(u => (
                               <tr key={u._id} style={{borderBottom: '1px solid #eee'}}>
                                   <td style={{padding: '10px'}}>Dr. {u.name}</td>
                                   <td style={{padding: '10px'}}>{u.email}</td>
                                   <td style={{padding: '10px'}}>
                                      <span style={{fontWeight: '500', color: u.availability ? '#0f172a' : '#64748b'}}>
                                        {u.availability || 'Not Set'}
                                      </span>
                                   </td>
                                   <td style={{padding: '10px'}}>
                                      <button onClick={() => handleUpdateAvailability(u._id)} className="btn outline-btn" style={{padding: '5px 10px'}}>Edit Status</button>
                                   </td>
                               </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {activeTab === 'Appointments' && (
            <div>
              <div className="header-row">
                  <h2>Appointment Management</h2>
              </div>
              <div className="table-container glass-panel">
                <h3>All Appointments</h3>
                <div style={{marginTop: '20px'}}>
                  {appointments.length === 0 ? <p>No appointments found.</p> : (
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                      <thead>
                        <tr style={{background: '#f8fafc', textAlign: 'left'}}>
                            <th style={{padding: '10px'}}>Patient</th>
                            <th style={{padding: '10px'}}>Doctor</th>
                            <th style={{padding: '10px'}}>Date</th>
                            <th style={{padding: '10px'}}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                      {appointments.map(a => (
                        <tr key={a._id} style={{borderBottom: '1px solid #e2e8f0'}}>
                           <td style={{padding: '10px'}}>{a.patientId?.name || 'Unknown'}</td>
                           <td style={{padding: '10px'}}>Dr. {a.doctorId?.name || 'Unknown'}</td>
                           <td style={{padding: '10px'}}>{new Date(a.date).toLocaleDateString()}</td>
                           <td style={{padding: '10px'}}><strong>{a.status}</strong></td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Bills' && (
            <div>
              <div className="header-row">
                  <h2>Patient Billing</h2>
              </div>
              <div className="glass-panel card" style={{marginBottom: '20px'}}>
                  <h3>Generate New Bill</h3>
                  <form onSubmit={handleGenerateBill} className="grid-form" style={{display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap'}}>
                      <input type="text" placeholder="Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} required style={{padding: '10px', borderRadius: '5px', flex: '1 1 200px'}} />
                      <input type="text" placeholder="Diagnosis" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required style={{padding: '10px', borderRadius: '5px', flex: '2 1 300px'}} />
                      <input type="number" placeholder="Diagnosis Charge ($)" value={diagnosisCharge} onChange={e => setDiagnosisCharge(e.target.value)} required style={{padding: '10px', borderRadius: '5px', flex: '1 1 150px'}} />
                      <div style={{padding: '10px', background: '#f8fafc', borderRadius: '5px', display: 'flex', alignItems: 'center'}}>
                          <small>+ Minimal Charge: ${minimalCharge}</small>
                      </div>
                      <button type="submit" className="btn primary-btn" style={{padding: '10px'}}>Generate</button>
                  </form>
              </div>

              <div className="table-container glass-panel">
                <h3>All Generated Bills</h3>
                <div style={{marginTop: '20px'}}>
                  {(!bills || bills.length === 0) ? <p>No bills generated yet.</p> : (
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                      <thead>
                        <tr style={{background: '#f8fafc', textAlign: 'left'}}>
                            <th style={{padding: '10px'}}>Patient</th>
                            <th style={{padding: '10px'}}>Items</th>
                            <th style={{padding: '10px'}}>Total</th>
                            <th style={{padding: '10px'}}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                      {bills.map(b => (
                        <tr key={b._id} style={{borderBottom: '1px solid #e2e8f0'}}>
                           <td style={{padding: '10px'}}>{b.patient?.name || b.patientId}</td>
                           <td style={{padding: '10px'}}>{b.items.map(i => i.description).join(', ')}</td>
                           <td style={{padding: '10px'}}>${b.total}</td>
                           <td style={{padding: '10px'}}><strong style={{color: b.status === 'Paid' ? 'green' : 'red'}}>{b.status}</strong></td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Salaries' && (
             <div>
               <div className="header-row">
                   <h2>Staff & Doctor Salaries</h2>
               </div>
               
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                    <h3>Pay Salary</h3>
                    <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px'}}>
                        <thead>
                            <tr style={{background: '#f8fafc'}}>
                                <th style={{padding: '10px'}}>Name</th>
                                <th style={{padding: '10px'}}>Role</th>
                                <th style={{padding: '10px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.filter(u => u.role === 'doctor' || u.role === 'staff').length === 0 && <tr><td colSpan="3" style={{padding: '10px'}}>No staff or doctors found.</td></tr>}
                            {usersList.filter(u => u.role === 'doctor' || u.role === 'staff').map(u => (
                               <tr key={u._id} style={{borderBottom: '1px solid #eee'}}>
                                   <td style={{padding: '10px'}}>{u.name}</td>
                                   <td style={{padding: '10px', textTransform: 'capitalize'}}>{u.role}</td>
                                   <td style={{padding: '10px'}}>
                                       <button onClick={() => handlePaySalary(u._id)} className="btn primary-btn" style={{padding: '5px 10px'}}>Pay Salary</button>
                                   </td>
                               </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

               <div className="table-container glass-panel" style={{marginTop: '20px'}}>
                    <h3>Salary Payment History</h3>
                    {salaryHistory.length === 0 ? <p style={{marginTop: '10px'}}>No salary payments recorded yet.</p> : (
                      <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px'}}>
                          <thead>
                              <tr style={{background: '#f8fafc'}}>
                                  <th style={{padding: '10px'}}>Date</th>
                                  <th style={{padding: '10px'}}>Name</th>
                                  <th style={{padding: '10px'}}>Role</th>
                                  <th style={{padding: '10px'}}>Month</th>
                                  <th style={{padding: '10px'}}>Amount</th>
                                  <th style={{padding: '10px'}}>Status</th>
                              </tr>
                          </thead>
                          <tbody>
                              {salaryHistory.map(s => (
                                 <tr key={s._id} style={{borderBottom: '1px solid #eee'}}>
                                     <td style={{padding: '10px'}}>{new Date(s.date).toLocaleDateString()}</td>
                                     <td style={{padding: '10px'}}>{s.user?.name || 'Unknown'}</td>
                                     <td style={{padding: '10px', textTransform: 'capitalize'}}>{s.user?.role || 'Unknown'}</td>
                                     <td style={{padding: '10px'}}>{s.month}</td>
                                     <td style={{padding: '10px', fontWeight: 'bold'}}>${s.amount}</td>
                                     <td style={{padding: '10px', color: 'green'}}><strong>{s.status}</strong></td>
                                 </tr>
                              ))}
                          </tbody>
                      </table>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'Beds' && (
             <div>
               <div className="header-row">
                   <h2>Bed Management & Requests</h2>
               </div>
               <div className="stats-grid" style={{marginTop: '15px'}}>
                 <div className="stat-card">
                   <h4>Available Beds</h4>
                   <p style={{fontSize: '24px', marginTop: '10px'}}>Normal: 15 | AC: 5 | Deluxe: 2</p>
                 </div>
                 <div className="stat-card">
                   <h4>Occupied Beds</h4>
                   <p style={{fontSize: '24px', marginTop: '10px'}}>Total: 8</p>
                 </div>
               </div>

               <div className="glass-panel card" style={{marginBottom: '20px', marginTop: '20px'}}>
                 <h3>Direct Bed Assignment</h3>
                 <form className="grid-form" style={{display: 'flex', gap: '10px', marginTop: '10px'}} onSubmit={async (e) => {
                   e.preventDefault();
                   const pid = e.target.pid.value;
                   const btype = e.target.btype.value;
                   try {
                     await axios.post('http://localhost:5000/api/bed-requests', { bedType: btype, patientId: pid, patientName: pid }, { headers: { Authorization: `Bearer ${token}` } });
                     alert('Bed assigned successfully!');
                     fetchBedRequests();
                     e.target.reset();
                   } catch(err) { alert('Error assigning bed'); }
                 }}>
                   <input type="text" name="pid" placeholder="Patient Name / ID" required style={{padding: '10px', borderRadius: '5px', flex: 1}} />
                   <select name="btype" required style={{padding: '10px', borderRadius: '5px', flex: 1}}>
                     <option value="" disabled selected>Select Bed Type</option>
                     <option value="Normal">Normal</option>
                     <option value="AC">AC</option>
                     <option value="Deluxe">Deluxe</option>
                   </select>
                   <button type="submit" className="btn primary-btn" style={{padding: '10px'}}>Assign</button>
                 </form>
               </div>

               <div className="table-container glass-panel" style={{marginTop: '20px'}}>
                 <h3>Patient Bed Requests</h3>
                 <div style={{marginTop: '20px'}}>
                   {bedRequests.length === 0 ? <p>No bed requests found.</p> : (
                     <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                       <thead>
                         <tr style={{textAlign: 'left', background: '#f8fafc'}}>
                             <th style={{padding: '10px'}}>Date</th>
                             <th style={{padding: '10px'}}>Patient</th>
                             <th style={{padding: '10px'}}>Bed Type</th>
                             <th style={{padding: '10px'}}>Status</th>
                             <th style={{padding: '10px'}}>Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                       {bedRequests.map(br => (
                         <tr key={br._id} style={{borderBottom: '1px solid #e2e8f0'}}>
                            <td style={{padding: '10px'}}>{new Date(br.date).toLocaleDateString()}</td>
                            <td style={{padding: '10px', fontWeight: '500'}}>{br.patientName || br.patientId?.name || 'Unknown'}</td>
                            <td style={{padding: '10px'}}>{br.bedType}</td>
                            <td style={{padding: '10px'}}>
                              <strong style={{color: br.status === 'Pending' ? '#f59e0b' : (br.status === 'Approved' ? '#10b981' : '#ef4444')}}>
                                {br.status}
                              </strong>
                            </td>
                            <td style={{padding: '10px'}}>
                              {br.status === 'Pending' && (
                                <>
                                  <button className="btn outline-btn" style={{padding: '5px 10px', fontSize: '12px', marginRight: '5px', borderColor: '#10b981', color: '#10b981'}} onClick={() => updateBedRequestStatus(br._id, 'Approved')}>Approve</button>
                                  <button className="btn outline-btn" style={{padding: '5px 10px', fontSize: '12px', borderColor: '#ef4444', color: '#ef4444'}} onClick={() => updateBedRequestStatus(br._id, 'Rejected')}>Reject</button>
                                </>
                              )}
                            </td>
                         </tr>
                       ))}
                       </tbody>
                     </table>
                   )}
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'Pharmacy' && (
             <div>
               <div className="header-row">
                   <h2>Pharmacy Inventory</h2>
               </div>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                    <table style={{width: '100%', textAlign: 'left'}}>
                        <thead>
                            <tr style={{background: '#f8fafc'}}>
                                <th style={{padding: '10px'}}>Medicine Name</th>
                                <th style={{padding: '10px'}}>Price</th>
                                <th style={{padding: '10px'}}>Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>Paracetamol</td>
                                <td style={{padding: '10px'}}>$5.00</td>
                                <td style={{padding: '10px'}}>In Stock</td>
                            </tr>
                            <tr style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>Amoxicillin</td>
                                <td style={{padding: '10px'}}>$12.00</td>
                                <td style={{padding: '10px'}}>Low Stock</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {activeTab === 'Departments' && (
             <div>
               <div className="header-row">
                   <h2>Department & Ward Configuration</h2>
               </div>
               <div className="glass-panel card" style={{marginBottom: '20px', marginTop: '15px'}}>
                   <h3>Create New Department</h3>
                   <form onSubmit={handleAddDepartment} className="grid-form" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                       <input type="text" placeholder="Department Name" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} required style={{padding: '10px', borderRadius: '5px', flex: 1}} />
                       <select value={newDeptHod} onChange={e => setNewDeptHod(e.target.value)} required style={{padding: '10px', borderRadius: '5px', flex: 1}}>
                           <option value="" disabled>Select Head of Department</option>
                           {usersList.filter(u => u.role === 'doctor').map(d => (
                               <option key={d._id} value={d.name}>Dr. {d.name}</option>
                           ))}
                       </select>
                       <button type="submit" className="btn primary-btn" style={{padding: '10px'}}>Create</button>
                   </form>
               </div>
               <div className="glass-panel card" style={{marginBottom: '20px'}}>
                   <h3>View Department Details</h3>
                   <select 
                       value={selectedViewDept} 
                       onChange={e => setSelectedViewDept(e.target.value)} 
                       style={{padding: '10px', borderRadius: '5px', width: '100%', marginTop: '10px', background: '#fff', border: '1px solid #cbd5e1'}}
                   >
                       <option value="All">Show All Departments</option>
                       {departments.map(d => (
                           <option key={d._id} value={d._id}>{d.name}</option>
                       ))}
                   </select>
               </div>

               <div style={{marginTop: '20px'}}>
                 {departments.length === 0 && <p>No departments configured.</p>}
                 {departments.filter(d => selectedViewDept === 'All' || d._id === selectedViewDept).map(d => {
                   const deptDoctors = usersList.filter(u => u.role === 'doctor' && u.department === d.name);
                   return (
                     <div key={d._id} className="glass-panel card" style={{marginBottom: '20px'}}>
                       <div style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                         <h3 style={{margin: '0', fontSize: '20px', color: '#0f172a'}}>{d.name}</h3>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span style={{background: '#e2e8f0', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', color: '#334155'}}>
                              HOD: {d.hodName}
                            </span>
                            <select 
                              onChange={(e) => handleUpdateHod(d._id, e.target.value)}
                              style={{padding: '5px', borderRadius: '10px', fontSize: '12px', border: '1px solid #cbd5e1', background: '#fff'}}
                              defaultValue=""
                            >
                              <option value="" disabled>Change HOD</option>
                              {usersList.filter(u => u.role === 'doctor').map(doc => (
                                <option key={doc._id} value={doc.name}>Dr. {doc.name}</option>
                              ))}
                            </select>
                          </div>
                       </div>
                       {deptDoctors.length > 0 && (
                         <>
                           <h4 style={{marginBottom: '10px', color: '#475569'}}>Doctors Profile:</h4>
                           <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                             {deptDoctors.map(doc => (
                               <div key={doc._id} style={{padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', flex: '1 1 250px', background: '#f8fafc'}}>
                                   <strong style={{fontSize: '16px', display: 'block', color: '#0f172a'}}>Dr. {doc.name}</strong>
                                   <p style={{margin: '5px 0 0 0', fontSize: '14px', color: '#64748b'}}>{doc.email}</p>
                                   <p style={{margin: '5px 0 0 0', fontSize: '14px', color: doc.availability === 'On Leave' ? '#ef4444' : '#10b981', fontWeight: '500'}}>{doc.availability}</p>
                               </div>
                             ))}
                           </div>
                         </>
                       )}
                     </div>
                   );
                 })}
               </div>
             </div>
          )}

          {activeTab === 'Grievances' && (
             <div>
               <div className="header-row">
                   <h2>Patient Grievance & Feedback Desk</h2>
               </div>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                 <table style={{width: '100%', textAlign: 'left'}}>
                     <thead>
                         <tr style={{background: '#f8fafc'}}>
                             <th style={{padding: '10px'}}>Patient</th>
                             <th style={{padding: '10px'}}>Complaint / Feedback</th>
                             <th style={{padding: '10px'}}>Status</th>
                             <th style={{padding: '10px'}}>Assigned Staff</th>
                             <th style={{padding: '10px'}}>Actions</th>
                         </tr>
                     </thead>
                     <tbody>
                         {grievances.length === 0 && <tr><td colSpan="5" style={{padding: '10px'}}>No grievances found.</td></tr>}
                         {grievances.map(g => (
                            <tr key={g._id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>{g.patientName}</td>
                                <td style={{padding: '10px'}}>{g.complaint}</td>
                                <td style={{padding: '10px'}}>
                                  <strong style={{color: g.status === 'Resolved' ? 'green' : 'orange'}}>{g.status}</strong>
                                </td>
                                <td style={{padding: '10px'}}>{g.assignedStaffName || <span style={{color:'#888'}}>None</span>}</td>
                                <td style={{padding: '10px'}}>
                                   {g.status !== 'Resolved' && (
                                     <>
                                       <button onClick={() => handleAssignStaff(g._id)} className="btn outline-btn" style={{padding: '5px 10px', marginRight: '5px'}}>Assign Staff</button>
                                       <button onClick={() => handleResolveGrievance(g._id)} className="btn primary-btn" style={{padding: '5px 10px'}}>Resolve</button>
                                     </>
                                   )}
                                </td>
                            </tr>
                         ))}
                     </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'Expenses' && (
             <div>
               <div className="header-row">
                   <h2>Expense Tracking & Financials</h2>
               </div>
               
               <div className="stats-grid" style={{marginTop: '15px'}}>
                  <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p style={{color: 'green'}}>${bills?.reduce((acc, curr) => acc + (curr.status === 'Paid' ? curr.total : 0), 0) || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Salaries Paid</h3>
                    <p style={{color: 'orange'}}>${salaryHistory?.reduce((acc, curr) => acc + curr.amount, 0) || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Expenses</h3>
                    <p style={{color: 'red'}}>${expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0}</p>
                  </div>
               </div>

               <div className="glass-panel card" style={{marginBottom: '20px', marginTop: '20px'}}>
                   <h3>Log New Expense</h3>
                   <form onSubmit={handleAddExpense} className="grid-form" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                       <input type="text" placeholder="Expense Description (e.g. Electricity, Equipment)" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required style={{padding: '10px', borderRadius: '5px', flex: 2}} />
                       <input type="number" placeholder="Amount ($)" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required style={{padding: '10px', borderRadius: '5px', flex: 1}} />
                       <button type="submit" className="btn primary-btn" style={{padding: '10px'}}>Add Expense</button>
                   </form>
               </div>

               <div className="table-container glass-panel">
                 <h3>Hospital Expenses Ledger</h3>
                 <table style={{width: '100%', textAlign: 'left', marginTop: '10px'}}>
                     <thead>
                         <tr style={{background: '#f8fafc'}}>
                             <th style={{padding: '10px'}}>Date</th>
                             <th style={{padding: '10px'}}>Description</th>
                             <th style={{padding: '10px'}}>Amount</th>
                         </tr>
                     </thead>
                     <tbody>
                         {expenses.length === 0 && <tr><td colSpan="3" style={{padding: '10px'}}>No expenses recorded.</td></tr>}
                         {expenses.map(e => (
                            <tr key={e._id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>{new Date(e.date).toLocaleDateString()}</td>
                                <td style={{padding: '10px'}}>{e.description}</td>
                                <td style={{padding: '10px', fontWeight: 'bold'}}>${e.amount}</td>
                            </tr>
                         ))}
                     </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'Audit Logs' && (
             <div>
               <div className="header-row">
                   <h2>Audit Trails & Activity Logs</h2>
               </div>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                 <table style={{width: '100%', textAlign: 'left'}}>
                     <thead>
                         <tr style={{background: '#f8fafc'}}>
                             <th style={{padding: '10px'}}>Timestamp</th>
                             <th style={{padding: '10px'}}>User (Action By)</th>
                             <th style={{padding: '10px'}}>Action Performed</th>
                         </tr>
                     </thead>
                     <tbody>
                         {auditLogs.length === 0 && <tr><td colSpan="3" style={{padding: '10px'}}>No logs found.</td></tr>}
                         {auditLogs.map(log => (
                            <tr key={log._id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{padding: '10px'}}>{log.userName}</td>
                                <td style={{padding: '10px'}}>{log.action}</td>
                            </tr>
                         ))}
                     </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'My Profile' && (
             <div>
               <div className="header-row"><h2>My Profile</h2></div>
               <div className="glass-panel card" style={{marginTop: '15px'}}>
                 <p style={{marginBottom: '10px'}}><strong>Name:</strong> {user?.name}</p>
                 <p style={{marginBottom: '10px'}}><strong>Email:</strong> {user?.email}</p>
                 <p style={{marginBottom: '10px'}}><strong>Role:</strong> Administrator</p>
               </div>
             </div>
          )}
        </section>
      </main>
    </div>
    <Footer />
    </>
  );
};

export default AdminDashboard;
