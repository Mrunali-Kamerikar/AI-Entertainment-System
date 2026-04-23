import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Send, User, Sparkles, Film } from 'lucide-react';
import { askMovieQuestion } from '../../services/backend';
import { useApp } from '../../context/AppContext';
import { MovieCard } from '../MovieCard';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  relatedMovies?: string[];
  confidence?: number;
  timestamp: Date;
}

const SUGGESTIONS = [
  'What makes Inception so unique?',
  'Recommend me a psychological thriller',
  'Best Christopher Nolan films?',
  'Movies similar to The Dark Knight',
  'What sci-fi films won Oscars?',
  'Best films from the 2010s?',
];

export const QATab: React.FC = () => {
  const { recommendations } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      content: "Hi! I'm your AI film assistant. Ask me anything about movies — from recommendations to plot analysis, director styles, or hidden gems. I'm powered by deep analysis of thousands of films and reviews! 🎬",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const q = text || input.trim();
    if (!q) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const result = await askMovieQuestion(q);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: result.answer,
        relatedMovies: result.relatedMovies,
        confidence: result.confidence,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Get related movie cards
  const getRelatedCards = (titles: string[]) =>
    recommendations.filter(m => titles.some(t => m.title.toLowerCase().includes(t.toLowerCase())));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
      {/* Chat area */}
      <div
        style={{
          flex: 1, overflowY: 'auto', padding: '16px 0', marginBottom: 16,
          scrollbarWidth: 'thin', scrollbarColor: '#1a1a1a transparent',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              gap: 10,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'ai'
                ? 'linear-gradient(135deg, #E50914, #b30000)'
                : 'linear-gradient(135deg, #4BCBEB, #2980b9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {msg.role === 'ai' ? <Brain size={16} color="#fff" /> : <User size={16} color="#fff" />}
            </div>

            <div style={{ maxWidth: '75%', minWidth: 0 }}>
              {/* Bubble */}
              <div style={{
                background: msg.role === 'ai' ? '#1a1a1a' : 'rgba(229,9,20,0.12)',
                border: `1px solid ${msg.role === 'ai' ? '#2a2a2a' : 'rgba(229,9,20,0.25)'}`,
                borderRadius: msg.role === 'ai' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                padding: '12px 16px',
              }}>
                {/* Render AI message with structured formatting */}
                {msg.role === 'ai' ? (
                  <div style={{ color: '#ccc', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {msg.content.split('\n').map((line, i) => {
                      // Check if line is a bullet point
                      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                        return (
                          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                            <span style={{ color: '#E50914', flexShrink: 0 }}>•</span>
                            <span>{line.replace(/^[•\-]\s*/, '')}</span>
                          </div>
                        );
                      }
                      // Check if line is a numbered list
                      if (/^\d+\./.test(line.trim())) {
                        return (
                          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                            <span style={{ color: '#E50914', fontWeight: 600, flexShrink: 0 }}>
                              {line.match(/^\d+\./)?.[0]}
                            </span>
                            <span>{line.replace(/^\d+\.\s*/, '')}</span>
                          </div>
                        );
                      }
                      // Check if line is a heading (contains keywords like "Key points:", "Summary:", etc.)
                      if (line.match(/^(Key|Summary|Main|Important|Notable|Highlights?):/i)) {
                        return (
                          <p key={i} style={{ color: '#fff', fontWeight: 700, margin: '12px 0 8px', fontSize: '0.9rem' }}>
                            {line}
                          </p>
                        );
                      }
                      // Regular paragraph
                      return line.trim() ? (
                        <p key={i} style={{ margin: '0 0 8px' }}>{line}</p>
                      ) : (
                        <br key={i} />
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#fff', margin: 0, fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {msg.content}
                  </p>
                )}
                {msg.confidence && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={11} color="#E50914" />
                    <span style={{ color: '#555', fontSize: '0.7rem' }}>
                      Confidence: {Math.round(msg.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Related movies */}
              {msg.relatedMovies && msg.relatedMovies.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Film size={12} color="#666" />
                    <span style={{ color: '#666', fontSize: '0.72rem' }}>Related Films</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {msg.relatedMovies.map((title) => {
                      const movie = recommendations.find(m =>
                        m.title.toLowerCase().includes(title.toLowerCase())
                      );
                      return movie ? (
                        <span key={title} style={{
                          background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.2)',
                          borderRadius: 6, padding: '3px 10px', color: '#E50914', fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}>
                          {title}
                        </span>
                      ) : (
                        <span key={title} style={{
                          background: '#1a1a1a', border: '1px solid #2a2a2a',
                          borderRadius: 6, padding: '3px 10px', color: '#888', fontSize: '0.75rem',
                        }}>
                          {title}
                        </span>
                      );
                    })}
                  </div>
                  {/* Show matching movie cards */}
                  {getRelatedCards(msg.relatedMovies).length > 0 && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 8, marginTop: 10,
                      }}
                    >
                      {getRelatedCards(msg.relatedMovies).slice(0, 3).map((m, i) => (
                        <MovieCard key={m.id} movie={m} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p style={{ color: '#444', fontSize: '0.68rem', margin: '6px 0 0', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{ display: 'flex', gap: 10 }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E50914, #b30000)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Brain size={16} color="#fff" />
              </div>
              <div style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '4px 12px 12px 12px',
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#E50914' }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {SUGGESTIONS.map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.03 }}
              onClick={() => sendMessage(s)}
              style={{
                flexShrink: 0, background: 'rgba(255,255,255,0.04)',
                border: '1px solid #2a2a2a', borderRadius: 20,
                padding: '5px 12px', cursor: 'pointer',
                color: '#888', fontSize: '0.75rem', whiteSpace: 'nowrap',
              }}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
        background: '#1a1a1a', borderRadius: 12,
        border: '1px solid #2a2a2a', padding: '8px 8px 8px 16px',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask me anything about movies..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: '0.88rem',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping}
          style={{
            background: input.trim() ? 'linear-gradient(135deg, #E50914, #b30000)' : '#2a2a2a',
            border: 'none', borderRadius: 8, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <Send size={15} color="#fff" />
        </motion.button>
      </div>
    </div>
  );
};