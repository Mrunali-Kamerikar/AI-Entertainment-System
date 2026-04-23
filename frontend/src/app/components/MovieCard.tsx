import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Brain, ChevronRight } from 'lucide-react';
import { MovieData } from '../data/mockData';
import { StarRating, StarDisplay } from './StarRating';
import { useApp } from '../context/AppContext';
import { getImageUrl } from '../services/tmdb';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MovieCardProps {
  movie: MovieData;
  index?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, index = 0 }) => {
  const { setSelectedMovie, userRatings, submitRating } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const currentRating = userRatings[movie.id] || 0;

  // Build poster URL with proper fallback
  const posterUrl = React.useMemo(() => {
    if (movie.poster_path) {
      // If it's already a full URL, use it
      if (movie.poster_path.startsWith('http')) {
        return movie.poster_path;
      }
      // If it's a TMDB path, construct the full URL
      if (movie.poster_path.startsWith('/')) {
        return getImageUrl(movie.poster_path, 'w300');
      }
    }
    // Return null to trigger fallback component
    return null;
  }, [movie.poster_path]);

  // Fallback poster for when image fails or is missing
  const fallbackPoster = `https://placehold.co/300x450/181818/666666?text=${encodeURIComponent(movie.title.slice(0, 15))}`;

  const handleRating = (e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    submitRating(movie.id, rating);
    setShowRating(false);
  };

  const handleImageError = () => {
    console.warn(`⚠️ Failed to load poster for: ${movie.title}`);
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#181818',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowRating(false); }}
      onClick={() => setSelectedMovie(movie)}
    >
      {/* Poster */}
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
        {!imageLoaded && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #1a1a1a, #252525)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div className="w-8 h-8 border-2 border-[#333] border-t-[#E50914] rounded-full animate-spin" />
          </div>
        )}
        {imageError ? (
          <div
            style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #1a1a1a, #252525)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 8, padding: 20,
            }}
          >
            <div style={{
              fontSize: '3rem',
              color: '#333',
            }}>
              🎬
            </div>
            <p style={{ color: '#555', fontSize: '0.75rem', textAlign: 'center', margin: 0 }}>
              {movie.title}
            </p>
          </div>
        ) : (
          <ImageWithFallback
            src={posterUrl || fallbackPoster}
            alt={movie.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              opacity: imageLoaded ? 1 : 0,
            }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* AI Score Badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'linear-gradient(135deg, #E50914, #ff4444)',
          borderRadius: 6,
          padding: '3px 8px',
          display: 'flex', alignItems: 'center', gap: 4,
          boxShadow: '0 2px 8px rgba(229,9,20,0.4)',
        }}>
          <Brain size={10} color="#fff" />
          <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>{movie.aiScore}</span>
        </div>

        {/* User Rating Badge */}
        {currentRating > 0 && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 6,
            padding: '3px 8px',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Star size={10} fill="#F5C518" stroke="#F5C518" />
            <span style={{ color: '#F5C518', fontSize: '0.72rem', fontWeight: 700 }}>{currentRating}</span>
          </div>
        )}

        {/* Hover Quick Info */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '12px 10px 8px',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <StarDisplay rating={movie.vote_average} />
                <button
                  style={{
                    background: '#E50914', border: 'none', borderRadius: 6,
                    padding: '4px 10px', color: '#fff', fontSize: '0.72rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  }}
                  onClick={e => { e.stopPropagation(); setSelectedMovie(movie); }}
                >
                  Details <ChevronRight size={10} />
                </button>
              </div>

              {/* Star rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#888', fontSize: '0.7rem' }}>Rate:</span>
                <div onClick={e => e.stopPropagation()}>
                  <StarRating
                    size="sm"
                    value={currentRating}
                    onChange={rating => { submitRating(movie.id, rating); }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Footer */}
      <div style={{ padding: '10px 10px 12px' }}>
        <h3 style={{
          color: '#fff', fontWeight: 600, margin: '0 0 4px',
          fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {movie.title}
        </h3>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {movie.genres.slice(0, 2).map(g => (
            <span
              key={g}
              style={{
                background: 'rgba(229,9,20,0.12)',
                border: '1px solid rgba(229,9,20,0.25)',
                borderRadius: 4,
                padding: '1px 6px',
                color: '#E50914',
                fontSize: '0.68rem',
              }}
            >
              {g}
            </span>
          ))}
          <span style={{ color: '#555', fontSize: '0.68rem', alignSelf: 'center' }}>
            {movie.release_date?.slice(0, 4)}
          </span>
        </div>
        {/* Show industry tag if available */}
        {movie.industry && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 4,
              padding: '2px 8px',
              color: '#888',
              fontSize: '0.68rem',
            }}>
              {movie.industry}
            </span>
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      <motion.div
        animate={{
          boxShadow: isHovered
            ? '0 0 0 1px rgba(229,9,20,0.4), 0 8px 32px rgba(229,9,20,0.2)'
            : '0 0 0 1px rgba(255,255,255,0.05)',
        }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute', inset: 0, borderRadius: 10, pointerEvents: 'none' }}
      />
    </motion.div>
  );
};