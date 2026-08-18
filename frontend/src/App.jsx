import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

import AdminDashboard from './components/AdminDashboard';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import StaffDashboard from './components/StaffDashboard';
import HomePage from './components/HomePage';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [showAuth, setShowAuth] = useState(false);
  const [intentToBook, setIntentToBook] = useState(false); // Track if user clicked "Book Appointment"

  // Dashboards states
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [beds, setBeds] = useState([]);
  const [bills, setBills] = useState([]);

  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    if (token) {
      if (user?.role === 'admin') {
        fetchAdminStats();
        fetchAdminBills();
      }
      if (user?.role === 'patient') {
        fetchMyBills();
      }
      fetchDoctors();
      fetchAppointments();
      fetchBeds();
    }
  }, [token, activeTab]);

  const apiGet = async (path) => {
    try {
      const res = await axios.get(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) logout();
      return null;
    }
  };

  const fetchAdminStats = async () => setStats(await apiGet('/admin/stats'));
  const fetchDoctors = async () => setDoctors(await apiGet('/doctors') || []);
  const fetchAppointments = async () => setAppointments(await apiGet('/appointments') || []);
  const fetchBeds = async () => setBeds(await apiGet('/beds') || []);
  const fetchAdminBills = async () => setBills(await apiGet('/admin/bills') || []);
  const fetchMyBills = async () => setBills(await apiGet('/bills') || []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const cleanEmail = email.trim();
      const payload = isLogin 
        ? { email: cleanEmail, password, role } 
        : { name, email: cleanEmail, password, role, licenseNumber, certificateUrl };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // If user was trying to book an appointment, go to Appointments tab
      if (intentToBook && res.data.user.role === 'patient') {
        setActiveTab('Appointments');
        setIntentToBook(false);
      } else {
        setActiveTab('Dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setShowAuth(false);
    localStorage.clear();
  };

  const bookAppointment = async (doctorId, date = new Date()) => {
    try {
      await axios.post(`${API_URL}/appointments`, { doctorId, date }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Appointment booked successfully!');
      fetchAppointments();
      setActiveTab('Appointments');
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error booking appointment';
      alert(errorMessage);
    }
  };

  const [view, setView] = useState('dashboard'); // 'dashboard' or 'home'

  // Session validation
  useEffect(() => {
    if (token && !user) logout();
    if (!token && user) logout();
  }, [token, user]);

  // Priority 1: Auth Modal
  if (showAuth && !token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>{isLogin ? 'Login to MediVerse' : 'Register for MediVerse'}</h1>
          {errorMsg && <p style={{ color: '#ef4444', marginBottom: '15px', fontWeight: 'bold' }}>{errorMsg}</p>}
          <form onSubmit={handleAuth}>
            {!isLogin && (
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="patient">Patient {isLogin ? 'Login' : 'Registration'}</option>
              <option value="doctor">Doctor {isLogin ? 'Login' : 'Registration'}</option>
              <option value="admin">Admin {isLogin ? 'Login' : 'Registration'}</option>
              <option value="staff">Staff {isLogin ? 'Login' : 'Registration'}</option>
            </select>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            
            {!isLogin && (role === 'doctor' || role === 'staff') && (
              <div style={{marginTop: '10px', marginBottom: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '5px'}}>
                 <p style={{fontSize: '13px', color: '#64748b', marginBottom: '10px', textAlign: 'left'}}>Professional Verification Required</p>
                 <input type="text" placeholder="Medical License / Staff ID" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} required style={{marginBottom: '10px', width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '5px'}} />
                 <input type="text" placeholder="Certificate / Document Link" value={certificateUrl} onChange={e => setCertificateUrl(e.target.value)} required style={{width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '5px'}} />
              </div>
            )}
            
            <button type="submit" className="primary-btn">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <p onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }} className="toggle-auth">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </p>
          <div style={{marginTop: '20px', borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: '15px'}}>
             <a href="#" onClick={(e) => { e.preventDefault(); setShowAuth(false); }} style={{color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500'}}>← Back to Home Page</a>
          </div>
        </div>
      </div>
    );
  }

  // Priority 2: Dashboards (if logged in and not explicitly on home)

  if (token && user && view === 'dashboard') {
    const dashboardProps = { user, activeTab, setActiveTab, logout, goToHome: () => setView('home') };
    switch (user.role) {
      case 'admin':
        return <AdminDashboard {...dashboardProps} stats={stats} appointments={appointments} bills={bills} fetchAdminBills={fetchAdminBills} token={token} />;
      case 'doctor':
        return <DoctorDashboard {...dashboardProps} appointments={appointments} token={token} />;
      case 'patient':
        return <PatientDashboard {...dashboardProps} doctors={doctors} bookAppointment={bookAppointment} appointments={appointments} />;
      case 'staff':
        return <StaffDashboard {...dashboardProps} appointments={appointments} />;
      default:
        logout();
    }
  }

  // Priority 3: Home Page (Fallback)
  return (
    <HomePage 
      user={user} 
      onLoginClick={() => {
        if (token) setView('dashboard');
        else setShowAuth(true);
      }} 
      onBookAppointmentClick={() => {
        if (token) setView('dashboard');
        else {
          setIntentToBook(true);
          setShowAuth(true);
        }
      }}
      onDashboardClick={() => setView('dashboard')} 
    />
  );
}

export default App;
