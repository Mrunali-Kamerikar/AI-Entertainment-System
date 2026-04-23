import { motion } from 'motion/react';
import { SentimentCard } from './SentimentCard';
import { calculateSentiment } from '../utils/sentimentCalculator';
import { MOCK_MOVIES } from '../data/mockData';

/**
 * SentimentDemo Component
 * Demonstrates dynamic sentiment calculation for different movies
 * Shows how ratings translate to realistic audience sentiment distributions
 */
export const SentimentDemo: React.FC = () => {
  // Select a diverse set of movies with different ratings
  const demoMovies = [
    MOCK_MOVIES[0], // Inception (8.4)
    MOCK_MOVIES[1], // The Dark Knight (9.0)
    MOCK_MOVIES[4], // Arrival (7.9)
    MOCK_MOVIES[11], // Get Out (7.7)
  ];

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          marginBottom: 12,
          fontWeight: 700,
        }}>
          🎬 Dynamic Sentiment Analysis
        </h1>
        <p style={{ 
          color: '#888', 
          fontSize: '0.95rem',
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Each movie's sentiment is dynamically calculated based on its TMDB rating and vote count.
          Higher-rated movies show more positive sentiment, while lower-rated ones display more mixed or negative feedback.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: 32,
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      }}>
        {demoMovies.map((movie, index) => {
          const sentiment = calculateSentiment(
            movie.vote_average,
            movie.vote_count || 5000,
            movie.tmdbId
          );

          return (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: 16,
                padding: 24,
                overflow: 'hidden',
              }}
            >
              {/* Movie Info Header */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ 
                  color: '#fff', 
                  margin: '0 0 8px 0',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}>
                  {movie.title}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  gap: 12, 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ 
                    color: '#F5C518', 
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}>
                    ★ {movie.vote_average.toFixed(1)}/10
                  </span>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>
                    •
                  </span>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>
                    {movie.release_date.slice(0, 4)}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>
                    •
                  </span>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>
                    {movie.vote_count?.toLocaleString() || '5,000'} votes
                  </span>
                </div>
              </div>

              {/* Sentiment Card */}
              <SentimentCard
                positive={sentiment.positive}
                mixed={sentiment.mixed}
                negative={sentiment.negative}
                showIcons={true}
                compact={false}
              />

              {/* Rating Category Badge */}
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: movie.vote_average >= 8.0 
                    ? 'rgba(38, 222, 129, 0.15)' 
                    : movie.vote_average >= 6.0 
                    ? 'rgba(247, 183, 49, 0.15)' 
                    : 'rgba(252, 92, 101, 0.15)',
                  color: movie.vote_average >= 8.0 
                    ? '#26de81' 
                    : movie.vote_average >= 6.0 
                    ? '#F7B731' 
                    : '#fc5c65',
                  border: `1px solid ${
                    movie.vote_average >= 8.0 
                      ? '#26de8133' 
                      : movie.vote_average >= 6.0 
                      ? '#F7B73133' 
                      : '#fc5c6533'
                  }`,
                }}>
                  {movie.vote_average >= 8.0 
                    ? '🏆 Highly Rated' 
                    : movie.vote_average >= 6.0 
                    ? '👍 Well Received' 
                    : '🤔 Mixed Reception'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Features List */}
      <div style={{ 
        marginTop: 48,
        padding: 24,
        background: 'rgba(229,9,20,0.05)',
        border: '1px solid rgba(229,9,20,0.2)',
        borderRadius: 12,
      }}>
        <h3 style={{ 
          color: '#E50914', 
          fontSize: '1.1rem',
          marginBottom: 16,
          fontWeight: 600,
        }}>
          ✨ Key Features
        </h3>
        <ul style={{ 
          color: '#aaa', 
          fontSize: '0.9rem',
          lineHeight: 1.8,
          paddingLeft: 24,
          margin: 0,
        }}>
          <li>
            <strong style={{ color: '#fff' }}>Dynamic Calculation:</strong> Sentiment percentages are generated based on TMDB rating and vote count
          </li>
          <li>
            <strong style={{ color: '#fff' }}>Unique Per Movie:</strong> Each movie gets different percentages using seeded randomization
          </li>
          <li>
            <strong style={{ color: '#fff' }}>Always Adds to 100%:</strong> Positive + Mixed + Negative = 100% guaranteed
          </li>
          <li>
            <strong style={{ color: '#fff' }}>Realistic Distribution:</strong> Higher-rated movies (8.0-10) → 70-90% positive
          </li>
          <li>
            <strong style={{ color: '#fff' }}>Rating-Based Logic:</strong> Medium-rated (6.0-7.9) → balanced mix, Low-rated (&lt;6.0) → higher negative
          </li>
          <li>
            <strong style={{ color: '#fff' }}>Consistent Results:</strong> Same movie always gets the same sentiment (deterministic)
          </li>
        </ul>
      </div>

      {/* Usage Instructions */}
      <div style={{ 
        marginTop: 24,
        padding: 24,
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 12,
      }}>
        <h3 style={{ 
          color: '#fff', 
          fontSize: '1.1rem',
          marginBottom: 16,
          fontWeight: 600,
        }}>
          📖 How to Use
        </h3>
        <div style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <p style={{ marginTop: 0 }}>
            The sentiment system is already integrated into the <strong style={{ color: '#E50914' }}>Reviews Tab</strong> and <strong style={{ color: '#E50914' }}>Movie Modal</strong>.
          </p>
          <p>
            <strong style={{ color: '#fff' }}>In the Reviews Tab:</strong><br />
            Select any movie to see its unique sentiment breakdown displayed with animated cards.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong style={{ color: '#fff' }}>In the Movie Modal:</strong><br />
            Click on any movie poster, then navigate to the "Reviews" tab to see the sentiment analysis.
          </p>
        </div>
      </div>
    </div>
  );
};
