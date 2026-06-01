import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am the MediVerse Assistant. How can I help you today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "I'm sorry, I don't understand that. You can ask me about our departments, booking an appointment, timings, location, or emergency services.";
      
      const lowerInput = inputValue.toLowerCase();
      
      if (lowerInput.includes("appointment") || lowerInput.includes("book") || lowerInput.includes("schedule")) {
        botResponse = "You can book an appointment by clicking the 'Book Appointment' button at the top of the page, or call our helpline at +91 95121 40059.";
      } else if (lowerInput.includes("emergency") || lowerInput.includes("urgent")) {
        botResponse = "For emergencies, please call our 24/7 emergency line at +91 95121 40058 immediately or visit our Emergency Department.";
      } else if (lowerInput.includes("department") || lowerInput.includes("specialt")) {
        botResponse = "We have many specialized departments including Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, and more. Please check out the 'Departments' section on our homepage for a full list.";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        botResponse = "Hello there! Welcome to MediVerse. How can I assist you today?";
      } else if (lowerInput.includes("time") || lowerInput.includes("hour") || lowerInput.includes("open") || lowerInput.includes("close")) {
        botResponse = "Our Emergency Department is open 24/7. Regular OPD timings are Monday to Saturday, 9:00 AM to 8:00 PM. Visiting hours for IPD are 10:00 AM to 12:00 PM and 5:00 PM to 7:00 PM.";
      } else if (lowerInput.includes("location") || lowerInput.includes("address") || lowerInput.includes("where") || lowerInput.includes("map") || lowerInput.includes("navigate") || lowerInput.includes("navigation")) {
        botResponse = "We are located at 123 Healthcare Avenue, Medical District, City Center. You can find our exact location on the map in the 'Contact' section, and use our interactive Indoor Navigation Map to easily find any department inside the hospital.";
      } else if (lowerInput.includes("contact") || lowerInput.includes("phone") || lowerInput.includes("call") || lowerInput.includes("number")) {
        botResponse = "You can reach our Helpline at +91 95121 40059 or 0281 6195000. For emergencies, call +91 95121 40058 or 0281 6195050/60. Alternatively, email us at enquiry@MediVersehospital.co.in.";
      } else if (lowerInput.includes("insurance") || lowerInput.includes("mediclaim") || lowerInput.includes("tpa") || lowerInput.includes("claim")) {
        botResponse = "We accept most major insurance providers and TPAs. Please contact our billing support desk or call our helpline to verify your coverage before your visit.";
      } else if (lowerInput.includes("doctor") || lowerInput.includes("physician") || lowerInput.includes("surgeon")) {
        botResponse = "We have over 50 expert specialists across various departments. You can view doctors by selecting a specific department in the 'Departments' section on the homepage.";
      } else if (lowerInput.includes("facilities") || lowerInput.includes("infrastructure") || lowerInput.includes("bed") || lowerInput.includes("ward")) {
        botResponse = "Our hospital spans over 50,000 sq. ft. with dedicated wings for critical care, advanced diagnostics, and elective surgeries. We offer General Wards, Semi-Private, and Private Rooms.";
      } else if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("fee") || lowerInput.includes("charge")) {
        botResponse = "Treatment costs vary depending on the department and procedures. Please consult with our front desk or call our helpline for detailed fee structures.";
      } else if (lowerInput.includes("thank")) {
        botResponse = "You're very welcome! Let me know if you need anything else. Wishing you good health!";
      }

      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    }, 1000);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">🤖</span>
              <h3>MediVerse Assistant</h3>
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat}>
              &times;
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <button className="chatbot-toggle-btn" onClick={toggleChat}>
          💬 Chat with us
        </button>
      )}
    </div>
  );
};

export default Chatbot;
