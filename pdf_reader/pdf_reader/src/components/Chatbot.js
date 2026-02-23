import React, { useState, useRef } from 'react';
import './Chatbot.css';

const API_URL = 'http://localhost:5000/chatbot';


const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { content: 'Hello! I am your AI assistant. How can I help you today?', role: 'assistant' }
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice-to-text setup
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? prev + ' ' + transcript : transcript);
      };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    }
    setListening(true);
    recognitionRef.current.start();
  };
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const sendMessage = async (msg) => {
    setLoading(true);
    const userMsg = msg || input;
    const newMessages = [...messages, { content: userMsg, role: 'user' }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
        credentials: 'include',
      });
      const data = await res.json();
      setMessages([...newMessages, { content: data.reply, role: 'assistant' }]);
      setSuggestions(data.suggestions || []);
    } catch (e) {
      setMessages([...newMessages, { content: "Sorry, I couldn't process your request.", role: 'assistant' }]);
      setSuggestions([]);
    }
    setLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleInput = (e) => setInput(e.target.value);
  const handleKeyDown = (e) => { if (e.key === 'Enter' && input.trim()) sendMessage(); };
  const handleSuggestion = (s) => sendMessage(s);

  return (
    <>
      <button
        className="chatbot-fab"
        aria-label="Open assistant"
        onClick={() => setOpen(true)}
        style={{ display: open ? 'none' : 'block' }}
      >
        💬
      </button>
      {open && (
        <div className="chatbot-popup-overlay" onClick={() => setOpen(false)}>
          <div className="chatbot-popup" onClick={e => e.stopPropagation()}>
            <button className="chatbot-close" aria-label="Close assistant" onClick={() => setOpen(false)}>&times;</button>
            <div className="chatbot-container">
              <div className="chatbot-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`chatbot-msg chatbot-msg-${msg.role || 'assistant'}`}>
                    {msg.role === 'user' ? (
                      <span className="chatbot-avatar chatbot-avatar-user" title="You">🧑</span>
                    ) : (
                      <span className="chatbot-avatar chatbot-avatar-assistant" title="Assistant">🤖</span>
                    )}
                    <span className="chatbot-msg-content">{msg.content}</span>
                  </div>
                ))}
                {loading && <div className="chatbot-typing">Assistant is typing...</div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="chatbot-input-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  aria-label="Type your message"
                  style={{ flex: 1 }}
                />
                <button onClick={listening ? stopListening : startListening} aria-label="Voice input" style={{ fontSize: '1.3em', background: listening ? '#e3f2fd' : 'white', border: '1px solid #1976d2', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {listening ? '🎤' : '🎙️'}
                </button>
                <button onClick={() => input.trim() && sendMessage()}>Send</button>
              </div>
              {suggestions.length > 0 && (
                <div className="chatbot-suggestions">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSuggestion(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
