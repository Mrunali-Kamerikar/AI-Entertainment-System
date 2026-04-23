import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Film, Star, Clock, TrendingUp } from 'lucide-react';
import { askGemini, resetChatHistory } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { MovieData } from '../data/mockData';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'error';
  text: string;
  timestamp: Date;
  movies?: MovieData[]; // Optional movie recommendations in the message
}

// Helper function to format text with bold markdown (**text**)
const formatTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

const SUGGESTION_CHIPS = [
  { text: "Top Bollywood movies", icon: "🇮🇳" },
  { text: "Summary of Inception", icon: "📖" },
  { text: "Best Anime films", icon: "🎌" },
  { text: "Hollywood action movies", icon: "💥" },
  { text: "Summary of Interstellar", icon: "🌌" },
  { text: "What's trending now?", icon: "🔥" },
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { allMovies } = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens for the first time
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'bot',
        text: "👋 Hey! What kind of movies are you looking for today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Extract movie names from text and find matching movies
  const findMoviesInText = (text: string): MovieData[] => {
    const foundMovies: MovieData[] = [];
    const lowerText = text.toLowerCase();
    
    // Search for movie titles in the response
    allMovies.forEach(movie => {
      if (lowerText.includes(movie.title.toLowerCase())) {
        foundMovies.push(movie);
      }
    });

    return foundMovies.slice(0, 3); // Limit to 3 movies
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      // Simulate realistic typing delay (500-1500ms)
      const typingDelay = 800 + Math.random() * 700;
      
      // Get AI response from Gemini (with fallback)
      const aiResponse = await askGemini(text.trim());

      // Wait for typing animation
      await new Promise(resolve => setTimeout(resolve, typingDelay));

      // Find movies mentioned in the response
      const mentionedMovies = findMoviesInText(aiResponse);

      // Add bot response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: aiResponse,
        timestamp: new Date(),
        movies: mentionedMovies.length > 0 ? mentionedMovies : undefined,
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message with helpful suggestions
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'error',
        text: "⚠️ I'm having trouble connecting right now.\n\n**Try asking about:**\n• Movie recommendations by genre\n• Specific actors or directors\n• Trending films in Bollywood, Hollywood, Anime, K-Drama\n• Movie summaries or reviews\n\n**Or use the search bar** to find movies directly!",
        timestamp: new Date(),
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleMovieClick = (movie: MovieData) => {
    setSelectedMovie(movie);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, boxShadow: '0 12px 32px rgba(229, 9, 20, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center z-50 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #E50914 0%, #b30000 100%)',
              boxShadow: '0 8px 24px rgba(229, 9, 20, 0.4)',
            }}
          >
            <MessageCircle size={28} color="#fff" />
            {/* Pulse animation */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, #E50914 0%, transparent 70%)' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile/Desktop Responsive Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden"
              style={{
                width: 'min(420px, calc(100vw - 48px))',
                height: 'min(600px, calc(100vh - 100px))',
                background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
                borderRadius: 20,
                boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              {/* Header */}
              <div 
                className="px-5 py-4 flex items-center justify-between border-b border-white/10"
                style={{
                  background: 'linear-gradient(135deg, #E50914 0%, #b30000 100%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles size={20} color="#fff" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#E50914]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base m-0">CineVerse Assistant</h3>
                    <p className="text-white/70 text-xs m-0">AI-Powered Movie Expert</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <X size={18} color="#fff" />
                </motion.button>
              </div>

              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#333 transparent',
                }}
              >
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex flex-col gap-2 max-w-[85%]">
                        {/* Message Bubble */}
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-[#E50914] to-[#b30000] text-white rounded-br-sm' 
                              : message.type === 'error'
                              ? 'bg-red-950/30 text-red-200 border border-red-800/50 rounded-bl-sm'
                              : 'bg-white/10 text-white rounded-bl-sm'
                          }`}
                          style={{
                            boxShadow: message.type === 'user' 
                              ? '0 4px 12px rgba(229,9,20,0.3)' 
                              : 'none',
                          }}
                        >
                          <p className="text-sm leading-relaxed m-0 whitespace-pre-line">{formatTextWithBold(message.text)}</p>
                        </div>

                        {/* Movie Cards (if movies are mentioned) */}
                        {message.movies && message.movies.length > 0 && (
                          <div className="flex flex-col gap-2 mt-1">
                            {message.movies.map(movie => (
                              <motion.div
                                key={movie.id}
                                whileHover={{ scale: 1.02, x: 4 }}
                                onClick={() => handleMovieClick(movie)}
                                className="flex gap-3 p-3 rounded-xl cursor-pointer border border-white/10"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                              >
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                  alt={movie.title}
                                  className="w-12 h-16 rounded object-cover"
                                  style={{ minWidth: 48 }}
                                />
                                <div className="flex-1 flex flex-col justify-center gap-1">
                                  <h4 className="text-white text-xs font-semibold m-0 line-clamp-1">{movie.title}</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <Star size={10} fill="#E50914" color="#E50914" />
                                      <span className="text-[#E50914] text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
                                    </div>
                                    <span className="text-white/40 text-xs">•</span>
                                    <span className="text-white/60 text-xs">{new Date(movie.release_date).getFullYear()}</span>
                                  </div>
                                  <p className="text-white/50 text-xs m-0 line-clamp-1">{movie.genres.slice(0, 2).join(', ')}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <span className="text-white/30 text-xs px-2">
                          {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="px-5 py-3 rounded-2xl rounded-bl-sm bg-white/10 flex items-center gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: 'easeInOut',
                            }}
                            className="w-2 h-2 rounded-full bg-white/50"
                          />
                        ))}
                        <span className="text-white/40 text-xs ml-1">thinking...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Suggestion Chips */}
              {showSuggestions && messages.length <= 1 && (
                <div className="px-4 pb-3">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2 font-semibold">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTION_CHIPS.map((chip, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestionClick(chip.text)}
                        className="px-3 py-2 rounded-full text-xs border border-white/20 cursor-pointer flex items-center gap-2"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#ccc',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span>{chip.icon}</span>
                        <span>{chip.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div 
                className="px-4 py-4 border-t border-white/10"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              >
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about movies, summaries, actors, genres..."
                    disabled={isTyping}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                    style={{
                      resize: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(229,9,20,0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(inputText)}
                    disabled={!inputText.trim() || isTyping}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border-0 cursor-pointer"
                    style={{
                      background: inputText.trim() && !isTyping
                        ? 'linear-gradient(135deg, #E50914, #b30000)' 
                        : 'rgba(255,255,255,0.1)',
                      cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Send size={18} color={inputText.trim() && !isTyping ? '#fff' : '#666'} />
                  </motion.button>
                </div>
                <p className="text-white/30 text-xs mt-2 text-center m-0">
                  Powered by Google Gemini AI ✨
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMovie(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] rounded-2xl overflow-hidden max-w-md w-full border border-white/10"
              style={{ maxHeight: 'calc(100vh - 100px)' }}
            >
              {/* Movie Poster Header */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w500${selectedMovie.backdrop_path || selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20"
                >
                  <X size={18} color="#fff" />
                </button>
              </div>

              {/* Movie Details */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                <h2 className="text-white text-2xl font-bold mb-2">{selectedMovie.title}</h2>
                
                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star size={16} fill="#E50914" color="#E50914" />
                    <span className="text-[#E50914] font-bold">{selectedMovie.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/60">
                    <Clock size={14} />
                    <span className="text-sm">{selectedMovie.runtime} min</span>
                  </div>
                  <span className="text-white/60 text-sm">{new Date(selectedMovie.release_date).getFullYear()}</span>
                </div>

                {/* Genres */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {selectedMovie.genres.map((genre, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Tagline */}
                {selectedMovie.tagline && (
                  <p className="text-[#E50914] italic text-sm mb-3">"{selectedMovie.tagline}"</p>
                )}

                {/* Overview */}
                <p className="text-white/70 text-sm leading-relaxed mb-4">{selectedMovie.overview}</p>

                {/* AI Score */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-xs uppercase tracking-wider">AI Recommendation Score</span>
                    <span className="text-[#E50914] font-bold text-lg">{selectedMovie.aiScore}/10</span>
                  </div>
                  <p className="text-white/50 text-xs">{selectedMovie.aiExplanation}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};