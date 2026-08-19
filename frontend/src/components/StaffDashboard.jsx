import React, { useState } from 'react';
import axios from 'axios';
import Footer from './Footer';

const StaffDashboard = ({ user, activeTab, setActiveTab, logout, goToHome, appointments }) => {
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [bedStats, setBedStats] = useState(null);

  React.useEffect(() => {
    if (activeTab === 'Beds') {
      const fetchBedStats = async () => {
        try {
          const tokenLocal = localStorage.getItem('token');
          const res = await axios.get('/api/bed-stats', { headers: { Authorization: `Bearer ${tokenLocal}` } });
          setBedStats(res.data);
        } catch(err) {}
      };
      fetchBedStats();
    }
  }, [activeTab]);

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
        <div className="logo">MediVerse (Staff)</div>
        <ul className="nav-links">
          <li className={activeTab === 'Dashboard' ? 'active' : ''} onClick={() => setActiveTab('Dashboard')}>Dashboard</li>
          <li className={activeTab === 'Appointments' ? 'active' : ''} onClick={() => setActiveTab('Appointments')}>Appointments</li>
          <li className={activeTab === 'Beds' ? 'active' : ''} onClick={() => setActiveTab('Beds')}>Beds</li>
          <li className={activeTab === 'Pharmacy' ? 'active' : ''} onClick={() => setActiveTab('Pharmacy')}>Pharmacy</li>
          <li className={activeTab === 'Provide Feedback' ? 'active' : ''} onClick={() => setActiveTab('Provide Feedback')}>Provide Feedback</li>
          <li className={activeTab === 'My Profile' ? 'active' : ''} onClick={() => setActiveTab('My Profile')}>My Profile</li>
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
          {activeTab === 'Dashboard' && (
            <div>
              <h3>Staff Dashboard Overview</h3>
              <p>Welcome to the staff portal. You can manage patient intakes and pharmacy here.</p>
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

          {activeTab === 'Beds' && (
             <div>
               <div className="header-row">
                   <h2>Bed Management</h2>
               </div>
               <div className="stats-grid" style={{marginTop: '15px'}}>
                 <div className="stat-card">
                   <h4>Available Beds</h4>
                   <p style={{fontSize: '24px', marginTop: '10px'}}>
                     {bedStats ? `Normal: ${bedStats.available.Normal} | AC: ${bedStats.available.AC} | Deluxe: ${bedStats.available.Deluxe}` : 'Loading...'}
                   </p>
                 </div>
                 <div className="stat-card">
                   <h4>Occupied Beds</h4>
                   <p style={{fontSize: '24px', marginTop: '10px'}}>
                     {bedStats ? `Total: ${bedStats.totalOccupied}` : 'Loading...'}
                   </p>
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
               <div className="header-row"><h2>My Profile</h2></div>
               <div className="glass-panel card" style={{marginTop: '15px'}}>
                 <p style={{marginBottom: '10px'}}><strong>Name:</strong> {user?.name}</p>
                 <p style={{marginBottom: '10px'}}><strong>Email:</strong> {user?.email}</p>
                 <p style={{marginBottom: '10px'}}><strong>Role:</strong> Staff</p>
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

export default StaffDashboard;
