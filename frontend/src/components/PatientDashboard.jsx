import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import axios from 'axios';

const PatientDashboard = ({ user, activeTab, setActiveTab, logout, goToHome, doctors, bookAppointment, appointments }) => {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Profile & Dependents
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState(user?.insuranceProvider || '');
  const [insuranceId, setInsuranceId] = useState(user?.insuranceId || '');
  
  const [dependentName, setDependentName] = useState('');
  const [dependentAge, setDependentAge] = useState('');
  const [dependentRelation, setDependentRelation] = useState('');

  // Billing
  const [bills, setBills] = useState([]);
  
  // Messaging
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageDoctor, setMessageDoctor] = useState('');

  // Bed Requests
  const [bedRequests, setBedRequests] = useState([]);
  const [patientBedType, setPatientBedType] = useState('');

  // Departments
  const [adminDepartments, setAdminDepartments] = useState([]);

  // AI Triage
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState([]);

  // Feedback
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bills', { headers: { Authorization: `Bearer ${token}` } });
      setBills(res.data);
    } catch(err) {}
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/messages', { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch(err) {}
  };

  const fetchBedRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bed-requests', { headers: { Authorization: `Bearer ${token}` } });
      setBedRequests(res.data);
    } catch(err) {}
  };

  const fetchAdminDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/departments', { headers: { Authorization: `Bearer ${token}` } });
      setAdminDepartments(res.data);
    } catch(err) {}
  };

  useEffect(() => {
    if (activeTab === 'Billing') fetchBills();
    if (activeTab === 'Messaging') fetchMessages();
    if (activeTab === 'Beds') fetchBedRequests();
    if (activeTab === 'Departments' || activeTab === 'Appointments' || activeTab === 'Dashboard') fetchAdminDepartments();
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/users/profile', 
        { name: profileName, password: profilePassword, insuranceProvider, insuranceId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (err) { alert('Error updating profile'); }
  };

  const handleAddDependent = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/users/dependents', { name: dependentName, age: dependentAge, relation: dependentRelation }, { headers: { Authorization: `Bearer ${token}` } });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert('Dependent added successfully! You can now manage their healthcare.');
        setDependentName(''); setDependentAge(''); setDependentRelation('');
        window.location.reload();
    } catch(e) { alert('Error adding dependent'); }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/appointments/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
        alert('Appointment cancelled.');
        window.location.reload(); 
    } catch(e) { alert('Error cancelling'); }
  };

  const handleRescheduleAppointment = async (id) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    if (!newDate) return;
    try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/appointments/${id}/reschedule`, { date: newDate }, { headers: { Authorization: `Bearer ${token}` } });
        alert('Appointment rescheduled.');
        window.location.reload();
    } catch(e) { alert('Error rescheduling'); }
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;
    
    setAiChat(prev => [...prev, { sender: 'Patient', text: aiMessage }]);
    const lowerMsg = aiMessage.toLowerCase();
    let aiResponse = "Based on your symptoms, I recommend seeing a General Physician. You can book an appointment in the Appointments tab.";
    
    if (lowerMsg.includes('chest pain') || lowerMsg.includes('bleeding') || lowerMsg.includes('stroke') || lowerMsg.includes('breath')) {
        aiResponse = "🚨 CRITICAL ALERT: Your symptoms indicate a potential medical emergency! Please call Emergency Services (e.g. 911) immediately or proceed to the nearest ER. Do not wait for a standard booking.";
    } else if (lowerMsg.includes('headache') || lowerMsg.includes('vision') || lowerMsg.includes('migraine')) {
        aiResponse = "I recommend booking an appointment with the Neurology department. I've highlighted this in your booking options.";
    } else if (lowerMsg.includes('bone') || lowerMsg.includes('joint') || lowerMsg.includes('pain')) {
        aiResponse = "I recommend consulting the Orthopedics department. You can book an appointment from the dashboard.";
    }
    
    setTimeout(() => setAiChat(prev => [...prev, { sender: 'AI', text: aiResponse }]), 1000);
    setAiMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage || !messageDoctor) return;
    try {
        const token = localStorage.getItem('token');
        await axios.post('/api/messages', { receiverId: messageDoctor, text: newMessage }, { headers: { Authorization: `Bearer ${token}` } });
        setNewMessage('');
        fetchMessages();
        
        // Auto-responder logic (mocking doctor response)
        const hour = new Date().getHours();
        if (hour < 9 || hour > 17) {
            setTimeout(() => {
                 axios.post('/api/messages', { receiverId: user._id, text: "AUTO-REPLY: The doctor is currently out of office (Hours: 9 AM - 5 PM). Your message will be reviewed on the next business day. If this is an emergency, please contact the Emergency Desk." }, { headers: { Authorization: `Bearer ${token}` } }).then(fetchMessages);
            }, 1000);
        }
    } catch(e) { alert('Error sending message'); }
  };

  const departments = adminDepartments.length > 0
    ? adminDepartments.map(d => d.name)
    : (doctors.length > 0
      ? [...new Set(doctors.map(d => d.department || 'General Medicine'))]
      : []);

  const filteredDoctors = selectedDept
    ? doctors.filter(d => (d.department || 'General Medicine') === selectedDept)
    : doctors;

  const hasBackendDoctors = doctors.length > 0;
  const displayedAppointments = appointments || [];

  const handleBedRequest = async () => {
    if (!patientBedType) {
        alert('Please select a bed type');
        return;
    }
    try {
        const token = localStorage.getItem('token');
        await axios.post('/api/bed-requests', { bedType: patientBedType }, { headers: { Authorization: `Bearer ${token}` } });
        alert('Bed request submitted successfully! Hospital admin will confirm your reservation shortly.');
        setPatientBedType('');
        fetchBedRequests();
    } catch(err) {
        alert('Error submitting bed request');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/feedback', { rating: Number(feedbackRating), message: feedbackMessage }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Feedback submitted successfully. Thank you!');
      setFeedbackMessage('');
      setFeedbackRating('5');
    } catch(err) {
      alert('Error submitting feedback');
    }
  };

  return (
    <>
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="logo">MediVerse</div>
        <ul className="nav-links">
          <li className={activeTab === 'Dashboard' ? 'active' : ''} onClick={() => setActiveTab('Dashboard')}>Doctor Directory</li>
          <li className={activeTab === 'Departments' ? 'active' : ''} onClick={() => setActiveTab('Departments')}>Departments</li>
          <li className={activeTab === 'Appointments' ? 'active' : ''} onClick={() => setActiveTab('Appointments')}>Appointments</li>
          <li className={activeTab === 'AI Triage' ? 'active' : ''} onClick={() => setActiveTab('AI Triage')}>AI Triage Assistant</li>
          <li className={activeTab === 'Messaging' ? 'active' : ''} onClick={() => setActiveTab('Messaging')}>Secure Messaging</li>
          <li className={activeTab === 'Billing' ? 'active' : ''} onClick={() => setActiveTab('Billing')}>Billing & Invoices</li>
          <li className={activeTab === 'Beds' ? 'active' : ''} onClick={() => setActiveTab('Beds')}>Bed Reservation</li>
          <li className={activeTab === 'Pharmacy' ? 'active' : ''} onClick={() => setActiveTab('Pharmacy')}>Pharmacy</li>
          <li className={activeTab === 'Provide Feedback' ? 'active' : ''} onClick={() => setActiveTab('Provide Feedback')}>Provide Feedback</li>
          <li className={activeTab === 'My Profile' ? 'active' : ''} onClick={() => setActiveTab('My Profile')}>My Profile</li>
        </ul>
        <button onClick={logout} className="logout-btn">Logout</button>
      </nav>
      <main className="main-content">
        <header className="dashboard-header">
          <h2>Patient Portal</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <span className="role-badge">{user?.name} (PATIENT)</span>
            <button onClick={() => setActiveTab('My Profile')} className="btn outline-btn" title="My Profile" style={{padding: '8px', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', borderColor: 'var(--border-color)', background: 'var(--surface-color)'}}>
              👤
            </button>
            <button onClick={goToHome} className="btn outline-btn" style={{padding: '8px 15px', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}>Home Page</button>
            <button onClick={logout} className="btn primary-btn" style={{padding: '8px 15px'}}>Switch User</button>
          </div>
        </header>
        
        <section className="dashboard-widgets">
          {activeTab === 'Dashboard' && (
            <div>
              <div className="header-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <h3>Available Doctors</h3>
                 <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{padding: '10px', width: '250px'}}>
                     <option value="">All Departments</option>
                     {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                 </select>
              </div>
              <div className="stats-grid" style={{marginTop: '15px', marginBottom: '30px'}}>
                {filteredDoctors.length === 0 && <p>No doctors available in this department.</p>}
                {filteredDoctors.map(d => (
                  <div key={d._id} className="stat-card" style={{padding: '20px'}}>
                    <h4>Dr. {d.name}</h4>
                    <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px', fontWeight: '500'}}>{d.department || 'General Medicine'}</p>
                    <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px'}}>Availability: {d.availability}</p>
                    <button onClick={() => bookAppointment(d._id)} className="primary-btn" style={{marginTop: '15px', width: '100%', fontSize: '14px'}}>
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Departments' && (
             <div>
               <div className="header-row">
                   <h2>Hospital Departments</h2>
               </div>
               <div style={{marginTop: '20px'}}>
                 {adminDepartments.length === 0 && <p>No departments configured.</p>}
                 {adminDepartments.map(d => {
                   const deptDoctors = doctors.filter(u => u.department === d.name);
                   return (
                     <div key={d._id} className="glass-panel card" style={{marginBottom: '20px'}}>
                       <div style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                         <h3 style={{margin: '0', fontSize: '20px', color: '#0f172a'}}>{d.name}</h3>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span style={{background: '#e2e8f0', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', color: '#334155'}}>
                              Head of Department: {d.hodName}
                            </span>
                          </div>
                       </div>
                       {deptDoctors.length > 0 ? (
                         <>
                           <h4 style={{marginBottom: '10px', color: '#475569'}}>Doctors in this department:</h4>
                           <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                             {deptDoctors.map(doc => (
                               <div key={doc._id} style={{padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', flex: '1 1 250px', background: '#f8fafc'}}>
                                   <strong style={{fontSize: '16px', display: 'block', color: '#0f172a'}}>Dr. {doc.name}</strong>
                                   <p style={{margin: '5px 0 0 0', fontSize: '14px', color: doc.availability === 'On Leave' ? '#ef4444' : '#10b981', fontWeight: '500'}}>{doc.availability}</p>
                                   <button onClick={() => { setActiveTab('Appointments'); bookAppointment(doc._id); }} className="primary-btn outline-btn" style={{marginTop: '10px', width: '100%', fontSize: '12px', padding: '5px'}}>
                                     Book Now
                                   </button>
                               </div>
                             ))}
                           </div>
                         </>
                       ) : (
                         <p style={{color: '#64748b'}}>No doctors currently available in this department.</p>
                       )}
                     </div>
                   );
                 })}
               </div>
             </div>
          )}

          {activeTab === 'Appointments' && (
            <div>
              <div className="header-row">
                  <h2>Appointment Management</h2>
              </div>
              <div className="glass-panel card" style={{marginBottom: '20px'}}>
                  <h3>Book New Appointment</h3>
                  {!hasBackendDoctors && (
                    <p style={{color: '#475569', marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px'}}>
                      No approved doctors are currently available from the backend. Please contact the admin to approve doctor accounts.
                    </p>
                  )}
                  <div className="grid-form" style={{display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap'}}>
                      <select
                        value={selectedDept}
                        onChange={(e) => { setSelectedDept(e.target.value); setSelectedDoctorId(''); }}
                        style={{padding: '10px', flex: 1}}
                      >
                          <option value="">Select Department Filter</option>
                          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        style={{padding: '10px', flex: 1}}
                      >
                          <option value="" disabled>Select Doctor</option>
                          {filteredDoctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} ({d.availability})</option>)}
                      </select>
                      <input
                        type="date"
                        id="aptDate"
                        style={{padding: '10px', flex: 1}}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedDoctorId) {
                            alert('Please select a doctor to book an appointment.');
                            return;
                          }
                          if (!selectedDate) {
                            alert('Please select a date for your appointment.');
                            return;
                          }

                          bookAppointment(selectedDoctorId, selectedDate);
                          setSelectedDoctorId('');
                          setSelectedDate('');
                        }}
                        className="btn primary-btn"
                        style={{padding: '10px'}}
                        disabled={!selectedDoctorId || !selectedDate}
                      >
                        Confirm Booking
                      </button>
                  </div>
              </div>

              <div className="table-container glass-panel">
                <h3>My Upcoming & Past Appointments</h3>
                <div style={{marginTop: '20px'}}>
                  {displayedAppointments.length === 0 ? <p>No appointments found.</p> : (
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                      <thead>
                        <tr style={{textAlign: 'left'}}>
                            <th style={{padding: '10px'}}>Patient</th>
                            <th style={{padding: '10px'}}>Doctor</th>
                            <th style={{padding: '10px'}}>Date</th>
                            <th style={{padding: '10px'}}>Status</th>
                            <th style={{padding: '10px'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                      {displayedAppointments.map(a => (
                        <tr key={a._id} style={{borderBottom: '1px solid var(--border-color)'}}>
                           <td style={{padding: '10px'}}>{a.patientId?.name || 'Unknown'}</td>
                           <td style={{padding: '10px'}}>
                             Dr. {a.doctorId?.name || 'Unknown'} 
                             <span style={{fontSize: '12px', color: '#64748b', display: 'block'}}>{a.doctorId?.department || 'General Medicine'}</span>
                           </td>
                           <td style={{padding: '10px'}}>{new Date(a.date).toLocaleDateString()}</td>
                           <td style={{padding: '10px'}}>
                             <strong style={{color: a.status === 'Cancelled' ? '#f87171' : 'var(--primary-color)'}}>{a.status}</strong>
                           </td>
                           <td style={{padding: '10px'}}>
                             {a.status !== 'Cancelled' && a.status !== 'Completed' && hasBackendDoctors && (
                               <>
                                 <button onClick={() => handleRescheduleAppointment(a._id)} className="btn outline-btn" style={{padding: '5px 10px', marginRight: '5px', fontSize: '12px'}}>Reschedule</button>
                                 <button onClick={() => handleCancelAppointment(a._id)} className="btn outline-btn" style={{padding: '5px 10px', borderColor: '#f87171', color: '#f87171', fontSize: '12px'}}>Cancel</button>
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

          {activeTab === 'AI Triage' && (
             <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
               <div className="header-row">
                   <h2>AI Medical Triage Assistant</h2>
               </div>
               <div className="glass-panel card" style={{flexGrow: 1, display: 'flex', flexDirection: 'column', height: '400px'}}>
                   <div style={{flexGrow: 1, overflowY: 'auto', padding: '15px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', marginBottom: '15px'}}>
                      {aiChat.map((msg, i) => (
                        <div key={i} style={{marginBottom: '15px', textAlign: msg.sender === 'AI' ? 'left' : 'right'}}>
                           <span style={{display: 'inline-block', padding: '10px 15px', borderRadius: '8px', background: msg.sender === 'AI' ? 'var(--border-color)' : 'var(--primary-color)', color: msg.sender === 'AI' ? 'var(--text-primary)' : '#000', maxWidth: '80%'}}>
                             {msg.text}
                           </span>
                        </div>
                      ))}
                   </div>
                   <form onSubmit={handleAiSubmit} style={{display: 'flex', gap: '10px'}}>
                      <input type="text" value={aiMessage} onChange={e => setAiMessage(e.target.value)} placeholder="Describe your symptoms (e.g. 'I have a severe headache...')" style={{flexGrow: 1, padding: '15px'}} />
                      <button type="submit" className="btn primary-btn">Analyze Symptoms</button>
                   </form>
               </div>
             </div>
          )}

          {activeTab === 'Messaging' && (
             <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
               <div className="header-row">
                   <h2>Secure Messaging & Telehealth</h2>
               </div>
               <div className="glass-panel card" style={{flexGrow: 1, display: 'flex', flexDirection: 'column', height: '400px'}}>
                   <div style={{flexGrow: 1, overflowY: 'auto', padding: '15px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', marginBottom: '15px'}}>
                      {messages.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No messages yet.</p>}
                      {messages.map((msg, i) => {
                        const isMine = msg.senderId === user?._id;
                        return (
                          <div key={i} style={{marginBottom: '15px', textAlign: isMine ? 'right' : 'left'}}>
                             <small style={{display: 'block', color: 'var(--text-secondary)', marginBottom: '5px'}}>{isMine ? 'You' : msg.senderName}</small>
                             <span style={{display: 'inline-block', padding: '10px 15px', borderRadius: '8px', background: isMine ? 'var(--primary-color)' : 'var(--border-color)', color: isMine ? '#000' : 'var(--text-primary)', maxWidth: '80%'}}>
                               {msg.text}
                             </span>
                          </div>
                        );
                      })}
                   </div>
                   <form onSubmit={handleSendMessage} style={{display: 'flex', gap: '10px'}}>
                      <select value={messageDoctor} onChange={e => setMessageDoctor(e.target.value)} required style={{padding: '15px', width: '200px'}}>
                          <option value="" disabled>Select Doctor</option>
                          {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                      </select>
                      <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." style={{flexGrow: 1, padding: '15px'}} />
                      <button type="submit" className="btn primary-btn">Send Message</button>
                   </form>
               </div>
             </div>
          )}

          {activeTab === 'Billing' && (
             <div>
               <div className="header-row">
                   <h2>Billing & Online Payments</h2>
               </div>
               <div className="table-container glass-panel">
                 <h3>My Invoices</h3>
                 <div style={{marginTop: '20px'}}>
                   {bills.length === 0 ? <p>No bills generated yet.</p> : (
                     <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                       <thead>
                         <tr style={{textAlign: 'left'}}>
                             <th style={{padding: '10px'}}>Date</th>
                             <th style={{padding: '10px'}}>Items</th>
                             <th style={{padding: '10px'}}>Total</th>
                             <th style={{padding: '10px'}}>Claim Status</th>
                             <th style={{padding: '10px'}}>Payment</th>
                         </tr>
                       </thead>
                       <tbody>
                       {bills.map(b => {
                         // Determine if insurance applies
                         const hasInsurance = !!user?.insuranceProvider;
                         const claimStatus = b.status === 'Paid' ? 'Resolved' : (hasInsurance ? 'Pending Insurance Approval' : 'Out of Pocket (No Insurance)');
                         const statusColor = hasInsurance && b.status !== 'Paid' ? '#fbbf24' : (b.status === 'Paid' ? '#10b981' : '#f87171');
                         
                         return (
                           <tr key={b._id} style={{borderBottom: '1px solid var(--border-color)'}}>
                              <td style={{padding: '10px'}}>{new Date(b.date).toLocaleDateString()}</td>
                              <td style={{padding: '10px'}}>{b.items.map(i => i.description).join(', ')}</td>
                              <td style={{padding: '10px', fontWeight: 'bold'}}>${b.total}</td>
                              <td style={{padding: '10px', color: statusColor}}><strong>{claimStatus}</strong></td>
                              <td style={{padding: '10px'}}>
                                 {b.status !== 'Paid' && (
                                   <button className="btn primary-btn" style={{padding: '5px 15px', fontSize: '13px'}} onClick={() => alert('Redirecting to payment gateway...')}>
                                     Pay Balance
                                   </button>
                                 )}
                                 {b.status === 'Paid' && <span style={{color: '#10b981', fontWeight: 'bold'}}>Paid</span>}
                              </td>
                           </tr>
                         );
                       })}
                       </tbody>
                     </table>
                   )}
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'Beds' && (
             <div>
               <div className="header-row">
                   <h2>Hospital Admission & Bed Reservation</h2>
               </div>
               <div className="glass-panel card" style={{marginBottom: '20px'}}>
                    <h3>Pre-Book an Accommodation</h3>
                    <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                        <select id="patientBedType" required style={{padding: '15px', flex: 1}} value={patientBedType} onChange={(e) => setPatientBedType(e.target.value)}>
                            <option value="" disabled>Select Room / Luxury Level</option>
                            <option value="Normal">Normal Ward ($50/day)</option>
                            <option value="AC">AC Room ($100/day)</option>
                            <option value="Deluxe">Deluxe Private ($200/day)</option>
                            <option value="Super Deluxe">Super Deluxe Private ($300/day)</option>
                            <option value="Suite">Presidential Suite ($500/day)</option>
                        </select>
                        <button onClick={handleBedRequest} className="btn primary-btn" style={{padding: '15px'}}>Submit Reservation Request</button>
                    </div>
                </div>

                <div className="table-container glass-panel">
                 <h3>My Bed Requests</h3>
                 <div style={{marginTop: '20px'}}>
                   {bedRequests.length === 0 ? <p>No bed requests found.</p> : (
                     <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                       <thead>
                         <tr style={{textAlign: 'left'}}>
                             <th style={{padding: '10px'}}>Date</th>
                             <th style={{padding: '10px'}}>Bed Type</th>
                             <th style={{padding: '10px'}}>Status</th>
                         </tr>
                       </thead>
                       <tbody>
                       {bedRequests.map(br => (
                         <tr key={br._id} style={{borderBottom: '1px solid var(--border-color)'}}>
                            <td style={{padding: '10px'}}>{new Date(br.date).toLocaleDateString()}</td>
                            <td style={{padding: '10px'}}>{br.bedType}</td>
                            <td style={{padding: '10px'}}>
                              <strong style={{color: br.status === 'Pending' ? '#fbbf24' : (br.status === 'Approved' ? '#10b981' : '#f87171')}}>
                                {br.status}
                              </strong>
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
                   <h2>Digital Pharmacy Inventory</h2>
               </div>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                    <table style={{width: '100%', textAlign: 'left'}}>
                        <thead>
                            <tr style={{background: 'rgba(0,0,0,0.2)'}}>
                                <th style={{padding: '10px'}}>Medicine Name</th>
                                <th style={{padding: '10px'}}>Unit Price</th>
                                <th style={{padding: '10px'}}>Status</th>
                                <th style={{padding: '10px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{borderBottom: '1px solid var(--border-color)'}}>
                                <td style={{padding: '10px', fontWeight: '500'}}>Paracetamol (500mg)</td>
                                <td style={{padding: '10px'}}>$5.00</td>
                                <td style={{padding: '10px', color: '#10b981'}}>In Stock</td>
                                <td style={{padding: '10px'}}><button className="btn outline-btn" style={{padding: '5px 15px'}}>Add to Order</button></td>
                            </tr>
                            <tr style={{borderBottom: '1px solid var(--border-color)'}}>
                                <td style={{padding: '10px', fontWeight: '500'}}>Amoxicillin (Antibiotic)</td>
                                <td style={{padding: '10px'}}>$12.00</td>
                                <td style={{padding: '10px', color: '#fbbf24'}}>Low Stock</td>
                                <td style={{padding: '10px'}}><button className="btn outline-btn" style={{padding: '5px 15px'}}>Add to Order</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {activeTab === 'Provide Feedback' && (
             <div>
               <div className="header-row">
                   <h2>Provide Feedback</h2>
               </div>
               <div className="glass-panel card" style={{marginTop: '15px'}}>
                   <form onSubmit={handleFeedbackSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                       <div>
                           <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Rate your experience</label>
                           <select value={feedbackRating} onChange={e => setFeedbackRating(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)'}}>
                               <option value="5">5 - Excellent</option>
                               <option value="4">4 - Good</option>
                               <option value="3">3 - Average</option>
                               <option value="2">2 - Poor</option>
                               <option value="1">1 - Terrible</option>
                           </select>
                       </div>
                       <div>
                           <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Your Feedback</label>
                           <textarea value={feedbackMessage} onChange={e => setFeedbackMessage(e.target.value)} required rows="5" placeholder="Tell us how we can improve..." style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', resize: 'vertical'}}></textarea>
                       </div>
                       <button type="submit" className="btn primary-btn" style={{padding: '12px'}}>Submit Feedback</button>
                   </form>
               </div>
             </div>
          )}

          {activeTab === 'My Profile' && (
             <div>
               <div className="header-row">
                   <h2>Profile & Family Management</h2>
               </div>
               
               <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                 {/* Main Profile Settings */}
                 <div className="glass-panel card" style={{flex: '1 1 400px'}}>
                    <h3>My Demographics & Insurance</h3>
                    <form onSubmit={handleUpdateProfile} style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px'}}>
                       <div>
                          <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Full Name</label>
                          <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)'}} />
                       </div>
                       <div>
                          <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Email Address</label>
                          <input type="email" value={user?.email || ''} disabled style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)'}} />
                       </div>
                       <div>
                          <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Insurance Provider</label>
                          <input type="text" value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} placeholder="e.g. BlueCross, Medicare" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)'}} />
                       </div>
                       <div>
                          <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Insurance ID / Policy Number</label>
                          <input type="text" value={insuranceId} onChange={e => setInsuranceId(e.target.value)} placeholder="Policy Number" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)'}} />
                       </div>
                       <div>
                          <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Reset Password</label>
                          <input type="password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} placeholder="Leave blank to keep current password" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)'}} />
                       </div>
                       <button type="submit" className="btn primary-btn" style={{padding: '12px'}}>Save Profile Changes</button>
                    </form>
                 </div>

                 {/* Dependents Management */}
                 <div className="glass-panel card" style={{flex: '1 1 400px'}}>
                    <h3>Family & Dependents</h3>
                    <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '5px', marginBottom: '15px'}}>
                       Add family members to book appointments on their behalf.
                    </p>
                    
                    {user?.dependents && user.dependents.length > 0 && (
                      <div style={{marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px'}}>
                         <h4 style={{marginBottom: '10px'}}>Registered Dependents:</h4>
                         <ul style={{listStyle: 'none'}}>
                            {user.dependents.map(dep => (
                              <li key={dep._id} style={{padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                                <strong>{dep.name}</strong> ({dep.relation}, Age {dep.age})
                                <button className="btn outline-btn" style={{float: 'right', padding: '2px 8px', fontSize: '11px'}} onClick={() => alert('Switched active profile to ' + dep.name)}>Switch Profile</button>
                              </li>
                            ))}
                         </ul>
                      </div>
                    )}

                    <form onSubmit={handleAddDependent} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                       <div>
                          <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Dependent Name</label>
                          <input type="text" value={dependentName} onChange={e => setDependentName(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)'}} placeholder="e.g. John Jr." />
                       </div>
                       <div style={{display: 'flex', gap: '15px'}}>
                           <div style={{flex: 1}}>
                              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Relationship</label>
                              <select value={dependentRelation} onChange={e => setDependentRelation(e.target.value)} required style={{width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)'}}>
                                  <option value="" disabled>Select</option>
                                  <option value="Child">Child</option>
                                  <option value="Spouse">Spouse</option>
                                  <option value="Parent">Parent</option>
                                  <option value="Sibling">Sibling</option>
                              </select>
                           </div>
                           <div style={{flex: 1}}>
                              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Age</label>
                              <input type="number" value={dependentAge} onChange={e => setDependentAge(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)'}} />
                           </div>
                       </div>
                       <button type="submit" className="btn outline-btn" style={{padding: '12px'}}>Add Dependent</button>
                    </form>
                 </div>
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

export default PatientDashboard;
