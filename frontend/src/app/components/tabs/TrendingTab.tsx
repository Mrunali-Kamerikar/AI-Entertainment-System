import { useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Brain, Flame, Award, Film, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrendingRow } from '../TrendingRow';
import { MovieCard } from '../MovieCard';
import { LoadingSpinner } from '../LoadingSpinner';
import { calculateTrendingMovies } from '../../data/mockData';
import { clearAllCaches } from '../../services/tmdb';

export const TrendingTab: React.FC = () => {
  const { trendingMovies, fetchTrending, isLoading, allMovies, reloadMovies } = useApp();

  useEffect(() => {
    fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler to reload movies with cache clearing
  const handleRetry = () => {
    console.log('🔄 Retry button clicked - clearing caches and reloading');
    clearAllCaches();
    reloadMovies();
  };

  // Use loaded movies from TMDB (real-time data only)
  const moviesSource = allMovies.length > 0 ? allMovies : [];

  // Dynamic trending movies based on popularity and recency
  const dynamicTrending = calculateTrendingMovies(moviesSource);
  const topTen = dynamicTrending.slice(0, 10);
  
  // Industry-based categorization
  const hollywoodMovies = moviesSource.filter(m => m.industry === 'Hollywood').slice(0, 8);
  const bollywoodMovies = moviesSource.filter(m => m.industry === 'Bollywood').slice(0, 8);
  const tollywoodMovies = moviesSource.filter(m => m.industry === 'Tollywood').slice(0, 8);
  const animeMovies = moviesSource.filter(m => m.industry === 'Anime').slice(0, 8);
  const kdramaMovies = moviesSource.filter(m => m.industry === 'K-Drama').slice(0, 8);
  
  // Genre-based categories
  const actionAdventure = moviesSource.filter(m => m.genres.includes('Action') || m.genres.includes('Adventure')).slice(0, 8);
  const sciFi = moviesSource.filter(m => m.genres.includes('Sci-Fi')).slice(0, 8);
  const topRated = [...moviesSource].sort((a, b) => b.vote_average - a.vote_average).slice(0, 8);

  return (
    <div>
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(229,9,20,0.1), rgba(255,68,68,0.05), transparent)',
          border: '1px solid rgba(229,9,20,0.15)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={24} color="#E50914" />
          </div>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Trending Now</h2>
            <p style={{ color: '#666', margin: 0, fontSize: '0.8rem' }}>
              Real-time data · Powered by TMDB & AI analysis
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { icon: TrendingUp, label: 'This Week', value: `${topTen.length} films`, color: '#4BCBEB' },
            { icon: Brain, label: 'AI Picks', value: `${moviesSource.length} total`, color: '#E50914' },
            { icon: Award, label: 'Top Rated', value: topRated.length > 0 ? `${topRated[0]?.vote_average?.toFixed(1)}+ avg` : 'N/A', color: '#F7B731' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <stat.icon size={16} color={stat.color} style={{ marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
              <p style={{ color: '#fff', margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>{stat.value}</p>
              <p style={{ color: '#555', margin: 0, fontSize: '0.7rem' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <LoadingSpinner size="lg" text="Loading real-time data from TMDB..." />
        </div>
      ) : moviesSource.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <Brain size={48} color="#666" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '1.1rem' }}>
            No movies available
          </h3>
          <p style={{ color: '#666', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            Unable to load movies from TMDB. Please check your internet connection and refresh the page.
          </p>
          <button
            onClick={handleRetry}
            disabled={isLoading}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: isLoading ? '#666' : '#E50914',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = '#c20710';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = '#E50914';
            }}
          >
            <RefreshCw size={16} style={{ display: 'inline-block' }} />
            {isLoading ? 'Loading...' : 'Retry Loading Movies'}
          </button>
        </div>
      ) : (
        <div>
          {/* Top 10 row with numbers */}
          {topTen.length > 0 && <TrendingRow title="Top 10 This Week" movies={topTen} showRank />}

          {/* Grid of top rated */}
          {topRated.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Award size={18} color="#F7B731" />
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                  Highest Rated
                </h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                gap: 14,
              }}>
                {topRated.slice(0, 8).map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Action & Adventure row */}
          {actionAdventure.length > 0 && <TrendingRow title="Action & Adventure" movies={actionAdventure} />}

          {/* Sci-Fi row */}
          {sciFi.length > 0 && <TrendingRow title="Sci-Fi Universe" movies={sciFi} />}

          {/* Industry-based sections */}
          {(hollywoodMovies.length > 0 || bollywoodMovies.length > 0 || tollywoodMovies.length > 0 || animeMovies.length > 0 || kdramaMovies.length > 0) && (
            <div style={{ marginTop: 48, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <Film size={20} color="#E50914" />
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                  Explore by Industry
                </h2>
              </div>

              {/* Hollywood */}
              {hollywoodMovies.length > 0 && <TrendingRow title="🎬 Hollywood Blockbusters" movies={hollywoodMovies} />}

              {/* Bollywood */}
              {bollywoodMovies.length > 0 && <TrendingRow title="🎭 Bollywood Hits" movies={bollywoodMovies} />}

              {/* Tollywood */}
              {tollywoodMovies.length > 0 && <TrendingRow title="🎪 Tollywood Epics" movies={tollywoodMovies} />}

              {/* Anime */}
              {animeMovies.length > 0 && <TrendingRow title="⚡ Anime Masterpieces" movies={animeMovies} />}

              {/* K-Drama */}
              {kdramaMovies.length > 0 && <TrendingRow title="🌸 K-Drama Films" movies={kdramaMovies} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};