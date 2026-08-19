import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from './Footer';

const DoctorDashboard = ({ user, activeTab, setActiveTab, logout, goToHome, appointments, token }) => {
  const [availability, setAvailability] = useState('');
  
  // EHR & Consultation States
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [consultNotes, setConsultNotes] = useState('');
  const [prescMedicine, setPrescMedicine] = useState('');
  const [prescDosage, setPrescDosage] = useState('');
  const [labTest, setLabTest] = useState('');
  const [assignedBed, setAssignedBed] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  
  // AI Assistant States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello Doctor. How can I assist you with medical guidelines, drug interactions, or historical case files today?' }
  ]);

  // Profile States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [gender, setGender] = useState(user?.gender || '');
  const [contact, setContact] = useState(user?.contact || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [notifications, setNotifications] = useState(user?.notifications || 'email_all');
  const [signature, setSignature] = useState(user?.signature || '');

  // Feedback States
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const tokenLocal = localStorage.getItem('token');
      const payload = { 
        name: profileName, password: profilePassword,
        gender, contact, specialization, experience, bio, notifications, signature
      };
      const res = await axios.put('/api/users/profile', payload, { headers: { Authorization: `Bearer ${tokenLocal}` } });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Profile updated successfully! Refreshing to apply changes...');
      window.location.reload();
    } catch (err) {
      alert('Error updating profile');
    }
  };

  // Messages States
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageRecipient, setMessageRecipient] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/messages', { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch(err) {}
  };

  const updateAvailability = async () => {
    try {
      await axios.put('/api/doctors/availability', { availability }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Availability updated successfully!');
    } catch (err) {
      alert('Error updating availability');
    }
  };

  const [bedRequests, setBedRequests] = useState([]);
  
  const fetchBedRequests = async () => {
    try {
      const res = await axios.get('/api/bed-requests', { headers: { Authorization: `Bearer ${token}` } });
      setBedRequests(res.data);
    } catch(err) {}
  };

  React.useEffect(() => {
    if (activeTab === 'Beds') fetchBedRequests();
    if (activeTab === 'Messages') fetchMessages();
  }, [activeTab]);

  const updateBedRequestStatus = async (id, status) => {
    try {
      await axios.put(`/api/bed-requests/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchBedRequests();
    } catch(err) {
      alert('Error updating status');
    }
  };

  const handleAiAsk = () => {
    if (!chatInput.trim()) return;
    setChatHistory([...chatHistory, 
      { role: 'user', text: chatInput }, 
      { role: 'ai', text: 'Analyzing medical databases... (AI Response: Based on standard guidelines, there are no severe contraindications for this query. Please verify with clinical context.)' }
    ]);
    setChatInput('');
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !messageRecipient) {
        alert("Please select a recipient and enter a message.");
        return;
    }
    try {
        await axios.post('/api/messages', { receiverId: messageRecipient, text: messageInput }, { headers: { Authorization: `Bearer ${token}` } });
        setMessageInput('');
        fetchMessages();
    } catch(err) {
        alert('Error sending message');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const tokenLocal = localStorage.getItem('token');
      await axios.post('/api/feedback', { rating: Number(feedbackRating), message: feedbackMessage }, { headers: { Authorization: `Bearer ${tokenLocal}` } });
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
        <div className="logo">MediVerse (Doctor)</div>
        <ul className="nav-links">
          <li className={activeTab === 'Dashboard' ? 'active' : ''} onClick={() => setActiveTab('Dashboard')}>Dashboard</li>
          <li className={activeTab === 'Appointments' ? 'active' : ''} onClick={() => setActiveTab('Appointments')}>Appointments & Telehealth</li>
          <li className={activeTab === 'Consultation Workspace' ? 'active' : ''} onClick={() => setActiveTab('Consultation Workspace')}>Consultations (EHR)</li>
          <li className={activeTab === 'AI Assistant' ? 'active' : ''} onClick={() => setActiveTab('AI Assistant')}>Clinical AI Assistant</li>
          <li className={activeTab === 'Messages' ? 'active' : ''} onClick={() => setActiveTab('Messages')}>In-App Messaging</li>
          <li className={activeTab === 'Beds' ? 'active' : ''} onClick={() => setActiveTab('Beds')}>Bed Availability</li>
          <li className={activeTab === 'Pharmacy' ? 'active' : ''} onClick={() => setActiveTab('Pharmacy')}>Pharmacy Stock</li>
          <li className={activeTab === 'Provide Feedback' ? 'active' : ''} onClick={() => setActiveTab('Provide Feedback')}>Provide Feedback</li>
          <li className={activeTab === 'My Profile' ? 'active' : ''} onClick={() => setActiveTab('My Profile')}>My Profile</li>
        </ul>
        <button onClick={logout} className="logout-btn">Logout</button>
      </nav>
      <main className="main-content">
        <header className="dashboard-header">
          <h2>Welcome, Dr. {user?.name}</h2>
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
          {activeTab === 'Dashboard' && (
            <div>
              <h3>Dashboard Overview</h3>
              <p>Welcome to your portal. Use the sidebar to manage EHRs, access the AI Clinical Assistant, or start virtual consultations.</p>
              
              <div className="glass-panel card" style={{marginTop: '20px', maxWidth: '400px'}}>
                  <h3>Set Live Availability</h3>
                  <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                      <input 
                        type="text" 
                        placeholder="e.g., Mon-Fri 10AM-2PM, or On Leave" 
                        value={availability} 
                        onChange={(e) => setAvailability(e.target.value)} 
                        style={{padding: '10px', borderRadius: '5px', flex: 1}}
                      />
                      <button onClick={updateAvailability} className="btn primary-btn" style={{padding: '10px'}}>Save</button>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'Appointments' && (
            <div>
              <div className="header-row">
                  <h2>Appointment Management & Telemedicine</h2>
              </div>
              <div className="table-container glass-panel">
                <h3>My Appointments</h3>
                <div style={{marginTop: '20px'}}>
                  {appointments.length === 0 ? <p>No appointments found.</p> : (
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                      <thead>
                        <tr style={{background: '#f8fafc', textAlign: 'left'}}>
                            <th style={{padding: '10px'}}>Patient</th>
                            <th style={{padding: '10px'}}>Date</th>
                            <th style={{padding: '10px'}}>Status</th>
                            <th style={{padding: '10px'}}>Telemedicine</th>
                        </tr>
                      </thead>
                      <tbody>
                      {appointments.map(a => (
                        <tr key={a._id} style={{borderBottom: '1px solid #e2e8f0'}}>
                           <td style={{padding: '10px', fontWeight: '500'}}>{a.patientId?.name || 'Unknown'}</td>
                           <td style={{padding: '10px'}}>{new Date(a.date).toLocaleDateString()}</td>
                           <td style={{padding: '10px'}}><strong>{a.status}</strong></td>
                           <td style={{padding: '10px'}}>
                               <button 
                                 className="btn outline-btn" 
                                 style={{padding: '5px 10px', background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd'}}
                                 onClick={() => window.open('https://meet.jit.si/mediverse_telehealth_' + a._id, '_blank')}
                               >
                                 🎥 Start Video Consult
                               </button>
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

          {activeTab === 'Consultation Workspace' && (
            <div>
               <div className="header-row">
                   <h2>Electronic Health Records (EHR) & Consultations</h2>
               </div>
               
               <div className="glass-panel card" style={{marginBottom: '20px', marginTop: '15px'}}>
                  <h3>1. Select Patient to Consult</h3>
                  <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} style={{padding: '10px', borderRadius: '5px', width: '100%', marginTop: '10px', background: '#fff', border: '1px solid #cbd5e1'}}>
                    <option value="">-- Choose Patient from Appointments --</option>
                    {appointments.map(a => (
                      <option key={a._id} value={a.patientId?._id || a._id}>{a.patientId?.name || 'Unknown Patient'} (Date: {new Date(a.date).toLocaleDateString()})</option>
                    ))}
                  </select>
               </div>

               {selectedPatientId && (
                 <>
                   <div className="glass-panel card" style={{marginBottom: '20px', background: '#f8fafc', borderLeft: '4px solid #8b5cf6'}}>
                     <h3>Automated Record Summarization (AI)</h3>
                     <button className="btn outline-btn" onClick={() => setAiSummary("Patient has a history of mild hypertension. Last visit 3 months ago for seasonal allergies. Currently on no active chronic medications. No known drug allergies. Previous lab results were normal.")} style={{margin: '10px 0'}}>✨ Generate AI Summary</button>
                     {aiSummary && <p style={{fontStyle: 'italic', color: '#475569', lineHeight: '1.5'}}>{aiSummary}</p>}
                   </div>

                   <div className="grid-form" style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                     <div className="glass-panel card" style={{flex: '1 1 400px'}}>
                       <h3>Clinical Notes</h3>
                       <button className="btn outline-btn" style={{marginBottom: '10px', fontSize: '13px'}} onClick={() => setConsultNotes(consultNotes + "\n[Dictated]: Patient reports mild headache and fatigue for the past 2 days.")}>🎤 Voice-to-Text Dictation</button>
                       <textarea 
                         rows="8" 
                         placeholder="Record symptoms, diagnoses, and treatment plans here..." 
                         value={consultNotes}
                         onChange={e => setConsultNotes(e.target.value)}
                         style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', resize: 'vertical'}}
                       ></textarea>
                       <button className="btn primary-btn" style={{marginTop: '10px'}} onClick={() => alert('Consultation Notes saved to EHR!')}>Save Notes</button>
                     </div>

                     <div className="glass-panel card" style={{flex: '1 1 300px'}}>
                       <h3>Digital Prescription</h3>
                       <select value={prescMedicine} onChange={e => setPrescMedicine(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #cbd5e1'}}>
                         <option value="">Select Medicine from Pharmacy</option>
                         <option value="Paracetamol">Paracetamol (In Stock)</option>
                         <option value="Amoxicillin">Amoxicillin (Low Stock!)</option>
                         <option value="Ibuprofen">Ibuprofen (Out of Stock)</option>
                         <option value="Lisinopril">Lisinopril (In Stock)</option>
                       </select>
                       <input type="text" placeholder="Dosage (e.g., 1 pill 2x a day after meals)" value={prescDosage} onChange={e => setPrescDosage(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #cbd5e1'}} />
                       <button className="btn primary-btn" style={{width: '100%'}} onClick={() => { alert('Digital Prescription routed to Pharmacy!'); setPrescMedicine(''); setPrescDosage(''); }}>Send Prescription</button>
                     </div>
                   </div>

                   <div className="glass-panel card" style={{marginTop: '20px'}}>
                      <h3>Lab Orders & Diagnostics</h3>
                      <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                         <select value={labTest} onChange={e => setLabTest(e.target.value)} style={{padding: '10px', borderRadius: '5px', flex: 1, border: '1px solid #cbd5e1'}}>
                           <option value="">Select Lab Test</option>
                           <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                           <option value="X-Ray (Chest)">X-Ray (Chest)</option>
                           <option value="Lipid Panel">Lipid Panel</option>
                           <option value="MRI Scan">MRI Scan</option>
                         </select>
                         <button className="btn outline-btn" onClick={() => { alert('Lab test requested! Notifications sent to diagnostics.'); setLabTest(''); }}>Request Test</button>
                      </div>
                      <div style={{marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0'}}>
                        <h4 style={{marginBottom: '5px', color: '#0f172a'}}>Recent Lab Results</h4>
                        <p style={{color: '#64748b', fontSize: '14px', margin: '0'}}>Waiting for results from laboratory...</p>
                      </div>
                   </div>

                   <div className="glass-panel card" style={{marginTop: '20px', borderLeft: '4px solid #ef4444'}}>
                      <h3>Hospital Admission & Bed Assignment</h3>
                      <p style={{color: '#475569', fontSize: '14px', marginBottom: '10px'}}>Admit the patient to a ward directly from the consultation workspace.</p>
                      <div style={{display: 'flex', gap: '10px'}}>
                         <select value={assignedBed} onChange={e => setAssignedBed(e.target.value)} style={{padding: '10px', borderRadius: '5px', flex: 1, border: '1px solid #cbd5e1'}}>
                           <option value="">Select Ward / Bed Type</option>
                           <option value="General Ward (Normal Bed)">General Ward (Normal Bed) - 15 Available</option>
                           <option value="Semi-Private (AC Bed)">Semi-Private (AC Bed) - 5 Available</option>
                           <option value="Private Suite (Deluxe Bed)">Private Suite (Deluxe Bed) - 2 Available</option>
                           <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU) - Critical</option>
                         </select>
                         <button className="btn primary-btn" style={{background: '#ef4444', borderColor: '#ef4444'}} onClick={async () => { 
                            if(!assignedBed) { alert('Please select a bed type first.'); return; }
                            
                            // Get selected patient name
                            const patient = appointments.find(a => a.patientId?._id === selectedPatientId || a._id === selectedPatientId)?.patientId;
                            const pName = patient ? patient.name : 'Unknown';

                            try {
                              await axios.post('/api/bed-requests', { bedType: assignedBed, patientId: selectedPatientId, patientName: pName }, { headers: { Authorization: `Bearer ${token}` } });
                              alert(`Patient admitted and ${assignedBed} assigned successfully!`); 
                              setAssignedBed(''); 
                            } catch(err) {
                              alert('Error admitting patient');
                            }
                         }}>Admit Patient</button>
                      </div>
                   </div>
                 </>
               )}
            </div>
          )}

          {activeTab === 'AI Assistant' && (
             <div>
               <div className="header-row">
                   <h2>Clinical AI Assistant</h2>
               </div>
               <div className="glass-panel card" style={{display: 'flex', flexDirection: 'column', height: '500px', marginTop: '15px'}}>
                 <div style={{flex: 1, overflowY: 'auto', marginBottom: '10px', padding: '15px', background: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0'}}>
                    {chatHistory.map((msg, i) => (
                      <div key={i} style={{marginBottom: '15px', textAlign: msg.role === 'ai' ? 'left' : 'right'}}>
                        <span style={{display: 'inline-block', padding: '12px 18px', borderRadius: '15px', background: msg.role === 'ai' ? '#fff' : '#3b82f6', color: msg.role === 'ai' ? '#0f172a' : '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '80%', textAlign: 'left', lineHeight: '1.5'}}>
                          {msg.text}
                        </span>
                      </div>
                    ))}
                 </div>
                 <div style={{display: 'flex', gap: '10px'}}>
                    <input type="text" placeholder="Query complex guidelines, drug interactions, or historical cases..." value={chatInput} onChange={e => setChatInput(e.target.value)} style={{flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #cbd5e1'}} onKeyDown={e => { if(e.key === 'Enter') handleAiAsk(); }} />
                    <button className="btn primary-btn" style={{padding: '0 25px'}} onClick={handleAiAsk}>Ask AI</button>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'Messages' && (
             <div>
               <div className="header-row">
                   <h2>In-App Messaging & Care Coordination</h2>
               </div>
               <div className="glass-panel card" style={{display: 'flex', flexDirection: 'column', height: '500px', marginTop: '15px'}}>
                 <div style={{flex: 1, overflowY: 'auto', marginBottom: '10px', padding: '15px', background: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0'}}>
                    {messages.length === 0 && <p style={{textAlign: 'center', color: '#64748b'}}>No messages found.</p>}
                    {messages.map((msg, i) => {
                      const isMine = msg.senderId === user?._id;
                      return (
                        <div key={i} style={{marginBottom: '10px', padding: '12px', background: isMine ? '#e0f2fe' : '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: isMine ? 'right' : 'left'}}>
                          <div style={{display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '5px', gap: '10px'}}>
                             <strong style={{color: '#0f172a'}}>{isMine ? 'You' : msg.senderName}</strong> 
                             <span style={{fontSize: '12px', color: '#94a3b8'}}>{new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p style={{margin: '0', color: '#334155'}}>{msg.text}</p>
                        </div>
                      );
                    })}
                 </div>
                 <div style={{display: 'flex', gap: '10px'}}>
                    <select value={messageRecipient} onChange={e => setMessageRecipient(e.target.value)} style={{padding: '12px', borderRadius: '5px', border: '1px solid #cbd5e1', width: '200px'}}>
                        <option value="" disabled>Select Recipient</option>
                        {[...new Map(messages.filter(m => m.senderId !== user?._id).map(m => [m.senderId, m.senderName])).entries()].map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <input type="text" placeholder="Type a message to reply..." value={messageInput} onChange={e => setMessageInput(e.target.value)} style={{flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #cbd5e1'}} onKeyDown={e => { if(e.key === 'Enter') handleSendMessage(); }} />
                    <button className="btn primary-btn" style={{padding: '0 25px'}} onClick={handleSendMessage}>Send</button>
                 </div>
               </div>
             </div>
          )}

           {activeTab === 'Beds' && (
             <div>
               <div className="header-row">
                   <h2>Bed Availability & Requests</h2>
               </div>
               
               <div className="stats-grid" style={{marginTop: '15px'}}>
                 <div className="stat-card">
                   <h4>Available Beds</h4>
                   <p style={{fontSize: '24px', marginTop: '10px'}}>Normal: 15 | AC: 5 | Deluxe: 2</p>
                 </div>
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
                   <h2>Pharmacy Stock Check</h2>
               </div>
               <div className="table-container glass-panel" style={{marginTop: '15px'}}>
                    <table style={{width: '100%', textAlign: 'left'}}>
                        <thead>
                            <tr style={{background: '#f8fafc'}}>
                                <th style={{padding: '10px'}}>Medicine Name</th>
                                <th style={{padding: '10px'}}>Stock Status</th>
                                <th style={{padding: '10px'}}>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>Paracetamol</td>
                                <td style={{padding: '10px', color: 'green', fontWeight: 'bold'}}>In Stock</td>
                                <td style={{padding: '10px'}}>$5.00</td>
                            </tr>
                            <tr style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>Amoxicillin</td>
                                <td style={{padding: '10px', color: 'orange', fontWeight: 'bold'}}>Low Stock</td>
                                <td style={{padding: '10px'}}>$12.00</td>
                            </tr>
                            <tr style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '10px'}}>Ibuprofen</td>
                                <td style={{padding: '10px', color: 'red', fontWeight: 'bold'}}>Out of Stock</td>
                                <td style={{padding: '10px'}}>$8.00</td>
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
                   <h2>Advanced Profile & Settings</h2>
               </div>
               <form onSubmit={handleUpdateProfile} style={{marginTop: '15px'}}>
                   <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                       {/* Column 1 */}
                       <div style={{flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                           <div className="glass-panel card">
                              <h3 style={{marginBottom: '15px', color: '#0f172a'}}>Basic Demographics</h3>
                              <div style={{display: 'flex', gap: '15px', marginBottom: '10px'}}>
                                  <div style={{flex: 1}}>
                                     <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Full Name</label>
                                     <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1'}} />
                                  </div>
                                  <div style={{flex: 1}}>
                                     <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Gender</label>
                                     <select value={gender} onChange={e => setGender(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1'}}>
                                         <option value="">Select Gender</option>
                                         <option value="Male">Male</option>
                                         <option value="Female">Female</option>
                                         <option value="Other">Other</option>
                                     </select>
                                  </div>
                              </div>
                              <div style={{display: 'flex', gap: '15px'}}>
                                  <div style={{flex: 1}}>
                                     <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Contact Number</label>
                                     <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="+1 (555) 000-0000" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1'}} />
                                  </div>
                                  <div style={{flex: 1}}>
                                     <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Professional Email</label>
                                     <input type="email" value={user?.email || ''} disabled style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#f1f5f9'}} />
                                  </div>
                              </div>
                           </div>

                           <div className="glass-panel card">
                              <h3 style={{marginBottom: '15px', color: '#0f172a'}}>Clinical Details</h3>
                              <div style={{display: 'flex', gap: '15px', marginBottom: '10px'}}>
                                  <div style={{flex: 1}}>
                                     <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Department</label>
                                     <input type="text" value={user?.department || 'General Medicine'} disabled style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#f1f5f9'}} />
                                  </div>
                                  <div style={{flex: 1}}>
                                     <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Specialization</label>
                                     <input type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g., Cardiothoracic Surgery" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1'}} />
                                  </div>
                              </div>
                              <div>
                                 <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Years of Experience</label>
                                 <input type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g., 10" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1'}} />
                              </div>
                           </div>
                       </div>

                       {/* Column 2 */}
                       <div style={{flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                           <div className="glass-panel card">
                              <h3 style={{marginBottom: '15px', color: '#0f172a'}}>About Me</h3>
                              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Approach to Patient Care</label>
                              <textarea rows="4" value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a short bio describing your medical philosophy..." style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', resize: 'vertical'}}></textarea>
                           </div>

                           <div className="glass-panel card">
                              <h3 style={{marginBottom: '15px', color: '#0f172a'}}>System Settings</h3>
                              <div style={{marginBottom: '10px'}}>
                                 <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Notification Preferences</label>
                                 <select value={notifications} onChange={e => setNotifications(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1'}}>
                                     <option value="email_all">Email for every booking</option>
                                     <option value="daily_summary">Daily Summary Only</option>
                                     <option value="none">No Notifications</option>
                                 </select>
                              </div>
                              <div style={{marginBottom: '10px'}}>
                                 <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Digital Signature String</label>
                                 <input type="text" value={signature} onChange={e => setSignature(e.target.value)} placeholder="e.g., /s/ Dr. Smith" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontFamily: 'cursive'}} />
                              </div>
                              <div>
                                 <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Reset Password</label>
                                 <input type="password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} placeholder="Leave blank to keep current" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1'}} />
                              </div>
                           </div>

                           <button type="submit" className="btn primary-btn" style={{padding: '15px', fontSize: '16px'}}>Save Profile & Settings</button>
                       </div>
                   </div>
               </form>
             </div>
          )}
        </section>
      </main>
    </div>
    <Footer />
    </>
  );
};

export default DoctorDashboard;
