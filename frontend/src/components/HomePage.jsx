import React, { useState } from 'react';
import Footer from './Footer';
import Chatbot from './Chatbot';

const HomePage = ({ onLoginClick, onBookAppointmentClick, onDashboardClick, user }) => {
  const [activeDept, setActiveDept] = useState(null);
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [showMoreHeroInfo, setShowMoreHeroInfo] = useState(false);
  const [showMoreOverview, setShowMoreOverview] = useState(false);
  const [activeFeatureId, setActiveFeatureId] = useState(null);

  const departments = [
    // Emergency & Core Departments
    {
      id: 'emergency',
      icon: '🚨',
      title: 'Emergency Department (ED)',
      desc: 'Immediate care for accidents and critical conditions. 24/7 emergency services with rapid response.',
      category: 'Emergency & Core'
    },
    {
      id: 'opd',
      icon: '🏥',
      title: 'Outpatient Department (OPD)',
      desc: 'Patients who visit for checkups and go home the same day. Walk-in consultations available.',
      category: 'Emergency & Core'
    },
    {
      id: 'ipd',
      icon: '🛏️',
      title: 'Inpatient Department (IPD)',
      desc: 'Patients who are admitted to the hospital for treatment and recovery. Round-the-clock monitoring.',
      category: 'Emergency & Core'
    },
    {
      id: 'icu',
      icon: '⚕️',
      title: 'Intensive Care Unit (ICU)',
      desc: 'Critical care for seriously ill patients with advanced life support systems and constant monitoring.',
      category: 'Emergency & Core'
    },
    {
      id: 'operation-theatre',
      icon: '🔬',
      title: 'Operation Theatre (OT)',
      desc: 'State-of-the-art surgical facility where surgeries are performed with maximum precision and safety.',
      category: 'Emergency & Core'
    },
    // Medical Specialties
    {
      id: 'cardiology',
      icon: '🫀',
      title: 'Cardiology',
      desc: 'Expert heart care, including diagnostics, treatment, and preventive services for cardiovascular health.',
      category: 'Medical Specialties'
    },
    {
      id: 'neurology',
      icon: '🧠',
      title: 'Neurology',
      desc: 'Advanced treatment for brain and nervous system disorders, focusing on patient recovery and wellness.',
      category: 'Medical Specialties'
    },
    {
      id: 'orthopedics',
      icon: '🦴',
      title: 'Orthopedics',
      desc: 'Specialized care for bones, joints, and muscles, helping you regain mobility and strength.',
      category: 'Medical Specialties'
    },
    {
      id: 'pediatrics',
      icon: '👶',
      title: 'Pediatrics',
      desc: 'Compassionate medical care for children from infancy through adolescence in a friendly environment.',
      category: 'Medical Specialties'
    },
    {
      id: 'gynecology',
      icon: '👩‍⚕️',
      title: 'Gynecology & Obstetrics',
      desc: 'Women\'s health and pregnancy care. Expert support throughout pregnancy and childbirth.',
      category: 'Medical Specialties'
    },
    {
      id: 'dermatology',
      icon: '✨',
      title: 'Dermatology',
      desc: 'Comprehensive skin care, from medical treatments to aesthetic procedures for healthy skin.',
      category: 'Medical Specialties'
    },
    {
      id: 'psychiatry',
      icon: '🧠‍💭',
      title: 'Psychiatry',
      desc: 'Mental health services for emotional, behavioral, and psychological wellness.',
      category: 'Medical Specialties'
    },
    // Diagnostic Departments
    {
      id: 'radiology',
      icon: '🖼️',
      title: 'Radiology',
      desc: 'X-rays, CT scans, MRI and advanced imaging for accurate diagnosis and treatment planning.',
      category: 'Diagnostic Services'
    },
    {
      id: 'pathology',
      icon: '🧬',
      title: 'Pathology',
      desc: 'Blood tests, biopsy and laboratory testing for disease identification and monitoring.',
      category: 'Diagnostic Services'
    },
    {
      id: 'microbiology',
      icon: '🦠',
      title: 'Microbiology',
      desc: 'Infection testing and analysis for accurate diagnosis and treatment of infections.',
      category: 'Diagnostic Services'
    },
    // Support Services
    {
      id: 'pharmacy',
      icon: '💊',
      title: 'Pharmacy',
      desc: 'Medicines distribution and pharmaceutical consultation for optimal patient treatment.',
      category: 'Support Services'
    },
    {
      id: 'nursing',
      icon: '🏥',
      title: 'Nursing Department',
      desc: 'Patient care and monitoring with compassionate, skilled nursing staff available 24/7.',
      category: 'Support Services'
    },
    {
      id: 'physiotherapy',
      icon: '🤸',
      title: 'Physiotherapy',
      desc: 'Rehabilitation and movement therapy to restore mobility and improve quality of life.',
      category: 'Support Services'
    },
    {
      id: 'nutrition',
      icon: '🍎',
      title: 'Dietary & Nutrition',
      desc: 'Patient meals and personalized diet plans for optimal nutrition and recovery.',
      category: 'Support Services'
    },
    {
      id: 'ophthalmology',
      icon: '👁️',
      title: 'Ophthalmology',
      desc: 'Expert eye care, including vision testing, surgery, and treatment for various eye conditions.',
      category: 'Medical Specialties'
    },
    {
      id: 'gastroenterology',
      icon: '🍽️',
      title: 'Gastroenterology',
      desc: 'Diagnosis and treatment of digestive system disorders with personalized care plans.',
      category: 'Medical Specialties'
    },
    {
      id: 'oncology',
      icon: '🎗️',
      title: 'Oncology',
      desc: 'Advanced cancer care with multidisciplinary support and the latest treatment options.',
      category: 'Medical Specialties'
    },
    {
      id: 'ent',
      icon: '👂',
      title: 'ENT (Ear, Nose & Throat)',
      desc: 'Specialized treatment for ear, nose, and throat conditions with expert surgical care.',
      category: 'Medical Specialties'
    },
    {
      id: 'urology',
      icon: '💧',
      title: 'Urology',
      desc: 'Care for urinary tract and male reproductive health, including stone disease and prostate care.',
      category: 'Medical Specialties'
    },
    {
      id: 'nephrology',
      icon: '🩸',
      title: 'Nephrology',
      desc: 'Kidney care with dialysis services and treatment for acute and chronic renal disorders.',
      category: 'Medical Specialties'
    },
    {
      id: 'pulmonology',
      icon: '🌬️',
      title: 'Pulmonology',
      desc: 'Advanced respiratory care for lung conditions such as asthma, COPD, and infections.',
      category: 'Medical Specialties'
    },
    {
      id: 'endocrinology',
      icon: '🧬',
      title: 'Endocrinology',
      desc: 'Hormonal health services including diabetes, thyroid, and metabolic disorder management.',
      category: 'Medical Specialties'
    },
    {
      id: 'rheumatology',
      icon: '👐',
      title: 'Rheumatology',
      desc: 'Care for joint, muscle and autoimmune conditions with personalized rehabilitation plans.',
      category: 'Medical Specialties'
    },
    {
      id: 'dental',
      icon: '🦷',
      title: 'Dental Care',
      desc: 'Oral health services, dental surgery, and preventive dentistry for all ages.',
      category: 'Support Services'
    },
    {
      id: 'cardiothoracic',
      icon: '🫀',
      title: 'Cardiothoracic Surgery',
      desc: 'Heart and lung surgery with advanced cardiac and thoracic procedures.',
      category: 'Surgical Specialties'
    },
    {
      id: 'neurosurgery',
      icon: '🧠',
      title: 'Neurosurgery',
      desc: 'Surgical care for brain, spine and nervous system conditions with precision techniques.',
      category: 'Surgical Specialties'
    },
    {
      id: 'plastic-surgery',
      icon: '✨',
      title: 'Plastic & Cosmetic Surgery',
      desc: 'Reconstructive and cosmetic surgery services for improved function and appearance.',
      category: 'Surgical Specialties'
    },
    {
      id: 'pain-management',
      icon: '💊',
      title: 'Pain Management',
      desc: 'Chronic and acute pain care with multidisciplinary relief and rehabilitation plans.',
      category: 'Support Services'
    },
    {
      id: 'sleep-medicine',
      icon: '😴',
      title: 'Sleep Medicine',
      desc: 'Diagnosis and treatment for sleep disorders like apnea, insomnia and restless leg syndrome.',
      category: 'Support Services'
    },
    {
      id: 'infectious-diseases',
      icon: '🦠',
      title: 'Infectious Diseases',
      desc: 'Specialized care for infections, tropical illnesses, and outbreak management.',
      category: 'Medical Specialties'
    },
    {
      id: 'critical-care',
      icon: '🚑',
      title: 'Critical Care',
      desc: 'Advanced intensive monitoring and treatment for critically ill patients.',
      category: 'Emergency & Core'
    },
    {
      id: 'family-medicine',
      icon: '🏡',
      title: 'Family Medicine',
      desc: 'Primary care for the whole family, including preventive health and chronic disease management.',
      category: 'Medical Specialties'
    },
    {
      id: 'neonatology',
      icon: '👶',
      title: 'Neonatology',
      desc: 'Specialized medical care for newborn infants, especially premature or ill babies.',
      category: 'Medical Specialties'
    },
    {
      id: 'nuclear-medicine',
      icon: '☢️',
      title: 'Nuclear Medicine',
      desc: 'Diagnostic and therapeutic procedures using radioactive materials for precise disease detection.',
      category: 'Diagnostic Services'
    },
    {
      id: 'allergy-immunology',
      icon: '🌿',
      title: 'Allergy & Immunology',
      desc: 'Care for allergies, asthma and immune system disorders with testing and treatment plans.',
      category: 'Medical Specialties'
    },
    {
      id: 'speech-therapy',
      icon: '🗣️',
      title: 'Speech Therapy',
      desc: 'Treatment for speech, language and swallowing disorders to improve communication and function.',
      category: 'Support Services'
    },
    {
      id: 'occupational-therapy',
      icon: '🛠️',
      title: 'Occupational Therapy',
      desc: 'Therapy to help patients recover daily living skills after injury or illness.',
      category: 'Support Services'
    },
    {
      id: 'hematology',
      icon: '🩸',
      title: 'Hematology',
      desc: 'Diagnosis and treatment of blood disorders, anemia, clotting problems, and blood cancers.',
      category: 'Medical Specialties'
    },
    {
      id: 'transplant-medicine',
      icon: '🔄',
      title: 'Transplant Medicine',
      desc: 'Comprehensive transplant care including pre-operative evaluation and post-transplant follow-up.',
      category: 'Medical Specialties'
    },
    {
      id: 'medical-genetics',
      icon: '🧬',
      title: 'Medical Genetics',
      desc: 'Genetic testing and counseling for hereditary diseases and family health planning.',
      category: 'Medical Specialties'
    }
  ];

  // Show only first 6 departments initially, or all if showAllDepts is true
  const displayedDepts = showAllDepts ? departments : departments.slice(0, 6);

  const overviewFeatures = [
    {
      id: 'clinical-care',
      title: 'Highest Standards of Clinical Care',
      description: 'We strictly adhere to the highest NABH standards of clinical care, ensuring patient safety, quality outcomes, and ethical medical practices at every level.',
      icon: '❤️'
    },
    {
      id: 'patient-care',
      title: 'Commitment to Exceptional Patient Care',
      description: 'We are deeply committed to exceptional patient care by placing patients at the center of everything we do. Our approach combines clinical expertise, compassionate service, and clear communication.',
      icon: '🩺'
    },
    {
      id: 'ethical-practices',
      title: 'Ethical Practises',
      description: 'We strictly adhere to NABH ethical standards, ensuring integrity, transparency, and respect for patient rights in all aspects of care.',
      icon: '⚖️'
    },
    {
      id: 'infrastructure',
      title: 'Cutting Edge Infrastructure',
      description: 'Our hospital is equipped with cutting-edge infrastructure designed to support advanced medical care and patient safety.',
      icon: '🏥'
    }
  ];

  const faqItems = [
    {
      id: 'emergency',
      question: 'What should I do in a medical emergency?',
      answer: 'Call emergency services immediately and proceed to the nearest emergency department. Our hospital is ready to provide urgent care 24/7.'
    },
    {
      id: 'appointment',
      question: 'How can I book an appointment online?',
      answer: 'Use our booking form or contact the helpline to schedule consultations with your preferred specialist quickly and securely.'
    },
    {
      id: 'insurance',
      question: 'Which insurance plans are accepted?',
      answer: 'We accept most major insurance providers and TPAs. Contact our support team to verify your coverage before your visit.'
    }
  ];

  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="homepage-wrapper" id="home">
      <div className="home-topbar">
        <div className="topbar-links">
          <a href="#footer-contact" onClick={e => { e.preventDefault(); document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' }); }}>International Patients</a>
          <a href="#departments" onClick={e => { e.preventDefault(); document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' }); }}>Health CheckUp</a>
          <a href="#" onClick={e => { e.preventDefault(); user ? onDashboardClick() : onLoginClick(); }}>Patient Portal</a>
          <a href="#" onClick={e => { e.preventDefault(); alert('MediVerse App is coming soon to the App Store and Google Play!'); }}>MediVerse First App</a>
          <a href="#" onClick={e => { e.preventDefault(); alert('Star MediVerse Loyalty Program: Exclusive benefits for our regular patients. Launching soon!'); }}>Star MediVerse</a>
        </div>
        <div className="topbar-contact">
          enquiry@MediVersehospital.co.in
        </div >
      </div>

      <header className="home-header">
        <div className="logo-container">
          <h1 style={{ color: '#2563eb', fontWeight: 700, margin: 0, fontSize: '22px' }}>MediVerse</h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Compassionate Care, Guided by AI</p>
        </div>
        <nav className="home-nav">
          <a href="#home">Home</a>
          <a href="#departments">Departments</a>
          <a href="#footer-address" onClick={e => { e.preventDefault(); document.getElementById('footer-address')?.scrollIntoView({ behavior: 'smooth' }); }}>Address</a>
          <a href="#footer-contact" onClick={e => { e.preventDefault(); document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
        </nav>
        <div className="header-right">
          <div className="header-contact-block">
            <span className="header-label">Emergency</span>
            <a href="tel:+91512140058">+91 95121 40058</a>
            <p>0281 6195050/60</p>
          </div>
          <div className="header-contact-block">
            <span className="header-label">Helpline</span>
            <a href="tel:+91512140059">+91 95121 40059</a>
            <p>0281 6195000</p>
          </div>
          <div className="header-buttons">
            <button className="outline-btn" onClick={onBookAppointmentClick}>Book Appointment</button>
            <button className="login-header-btn" onClick={user ? onDashboardClick : onLoginClick}>
              {user ? 'Dashboard' : 'Login'}
            </button>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="hero-container">
          <div className="hero-text">
            <h1>Advanced Healthcare <br /><span>Guided by Intelligence</span></h1>
            <p>Experience the future of medicine with MediVerse. Our AI-driven systems ensure faster diagnostics, efficient hospital management, and compassionate patient care.</p>
            <div className="hero-btns">
              <button className="primary-btn" style={{ padding: '15px 30px', fontSize: '16px' }} onClick={user ? onDashboardClick : onLoginClick}>
                {user ? 'Go to Dashboard' : 'Book an Appointment'}
              </button>
              <button 
                className="btn outline-btn" 
                style={{ padding: '15px 30px', fontSize: '16px', marginLeft: '15px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                onClick={() => setShowMoreHeroInfo(!showMoreHeroInfo)}
              >
                {showMoreHeroInfo ? 'Show Less' : 'Learn More'}
              </button>
            </div>

            {showMoreHeroInfo && (
              <div className="hero-more-info" style={{ marginTop: '25px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)', animation: 'fadeIn 0.5s ease-out' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '10px' }}>Innovation at MediVerse</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                  MediVerse is at the forefront of the digital healthcare revolution. By integrating <strong>Generative AI</strong> and <strong>Predictive Analytics</strong>, we offer:
                </p>
                <ul style={{ marginTop: '10px', fontSize: '14px', color: '#475569', paddingLeft: '20px' }}>
                  <li><strong>AI Triage:</strong> Faster patient prioritization based on symptom severity.</li>
                  <li><strong>EHR Intelligence:</strong> Automated medical record summarization for doctors.</li>
                  <li><strong>Smart Resource Allocation:</strong> Real-time tracking of bed availability and staff shifts.</li>
                  <li><strong>Telehealth 2.0:</strong> Seamless video consultations with integrated diagnostic tools.</li>
                </ul>
              </div>
            )}
            <div className="hero-stats">
              <div className="stat"><strong>24/7</strong><span>Emergency</span></div>
              <div className="stat"><strong>50+</strong><span>Specialists</span></div>
              <div className="stat"><strong>10k+</strong><span>Happy Patients</span></div>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" alt="Medical Technology" />
          </div>
        </div>
      </section>

      <section className="departments-section" id="departments">
        <div className="container">
          <div className="section-header">
            <h2>Our Specialized Departments</h2>
            <p>Click on a department to view available doctors and book an appointment.</p>
          </div>

          <div className="departments-grid">
            {displayedDepts.map(dept => (
              <div
                key={dept.id}
                className="dept-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: activeDept === dept.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                  transform: activeDept === dept.id ? 'translateY(-5px)' : 'none',
                  boxShadow: activeDept === dept.id ? '0 15px 35px rgba(37, 99, 235, 0.15)' : ''
                }}
                onClick={() => setActiveDept(activeDept === dept.id ? null : dept.id)}
              >
                <div className="dept-icon">{dept.icon}</div>
                <h3>{dept.title}</h3>
                <p style={{ flex: 1 }}>{dept.desc}</p>

                {activeDept === dept.id && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                      className="btn outline-btn"
                      style={{ width: '100%', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                      onClick={(e) => { e.stopPropagation(); user ? onDashboardClick() : onBookAppointmentClick(); }}
                    >
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showAllDepts && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                className="primary-btn"
                style={{ padding: '12px 30px', fontSize: '16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                onClick={() => setShowAllDepts(true)}
              >
                Read More Departments
              </button>
            </div>
          )}

          {showAllDepts && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                className="outline-btn"
                style={{ padding: '12px 30px', fontSize: '16px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)', backgroundColor: 'transparent', border: '2px solid var(--primary-color)', borderRadius: '5px', cursor: 'pointer' }}
                onClick={() => setShowAllDepts(false)}
              >
                Show Less
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="overview-section">
        <div className="container overview-grid">
          <div className="overview-left">
            <div className="overview-intro">
              <span className="eyebrow">OVERVIEW</span>
              <h2>MediVerse, Assure to provide care, attention, and high-standard medical services to our patients.</h2>
              <p>With trust of NABH & Digital NABH accreditation promising personalized & holistic care, we touch and transform countless lives each year. This promise inspires us to serve, innovate and grow together.</p>
              
              {showMoreOverview && (
                <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                  <p style={{ marginBottom: '15px' }}>Our facility spans over 50,000 sq. ft. with dedicated wings for critical care, advanced diagnostics, and elective surgeries. We are proud to be one of the few hospitals in the region with fully integrated AI patient management systems.</p>
                  <p>Our mission is to make world-class healthcare accessible to everyone through technological innovation and compassionate medical expertise.</p>
                </div>
              )}
              
              <button 
                className="outline-btn" 
                style={{ marginTop: '20px', padding: '12px 30px' }}
                onClick={() => setShowMoreOverview(!showMoreOverview)}
              >
                {showMoreOverview ? 'Show Less' : 'Read More'}
              </button>
            </div>

          </div>
          <div className="overview-cards">
            {overviewFeatures.map(feature => (
              <div key={feature.id} className="feature-card" style={{ height: 'auto', minHeight: '300px' }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                
                {activeFeatureId === feature.id && (
                   <div style={{ marginTop: '10px', fontSize: '13px', color: '#64748b', animation: 'fadeIn 0.5s ease-out' }}>
                      <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                      <p>Detailed performance metrics and compliance logs are maintained for this category to ensure 100% adherence to global healthcare protocols.</p>
                   </div>
                )}

                <button 
                  className="outline-btn" 
                  onClick={() => setActiveFeatureId(activeFeatureId === feature.id ? null : feature.id)}
                >
                  {activeFeatureId === feature.id ? 'Show Less' : 'Read More'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container faq-grid">
          <div className="faq-left">
            <span className="eyebrow">ASK QUESTION</span>
            <h2>Partner in Health Matters Most Caring Always</h2>
            <div className="faq-list">
              {faqItems.map(item => (
                <div key={item.id} className={`faq-card ${activeFaq === item.id ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === item.id ? null : item.id)}>
                  <div className="faq-question">
                    <span>{item.question}</span>
                    <div className="faq-toggle">{activeFaq === item.id ? '−' : '+'}</div>
                  </div>
                  {activeFaq === item.id && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="faq-image">
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80" alt="Doctor Consultation" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Patient Testimonials</h2>
            <p>Hear from our satisfied patients about their experiences at MediVerse.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="https://synergyhospital.co.in/assets/images/testimonials/27c70f1a308163356919d13c307e77a2.jpg" alt="Mrs. Sara Das" />
              </div>
              <div className="testimonial-content">
                <p>"★★★★★ Synergy Superspeciality is the best heart hospital in Rajkot. Cardiology department in the hospital has very experienced doctors and surgeons. Nurses and medical staff show great compassion and affection to the patients."</p>
                <h4>Mrs. Sara Das</h4>
                <span>Patient</span>
              </div>
            </div>
            {/* Add more testimonials if available */}
          </div>
        </div>
      </section>

      <Footer
        id="contact"
        onDoctorClick={() => {
          const element = document.getElementById('departments');
          element?.scrollIntoView({ behavior: 'smooth' });
        }}
        onLoginClick={onLoginClick}
        onDashboardClick={onDashboardClick}
      />
      <Chatbot />
    </div>
  );
};

export default HomePage;
