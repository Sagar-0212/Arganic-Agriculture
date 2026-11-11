
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, Sparkles, User, RefreshCw, HelpCircle, ChevronRight, LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';

const QUICK_SUGGESTIONS = [
  "Are all products 100% organic?",
  "Where is Arya Malhar Farms located?",
  "How long does shipping take?",
  "How to consult Ayurvedic doctor?"
];

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Namaste! 🙏 Welcome to Arya Malhar Group of Companies Assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleToggleChat = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setIsOpen(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!isAuthenticated) {
      setIsOpen(false);
      setShowAuthModal(true);
      return;
    }
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/faqs/chatbot/ask', { message: text });
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.reply || "Thank you for asking! For direct support, please reach us at 9561961055.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: res.suggestedQuestions
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm having trouble connecting right now. Please call customer support at 9561961055.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Login / Sign Up Required Popup Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-primary/20 text-center relative space-y-6">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-earth-400 hover:text-earth-700 p-1.5 rounded-full hover:bg-earth-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <img src="/logo.png" alt="Arya AI Logo" className="h-10 w-10 object-contain" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-earth-900 flex items-center justify-center gap-2">
                Login Required <Sparkles className="h-5 w-5 text-secondary" />
              </h3>
              <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
                Please log in or create an account to start chatting with <span className="font-bold text-primary">Arya AI Assistant</span> for instant farm product and Ayurvedic pharmacy guidance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/login');
                }}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" /> Login Now
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/register');
                }}
                className="flex-1 bg-secondary hover:bg-secondary-dark text-earth-900 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" /> Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="bg-primary hover:bg-primary-dark text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 group border-2 border-white/20"
          title="Open AI Chat Assistant"
        >
          <div className="relative">
            <img src="/logo.png" alt="Arya AI Logo" className="h-7 w-7 object-contain bg-white p-0.5 rounded-full shadow-sm" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </div>
          <span className="font-semibold text-sm pr-1 hidden sm:inline">Ask AI Help</span>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="bg-white w-[92vw] sm:w-[400px] h-[540px] rounded-2xl shadow-2xl border border-earth-200 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-dark via-primary to-earth-800 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded-xl shadow-sm">
                <img src="/logo.png" alt="Arya Malhar Logo" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Arya AI Assistant <Sparkles className="h-3.5 w-3.5 text-secondary" />
                </h3>
                <p className="text-[11px] text-earth-200 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-400 inline-block animate-pulse"></span> Online | Farm & Pharmacy Help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-earth-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-earth-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {msg.sender === 'bot' && (
                    <img src="/logo.png" alt="Arya AI" className="h-6 w-6 object-contain rounded-full bg-white p-0.5 border border-earth-200 flex-shrink-0 mt-1 shadow-xs" />
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-earth-900 border border-earth-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                <span className="text-[10px] text-earth-400 mt-1 px-1">{msg.time}</span>

                {/* Suggested Follow-up Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-2 pl-7 space-y-1 w-full">
                    <p className="text-[11px] font-semibold text-earth-600 flex items-center gap-1">
                      <HelpCircle className="h-3 w-3 text-secondary" /> Suggested questions:
                    </p>
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-xs text-left text-primary hover:text-primary-dark font-medium bg-white hover:bg-earth-100 border border-earth-200 rounded-lg px-2.5 py-1.5 block w-full transition-colors flex items-center justify-between group"
                      >
                        <span>{q}</span>
                        <ChevronRight className="h-3 w-3 text-earth-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-earth-500 text-xs pl-7">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Arya AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-white border-t border-earth-100 overflow-x-auto flex space-x-1.5 no-scrollbar">
            {QUICK_SUGGESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] whitespace-nowrap bg-earth-100 hover:bg-primary-light/20 text-earth-800 hover:text-primary px-2.5 py-1 rounded-full font-medium transition-colors border border-earth-200 flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-earth-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about farm, produce or pharmacy..."
              className="flex-grow text-xs sm:text-sm px-3.5 py-2.5 rounded-full border border-earth-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-earth-50/50"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white p-2.5 rounded-full transition-colors flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
