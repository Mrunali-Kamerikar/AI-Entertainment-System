import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Plus, ThumbsUp, Star, Clock, Calendar, Brain } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StarRating } from './StarRating';
import { AIScoreBreakdown } from './AIScoreBreakdown';
import { getImageUrl, getBackdropUrl, fetchMovieDetail, TMDBMovieDetail } from '../services/tmdb';
import { getMovieReviews } from '../services/backend';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LoadingSpinner } from './LoadingSpinner';
import { generateAISummary } from '../services/aiSummary';
import { generateMovieSummaryWithGemini } from '../services/geminiService';

type ModalTab = 'overview' | 'summary' | 'reviews' | 'similar';

export const MovieModal: React.FC = () => {
  const { selectedMovie, setSelectedMovie, userRatings, submitRating, allMovies } = useApp();
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [reviews, setReviews] = useState<Record<string, unknown> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [movieDetails, setMovieDetails] = useState<TMDBMovieDetail | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [ratingDistribution] = useState([
    { stars: 5, pct: 45 }, { stars: 4, pct: 30 }, { stars: 3, pct: 15 },
    { stars: 2, pct: 7 }, { stars: 1, pct: 3 },
  ]);

  const movie = selectedMovie;
  const currentRating = movie ? (userRatings[movie.id] || 0) : 0;

  // Get similar movies based on genre - more sophisticated matching
  const similarMovies = movie
    ? allMovies.filter(m => {
        if (m.id === movie.id) return false;
        // Match by primary genres
        const genreOverlap = m.genres.filter(g => movie.genres.includes(g)).length;
        // Match by industry for better relevance
        const sameIndustry = m.industry === movie.industry;
        // Prefer movies with genre overlap or same industry
        return genreOverlap > 0 || sameIndustry;
      })
      .sort((a, b) => {
        const aOverlap = a.genres.filter(g => movie.genres.includes(g)).length;
        const bOverlap = b.genres.filter(g => movie.genres.includes(g)).length;
        // Sort by genre overlap first, then by rating
        if (aOverlap !== bOverlap) return bOverlap - aOverlap;
        return b.vote_average - a.vote_average;
      })
      .slice(0, 8)
    : [];

  useEffect(() => {
    if (!movie) return;
    setActiveTab('overview');
    setSummary(null);
    setReviews(null);
    setMovieDetails(null);
    
    // Fetch movie details from TMDB
    const loadMovieDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const details = await fetchMovieDetail(movie.tmdbId);
        setMovieDetails(details);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    
    loadMovieDetails();
  }, [movie]);

  const loadTabData = async (tab: ModalTab) => {
    setActiveTab(tab);
    if (!movie) return;
    
    if (tab === 'summary' && !summary) {
      setIsLoadingData(true);
      try {
        // Step 1: Try Gemini for a truly unique AI summary
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 2020;
        const geminiSummary = await generateMovieSummaryWithGemini(movie.tmdbId || movie.id, {
          title: movie.title,
          year,
          genres: movie.genres,
          overview: movie.overview || '',
          tagline: movie.tagline || (movieDetails?.tagline ?? ''),
          vote_average: movie.vote_average,
          runtime: movieDetails?.runtime || movie.runtime || 120,
          industry: movie.industry,
          cast: movie.cast,
        });

        if (geminiSummary) {
          setSummary(geminiSummary as unknown as Record<string, unknown>);
        } else if (movieDetails) {
          // Step 2: Fallback to template-based summary using TMDB details
          const aiSummary = generateAISummary(movieDetails);
          setSummary(aiSummary as unknown as Record<string, unknown>);
        } else {
          // Step 3: Final fallback — generate from movie's own data
          const partialDetail: TMDBMovieDetail = {
            id: movie.tmdbId,
            title: movie.title,
            overview: movie.overview || '',
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: 1000,
            genre_ids: movie.genre_ids || [],
            popularity: movie.popularity || 50,
            original_language: 'en',
            genres: (movie.genres || []).map(g => ({ id: 0, name: g })),
            runtime: movie.runtime || 120,
            tagline: movie.tagline || '',
            budget: 0,
            revenue: 0,
            status: 'Released',
          };
          const aiSummary = generateAISummary(partialDetail);
          setSummary(aiSummary as unknown as Record<string, unknown>);
        }
      } catch (error) {
        console.error('Error generating summary:', error);
        // Emergency fallback
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 2020;
        setSummary({
          summary: `${movie.title} (${year}) is a ${movie.genres.slice(0, 2).join(' & ')} film that ${movie.vote_average >= 8 ? 'has earned exceptional critical acclaim' : 'has resonated strongly with audiences worldwide'}. ${movie.overview || 'A compelling cinematic experience worth exploring.'}`,
          themes: movie.genres.slice(0, 4),
          aiInsight: `Rated ${movie.vote_average.toFixed(1)}/10, this ${movie.industry || 'international'} film stands as a noteworthy entry in its genre. ${movie.tagline ? `"${movie.tagline}"` : ''}`,
        });
      } finally {
        setIsLoadingData(false);
      }
    }
    
    if (tab === 'reviews' && !reviews) {
      setIsLoadingData(true);
      const data = await getMovieReviews(
        movie.tmdbId,
        movie.vote_average || 7.0,
        movie.vote_count || 1000
      );
      setReviews(data);
      setIsLoadingData(false);
    }
  };

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path
    ? (movie.backdrop_path.startsWith('/') ? getBackdropUrl(movie.backdrop_path) : movie.backdrop_path)
    : null;
  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('/') ? getImageUrl(movie.poster_path, 'w500') : movie.poster_path)
    : `https://placehold.co/300x450/181818/555?text=${encodeURIComponent(movie.title)}`;

  const TABS: { key: ModalTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'summary', label: 'AI Summary' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'similar', label: 'Similar' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
        onClick={() => setSelectedMovie(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            background: '#141414',
            borderRadius: 16,
            overflow: 'hidden',
            maxWidth: 900,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 transparent',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Backdrop Header */}
          <div style={{ position: 'relative', aspectRatio: '16/7', overflow: 'hidden', minHeight: 220 }}>
            {backdropUrl ? (
              <ImageWithFallback
                src={backdropUrl}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#333', fontSize: '4rem' }}>🎬</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(20,20,20,0.95) 25%, transparent 60%, rgba(20,20,20,0.3) 100%)',
            }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
              background: 'linear-gradient(to top, #141414, transparent)',
            }} />

            {/* Close Button */}
            <button
              onClick={() => setSelectedMovie(null)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <X size={16} />
            </button>

            {/* Hero Info */}
            <div style={{
              position: 'absolute', bottom: 20, left: 24, right: 24,
              display: 'flex', alignItems: 'flex-end', gap: 20,
            }}>
              <ImageWithFallback
                src={posterUrl}
                alt={movie.title}
                style={{
                  width: 100, borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                  flexShrink: 0, display: 'block',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1.6rem' }}>{movie.title}</h2>
                {movie.tagline && (
                  <p style={{ color: '#E50914', fontSize: '0.85rem', margin: '0 0 8px', fontStyle: 'italic' }}>
                    "{movie.tagline}"
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {movie.genres.slice(0, 3).map(g => (
                      <span key={g} style={{
                        background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)',
                        borderRadius: 5, padding: '2px 8px', color: '#E50914', fontSize: '0.75rem',
                      }}>{g}</span>
                    ))}
                  </div>
                  {movie.release_date && (
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {movie.release_date.slice(0, 4)}
                    </span>
                  )}
                  {movie.runtime > 0 && (
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {movie.runtime}m
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F5C518', fontSize: '0.78rem' }}>
                    <Star size={12} fill="#F5C518" stroke="none" /> {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
              {/* AI Score pill */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(229,9,20,0.2), rgba(229,9,20,0.05))',
                border: '1px solid rgba(229,9,20,0.4)',
                borderRadius: 12, padding: '12px 16px', textAlign: 'center', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Brain size={14} color="#E50914" />
                  <span style={{ color: '#aaa', fontSize: '0.7rem' }}>AI SCORE</span>
                </div>
                <span style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>{movie.aiScore}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ padding: '16px 24px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8,
                color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              <Play size={16} fill="#000" stroke="none" /> Play
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, padding: '10px 20px',
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              <Plus size={16} /> My List
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%', width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <ThumbsUp size={16} />
            </motion.button>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#888', fontSize: '0.82rem' }}>Your rating:</span>
              <StarRating
                size="md"
                value={currentRating}
                onChange={rating => submitRating(movie.id, rating)}
                showValue
              />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ padding: '0 24px', marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #2a2a2a' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => loadTabData(tab.key)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 16px',
                    color: activeTab === tab.key ? '#fff' : '#666',
                    fontWeight: activeTab === tab.key ? 600 : 400,
                    borderBottom: `2px solid ${activeTab === tab.key ? '#E50914' : 'transparent'}`,
                    marginBottom: -1, fontSize: '0.85rem', transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: 24 }}>
            {isLoadingData && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <LoadingSpinner text="AI is analyzing..." />
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {isLoadingDetails ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                      <LoadingSpinner text="Loading movie details..." />
                    </div>
                  ) : (
                    <>
                      <p style={{ color: '#ccc', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: 20 }}>
                        {movieDetails?.overview || movie.overview || 'Overview not available for this movie.'}
                      </p>
                      <AIScoreBreakdown
                        breakdown={movie.aiScoreBreakdown}
                        totalScore={movie.aiScore}
                      />
                    </>
                  )}
                </div>
                <div>
                  {/* Rating Distribution */}
                  <div style={{
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    borderRadius: 12, padding: 16, marginBottom: 16,
                  }}>
                    <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 12px', fontSize: '0.85rem' }}>
                      Rating Distribution
                    </p>
                    {ratingDistribution.map(r => (
                      <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Star size={12} fill="#F5C518" stroke="none" />
                        <span style={{ color: '#888', fontSize: '0.75rem', width: 12 }}>{r.stars}</span>
                        <div style={{ flex: 1, background: '#2a2a2a', borderRadius: 3, height: 6 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${r.pct}%` }}
                            transition={{ duration: 0.8, delay: r.stars * 0.1 }}
                            style={{ height: '100%', background: '#F5C518', borderRadius: 3 }}
                          />
                        </div>
                        <span style={{ color: '#666', fontSize: '0.72rem', width: 28 }}>{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
                    <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 12px', fontSize: '0.85rem' }}>Details</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> Year
                        </span>
                        <span style={{ color: '#ccc', fontSize: '0.8rem' }}>
                          {movieDetails?.release_date?.slice(0, 4) || movie.release_date?.slice(0, 4) || 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> Runtime
                        </span>
                        <span style={{ color: '#ccc', fontSize: '0.8rem' }}>
                          {movieDetails?.runtime || movie.runtime || 'N/A'}{movieDetails?.runtime || movie.runtime ? 'm' : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={12} /> Rating
                        </span>
                        <span style={{ color: '#ccc', fontSize: '0.8rem' }}>
                          {movieDetails?.vote_average?.toFixed(1) || movie.vote_average?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      {(movieDetails?.genres || movie.genres) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>Genres</span>
                          <span style={{ color: '#ccc', fontSize: '0.8rem', textAlign: 'right', flex: 1, marginLeft: 8 }}>
                            {movieDetails?.genres?.map(g => g.name).join(', ') || movie.genres?.join(', ')}
                          </span>
                        </div>
                      )}
                      {movie.industry && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>Industry</span>
                          <span style={{ color: '#E50914', fontSize: '0.8rem', fontWeight: 600 }}>{movie.industry}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Cast Details */}
                  {movie.cast && movie.cast.length > 0 && (
                    <div style={{
                      background: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: 12, padding: 16, marginTop: 16,
                    }}>
                      <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 12px', fontSize: '0.85rem' }}>Cast</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {movie.cast.slice(0, 5).map((actor, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #E50914, #ff4444)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                            }}>
                              {actor[0]}
                            </div>
                            <span style={{ color: '#ccc', fontSize: '0.78rem' }}>{actor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* AI Summary Tab */}
            {activeTab === 'summary' && !isLoadingData && summary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 700 }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(229,9,20,0.08), transparent)',
                  border: '1px solid rgba(229,9,20,0.2)',
                  borderRadius: 12, padding: 20, marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Brain size={18} color="#E50914" />
                    <span style={{ color: '#E50914', fontWeight: 600, fontSize: '0.9rem' }}>AI Analysis</span>
                  </div>
                  <p style={{ color: '#ccc', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
                    {(summary as { summary: string }).summary}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                  {(summary as { themes: string[] }).themes?.map((theme: string) => (
                    <span key={theme} style={{
                      background: '#1F1F1F', border: '1px solid #333',
                      borderRadius: 20, padding: '6px 14px', color: '#ccc', fontSize: '0.8rem',
                    }}>
                      {theme}
                    </span>
                  ))}
                </div>
                <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 16 }}>
                  <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 8px' }}>AI Insight</p>
                  <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                    {(summary as { aiInsight: string }).aiInsight}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && !isLoadingData && reviews && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Sentiment overview */}
                <div style={{
                  display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
                }}>
                  {[
                    { label: 'Positive', value: (reviews as { sentimentBreakdown: { positive: number } }).sentimentBreakdown?.positive, color: '#26de81' },
                    { label: 'Mixed', value: (reviews as { sentimentBreakdown: { mixed: number } }).sentimentBreakdown?.mixed, color: '#F7B731' },
                    { label: 'Negative', value: (reviews as { sentimentBreakdown: { negative: number } }).sentimentBreakdown?.negative, color: '#fc5c65' },
                  ].map(s => (
                    <div key={s.label} style={{
                      flex: 1, minWidth: 100, background: '#1a1a1a', borderRadius: 10, padding: '12px 16px',
                      border: `1px solid ${s.color}22`,
                    }}>
                      <p style={{ color: s.color, fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{s.value}%</p>
                      <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Individual reviews */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {((reviews as { reviews: { id: number; author: string; rating: number; content: string; sentiment: string; date: string; helpfulVotes: number }[] }).reviews || []).map((review) => (
                    <div key={review.id} style={{
                      background: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: 10, padding: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: '#E50914',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                          }}>
                            {review.author[0].toUpperCase()}
                          </div>
                          <span style={{ color: '#ccc', fontWeight: 600, fontSize: '0.85rem' }}>{review.author}</span>
                          <span style={{
                            background: review.sentiment === 'Positive' ? 'rgba(38,222,129,0.1)' : 'rgba(247,183,49,0.1)',
                            border: `1px solid ${review.sentiment === 'Positive' ? '#26de81' : '#F7B731'}33`,
                            color: review.sentiment === 'Positive' ? '#26de81' : '#F7B731',
                            borderRadius: 4, padding: '1px 6px', fontSize: '0.68rem',
                          }}>
                            {review.sentiment}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={12} fill="#F5C518" stroke="none" />
                          <span style={{ color: '#F5C518', fontSize: '0.8rem' }}>{review.rating}/10</span>
                        </div>
                      </div>
                      <p style={{ color: '#aaa', fontSize: '0.83rem', lineHeight: 1.6, margin: 0 }}>
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Similar Movies Tab */}
            {activeTab === 'similar' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarMovies.map(m => {
                    const url = m.poster_path?.startsWith('/')
                      ? getImageUrl(m.poster_path, 'w300')
                      : m.poster_path || `https://placehold.co/300x450/181818/555?text=${encodeURIComponent(m.title)}`;
                    return (
                      <motion.div
                        key={m.id}
                        whileHover={{ scale: 1.03 }}
                        style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden' }}
                        onClick={() => setSelectedMovie(m)}
                      >
                        <ImageWithFallback src={url} alt={m.title} style={{ width: '100%', display: 'block' }} />
                        <div style={{ background: '#1a1a1a', padding: '8px 10px' }}>
                          <p style={{ color: '#fff', margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{m.title}</p>
                          <p style={{ color: '#666', margin: 0, fontSize: '0.72rem' }}>{m.release_date?.slice(0, 4)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};