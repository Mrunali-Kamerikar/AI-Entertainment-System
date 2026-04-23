import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ThumbsUp, Filter, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getImageUrl } from '../../services/tmdb';
import { getMovieReviews } from '../../services/backend';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { LoadingSpinner } from '../LoadingSpinner';
import { SentimentCard } from '../SentimentCard';

type SortBy = 'helpful' | 'recent' | 'rating';

export const ReviewsTab: React.FC = () => {
  const { recommendations } = useApp();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('helpful');
  const [filterSentiment, setFilterSentiment] = useState<string>('All');

  const selectedMovie = recommendations.find(m => m.id === selectedId) || null;

  const loadReviews = async (id: number) => {
    const movie = recommendations.find(m => m.id === id);
    if (!movie) return;
    setSelectedId(id);
    setReviews(null);
    setIsLoading(true);
    const data = await getMovieReviews(
      movie.tmdbId,
      movie.vote_average || 7.0,
      movie.vote_count || 1000
    );
    setReviews(data);
    setIsLoading(false);
  };

  const reviewList = (reviews as { reviews: { id: number; author: string; rating: number; content: string; sentiment: string; date: string; helpfulVotes: number }[] } | null)?.reviews || [];
  const filtered = reviewList.filter(r => filterSentiment === 'All' || r.sentiment === filterSentiment);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpfulVotes - a.helpfulVotes;
    if (sortBy === 'rating') return b.rating - a.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const sentimentColor = (s: string) => s === 'Positive' ? '#26de81' : s === 'Mixed' ? '#F7B731' : '#fc5c65';

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Movie selector */}
      <div style={{
        background: '#0d0d0d', borderRadius: 12, border: '1px solid #1a1a1a',
        overflow: 'hidden', maxHeight: 600, overflowY: 'auto',
        scrollbarWidth: 'thin', scrollbarColor: '#1a1a1a transparent',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a' }}>
          <p style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Select a Movie
          </p>
        </div>
        {recommendations.slice(0, 16).map(movie => {
          const url = movie.poster_path?.startsWith('/')
            ? getImageUrl(movie.poster_path, 'w300')
            : `https://placehold.co/60x90/181818/555?text=${encodeURIComponent(movie.title[0])}`;
          return (
            <motion.div
              key={movie.id}
              whileHover={{ background: 'rgba(229,9,20,0.06)' }}
              onClick={() => loadReviews(movie.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', cursor: 'pointer',
                background: selectedId === movie.id ? 'rgba(229,9,20,0.1)' : 'transparent',
                borderLeft: selectedId === movie.id ? '2px solid #E50914' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <ImageWithFallback src={url} alt={movie.title} style={{ width: 32, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ color: '#ccc', margin: 0, fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {movie.title}
                </p>
                <p style={{ color: '#555', margin: 0, fontSize: '0.7rem' }}>{movie.release_date?.slice(0, 4)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reviews content */}
      <div className="md:col-span-2">
        {!selectedMovie ? (
          <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare size={28} color="#E50914" />
            </div>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>Select a movie to view reviews</p>
          </div>
        ) : isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <LoadingSpinner size="lg" text="Loading reviews..." />
          </div>
        ) : reviews ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Movie header */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>{selectedMovie.title}</h2>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>
                Avg: <span style={{ color: '#F5C518' }}>★ {(reviews as { averageRating: number }).averageRating}</span>
              </span>
            </div>

            {/* Sentiment overview */}
            <div style={{ marginBottom: 20 }}>
              <SentimentCard
                positive={(reviews as { sentimentBreakdown: { positive: number } }).sentimentBreakdown?.positive || 0}
                mixed={(reviews as { sentimentBreakdown: { mixed: number } }).sentimentBreakdown?.mixed || 0}
                negative={(reviews as { sentimentBreakdown: { negative: number } }).sentimentBreakdown?.negative || 0}
                compact={true}
              />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={13} color="#666" />
                <span style={{ color: '#666', fontSize: '0.78rem' }}>Sort:</span>
              </div>
              {(['helpful', 'recent', 'rating'] as SortBy[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  style={{
                    background: sortBy === s ? 'rgba(229,9,20,0.15)' : 'transparent',
                    border: `1px solid ${sortBy === s ? 'rgba(229,9,20,0.3)' : '#333'}`,
                    borderRadius: 6, padding: '4px 10px',
                    color: sortBy === s ? '#E50914' : '#777',
                    cursor: 'pointer', fontSize: '0.75rem', textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {['All', 'Positive', 'Mixed', 'Negative'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterSentiment(s)}
                    style={{
                      background: filterSentiment === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: '1px solid #333', borderRadius: 6, padding: '4px 10px',
                      color: filterSentiment === s ? '#fff' : '#666',
                      cursor: 'pointer', fontSize: '0.72rem',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sorted.map(review => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: '#1a1a1a', border: '1px solid #222',
                    borderRadius: 10, padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${sentimentColor(review.sentiment)}, #333)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                      }}>
                        {review.author[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: '#ccc', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{review.author}</p>
                        <p style={{ color: '#555', margin: 0, fontSize: '0.7rem' }}>{review.date}</p>
                      </div>
                      <span style={{
                        background: `${sentimentColor(review.sentiment)}15`,
                        border: `1px solid ${sentimentColor(review.sentiment)}30`,
                        color: sentimentColor(review.sentiment),
                        borderRadius: 4, padding: '2px 7px', fontSize: '0.68rem',
                      }}>
                        {review.sentiment}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} fill="#F5C518" stroke="none" />
                      <span style={{ color: '#F5C518', fontSize: '0.82rem', fontWeight: 700 }}>{review.rating}</span>
                      <span style={{ color: '#444', fontSize: '0.75rem' }}>/10</span>
                    </div>
                  </div>
                  <p style={{ color: '#aaa', fontSize: '0.83rem', lineHeight: 1.6, margin: '0 0 10px' }}>
                    {review.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a',
                      borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                      color: '#666', fontSize: '0.72rem',
                    }}>
                      <ThumbsUp size={11} /> {review.helpfulVotes}
                    </button>
                    <span style={{ color: '#444', fontSize: '0.7rem' }}>found helpful</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};