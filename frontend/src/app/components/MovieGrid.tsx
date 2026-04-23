import React from 'react';
import { motion } from 'motion/react';
import { MovieData } from '../data/mockData';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';
import { EmptyState } from './EmptyState';

interface MovieGridProps {
  movies: MovieData[];
  isLoading?: boolean;
  emptyStateType?: 'search' | 'nodata' | 'error';
  emptyStateMessage?: string;
  skeletonCount?: number;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  isLoading = false,
  emptyStateType = 'nodata',
  emptyStateMessage,
  skeletonCount = 12,
  columns = {
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
  },
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
          gap: 16,
          width: '100%',
        }}
        className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      >
        {[...Array(skeletonCount)].map((_, index) => (
          <MovieCardSkeleton key={`skeleton-${index}`} index={index} />
        ))}
      </div>
    );
  }

  // Empty State
  if (!movies || movies.length === 0) {
    return (
      <EmptyState
        type={emptyStateType}
        message={emptyStateMessage}
      />
    );
  }

  // Movies Grid
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
        gap: 16,
        width: '100%',
      }}
      className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    >
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} index={index} />
      ))}
    </motion.div>
  );
};
