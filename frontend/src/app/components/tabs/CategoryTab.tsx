import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { MovieGrid } from '../MovieGrid';
import { TagFilters } from '../TagFilters';

interface CategoryTabProps {
  category: string;
}

export const CategoryTab: React.FC<CategoryTabProps> = ({ category }) => {
  const { allMovies, activeGenreFilter } = useApp();

  // Map category to display name
  const displayNames: Record<string, string> = {
    bollywood: 'Bollywood',
    hollywood: 'Hollywood',
    tollywood: 'Tollywood',
    kdrama: 'K-Drama',
    anime: 'Anime',
  };

  const displayName = displayNames[category] || category;

  // Filter movies by industry/category
  const categoryMovies = allMovies.filter(movie => {
    const movieIndustry = movie.industry?.toLowerCase();
    return movieIndustry === category.toLowerCase() || 
           (category === 'kdrama' && movieIndustry === 'k-drama');
  });

  // Apply genre filter if not 'All'
  const filteredMovies = activeGenreFilter === 'All' 
    ? categoryMovies 
    : categoryMovies.filter(movie => 
        movie.genres?.some(g => g.toLowerCase() === activeGenreFilter.toLowerCase())
      );

  // Show loading state if no movies loaded yet
  const isLoading = allMovies.length === 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: 8,
        }}>
          {displayName}
        </h1>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          {isLoading ? 'Loading movies...' : `Browse ${categoryMovies.length} movies from ${displayName}`}
        </p>
      </div>

      {/* Genre Filters */}
      <TagFilters />

      {/* Movie Grid with unified component */}
      <div style={{ marginTop: 24 }}>
        <MovieGrid
          movies={filteredMovies}
          isLoading={isLoading}
          emptyStateType={activeGenreFilter !== 'All' ? 'search' : 'nodata'}
          emptyStateMessage={
            activeGenreFilter !== 'All'
              ? `No ${displayName} movies found in "${activeGenreFilter}" genre. Try selecting a different genre filter.`
              : `No ${displayName} movies available at the moment.`
          }
          skeletonCount={12}
        />
      </div>
    </div>
  );
};