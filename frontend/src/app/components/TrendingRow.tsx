import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { MovieData } from '../data/mockData';
import { getImageUrl } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TrendingRowProps {
  title: string;
  movies: MovieData[];
  showRank?: boolean;
}

export const TrendingRow: React.FC<TrendingRowProps> = ({ title, movies, showRank = false }) => {
  const { setSelectedMovie } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#E50914" />
          <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
      >
        {movies.map((movie, i) => {
          // Build poster URL with proper fallback handling
          const posterUrl = React.useMemo(() => {
            if (movie.poster_path) {
              if (movie.poster_path.startsWith('http')) {
                return movie.poster_path;
              }
              if (movie.poster_path.startsWith('/')) {
                return getImageUrl(movie.poster_path, 'w300');
              }
            }
            return `https://placehold.co/160x240/181818/666?text=${encodeURIComponent(movie.title.slice(0, 15))}`;
          }, [movie.poster_path, movie.title]);

          return (
            <motion.div
              key={movie.id}
              whileHover={{ y: -4 }}
              style={{
                flexShrink: 0,
                width: showRank ? 130 : 150,
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => setSelectedMovie(movie)}
            >
              {/* Rank number */}
              {showRank && (
                <div style={{
                  position: 'absolute', left: -10, bottom: 60, zIndex: 2,
                  fontSize: '4.5rem', fontWeight: 900, lineHeight: 1,
                  color: '#141414',
                  WebkitTextStroke: '2px #333',
                  userSelect: 'none',
                  fontFamily: "'Bebas Neue', sans-serif",
                }}>
                  {i + 1}
                </div>
              )}
              <div style={{ borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                <ImageWithFallback
                  src={posterUrl}
                  alt={movie.title}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
                {/* Hover overlay */}
                <motion.div
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(20,20,20,0.9) 0%, transparent 60%)',
                    opacity: 0, transition: 'opacity 0.2s',
                    display: 'flex', alignItems: 'flex-end', padding: 8,
                  }}
                >
                  <div>
                    <p style={{ color: '#fff', margin: 0, fontSize: '0.72rem', fontWeight: 600 }}>{movie.title}</p>
                    <p style={{ color: '#E50914', margin: 0, fontSize: '0.68rem' }}>AI: {movie.aiScore}</p>
                  </div>
                </motion.div>

                {/* Glow on hover */}
                <motion.div
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 8,
                    boxShadow: '0 0 0 2px rgba(229,9,20,0.5)',
                    opacity: 0, pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                  }}
                />
              </div>
              <p style={{
                color: '#aaa', margin: '6px 0 2px', fontSize: '0.75rem',
                fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {movie.title}
              </p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {movie.genres.slice(0, 1).map(g => (
                  <span key={g} style={{
                    background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)',
                    borderRadius: 3, padding: '1px 5px', color: '#E50914', fontSize: '0.66rem',
                  }}>{g}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};