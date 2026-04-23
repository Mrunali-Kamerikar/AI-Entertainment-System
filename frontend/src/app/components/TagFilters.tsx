import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

const GENRES = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'War', 'Western',
];

export const TagFilters: React.FC = () => {
  const { activeGenreFilter, setActiveGenreFilter, fetchRecommendations } = useApp();

  const handleSelect = (genre: string) => {
    setActiveGenreFilter(genre);
    if (genre !== 'All') {
      fetchRecommendations(genre);
    }
  };

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {GENRES.map(genre => {
        const active = genre === activeGenreFilter;
        return (
          <motion.button
            key={genre}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(genre)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 20,
              border: active ? '1.5px solid #E50914' : '1.5px solid #333',
              backgroundColor: active ? 'rgba(229,9,20,0.15)' : 'transparent',
              color: active ? '#E50914' : '#aaa',
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              fontWeight: active ? 600 : 400,
            }}
          >
            {genre}
          </motion.button>
        );
      })}
    </div>
  );
};