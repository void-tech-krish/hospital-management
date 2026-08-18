import React from 'react';

const Footer = ({ id, onDoctorClick, onLoginClick, onDashboardClick }) => {
  const scrollToDepartments = () => {
    const element = document.getElementById('departments');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFindDoctor = () => {
    scrollToDepartments();
  };

  const handlePatientPortal = () => {
    onLoginClick?.();
  };

  const handleHospNav = () => {
    onDashboardClick?.();
  };

  return (
    <footer className="global-footer" id={id || 'footer-address'}>
      <div className="footer-columns">
        <div className="footer-column">
          <h4>MediVerse</h4>
          <p>456 Wellness Blvd, Health City<br />Metroville, ST 54321</p>
          <p id="footer-contact"><strong>Emergency:</strong> <a href="tel:+91512140058" style={{ color: '#60a5fa' }}>+91 95121 40058</a> / 0281 6195050/60</p>
          <p><strong>Helpline:</strong> <a href="tel:+91512140059" style={{ color: '#60a5fa' }}>+91 95121 40059</a> / 0281 6195000</p>
          <p><strong>Email:</strong> <a href="mailto:enquiry@MediVersehospital.co.in" style={{ color: '#60a5fa' }}>enquiry@MediVersehospital.co.in</a></p>
        </div>
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleFindDoctor(); }}>Find a Doctor</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handlePatientPortal(); }}>Patient Portal</a></li>
            <li><a href="https://mediverse.example.com/careers" target="_blank" rel="noopener noreferrer">Careers</a></li>
            <li><a href="https://mediverse.example.com/volunteer" target="_blank" rel="noopener noreferrer">Volunteer</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>MediVerse</h4>
          <p>Driven by advanced AI technology to guide patients and staff smoothly through our facilities with ease and efficiency.</p>
          <a href="#" onClick={(e) => { e.preventDefault(); handleHospNav(); }} className="hospnav-link">Try HospNav &rarr;</a>
        </div>
      </div>
      <div className="footer-bottom-bar">
        &copy; 2026 MediVerse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
