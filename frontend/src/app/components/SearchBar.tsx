import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Brain, X, Loader2, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getImageUrl } from '../services/tmdb';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, searchResults, isSearching, fetchRecommendations, doSearch, setSelectedMovie } = useApp();
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchQuery(v);
    if (v.trim()) {
      setShowDropdown(true);
      doSearch(v);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSearch = (query?: string) => {
    const q = query || searchQuery;
    if (q.trim()) {
      fetchRecommendations(q);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setShowDropdown(false); inputRef.current?.blur(); }
  };

  const popularSearches = ['Sci-Fi', 'Christopher Nolan', 'Mind-bending', 'Thriller 2023', 'Animation'];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 680 }}>
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 2px rgba(229,9,20,0.4), 0 4px 20px rgba(229,9,20,0.15)'
            : '0 0 0 1px rgba(255,255,255,0.08)',
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: isFocused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.05)',
          borderRadius: 12, padding: '0 16px', height: 48,
          transition: 'background 0.2s',
        }}
      >
        <Brain size={18} color={isFocused ? '#E50914' : '#666'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setIsFocused(true); if (searchQuery) setShowDropdown(true); }}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask AI for recommendations... (e.g. 'mind-bending sci-fi')"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: '0.88rem',
          }}
        />
        {isSearching && <Loader2 size={16} color="#E50914" className="animate-spin" style={{ flexShrink: 0 }} />}
        {searchQuery && !isSearching && (
          <button
            onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <X size={14} color="#666" />
          </button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSearch()}
          style={{
            background: 'linear-gradient(135deg, #E50914, #b30000)',
            border: 'none', borderRadius: 8,
            padding: '6px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#fff', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0,
          }}
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search</span>
        </motion.button>
      </motion.div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#1F1F1F', border: '1px solid #333',
              borderRadius: 12, marginTop: 6, overflow: 'hidden',
              zIndex: 100, maxHeight: 400, overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {isSearching ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Loader2 size={20} color="#E50914" className="animate-spin mx-auto" />
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: 8 }}>Searching TMDB...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div style={{ padding: '8px 12px 4px', borderBottom: '1px solid #2a2a2a' }}>
                  <span style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Search Results
                  </span>
                </div>
                {searchResults.map(movie => {
                  const url = movie.poster_path
                    ? (movie.poster_path.startsWith('http')
                      ? movie.poster_path
                      : (movie.poster_path.startsWith('/')
                        ? getImageUrl(movie.poster_path, 'w300')
                        : `https://placehold.co/60x90/181818/555?text=${encodeURIComponent(movie.title[0])}`))
                    : `https://placehold.co/60x90/181818/555?text=${encodeURIComponent(movie.title[0])}`;
                  
                  return (
                    <motion.div
                      key={movie.id}
                      whileHover={{ background: 'rgba(229,9,20,0.08)' }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px', cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSelectedMovie(movie);
                        setShowDropdown(false);
                      }}
                    >
                      <ImageWithFallback
                        src={url}
                        alt={movie.title}
                        style={{ width: 36, height: 54, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: '#fff', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{movie.title}</p>
                        <p style={{ color: '#666', margin: 0, fontSize: '0.75rem' }}>
                          {movie.release_date?.slice(0, 4)} · {movie.genres.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <span style={{ color: '#F5C518', fontSize: '0.78rem' }}>★ {movie.vote_average?.toFixed(1)}</span>
                      </div>
                    </motion.div>
                  );
                })}
                <div style={{ padding: '8px 16px', borderTop: '1px solid #2a2a2a' }}>
                  <button
                    onClick={() => handleSearch()}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#E50914', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Brain size={13} /> Get AI recommendations for "{searchQuery}"
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: 16 }}>
                <p style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                  <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Popular Searches
                </p>
                {popularSearches.map(s => (
                  <motion.button
                    key={s}
                    whileHover={{ x: 4, color: '#fff' }}
                    onClick={() => { setSearchQuery(s); handleSearch(s); }}
                    style={{
                      display: 'block', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#888', fontSize: '0.85rem',
                      padding: '6px 0', textAlign: 'left', width: '100%',
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};