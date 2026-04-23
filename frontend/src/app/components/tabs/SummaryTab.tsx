import { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, BookOpen, Tag, BarChart2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getImageUrl } from '../../services/tmdb';
import { getMovieSummary } from '../../services/backend';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { LoadingSpinner } from '../LoadingSpinner';
import { AIScoreBreakdown } from '../AIScoreBreakdown';

export const SummaryTab: React.FC = () => {
  const { recommendations, setSelectedMovie } = useApp();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMovie = recommendations.find(m => m.id === selectedId) || null;

  const loadSummary = async (id: number) => {
    const movie = recommendations.find(m => m.id === id);
    if (!movie) return;
    setSelectedId(id);
    setSummary(null);
    setIsLoading(true);
    const data = await getMovieSummary(movie.tmdbId, movie.title);
    setSummary(data);
    setIsLoading(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Movie selector list */}
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
              onClick={() => loadSummary(movie.id)}
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

      {/* Summary content */}
      <div className="md:col-span-2">
        {!selectedMovie ? (
          <div style={{
            height: 400, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={28} color="#E50914" />
            </div>
            <p style={{ color: '#555', textAlign: 'center', fontSize: '0.9rem' }}>
              Select a movie to get an AI-powered summary
            </p>
          </div>
        ) : isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <LoadingSpinner size="lg" text="AI is generating summary..." />
          </div>
        ) : summary ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Movie header */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
              <ImageWithFallback
                src={selectedMovie.poster_path?.startsWith('/') ? getImageUrl(selectedMovie.poster_path, 'w300') : selectedMovie.poster_path}
                alt={selectedMovie.title}
                style={{ width: 80, borderRadius: 8, flexShrink: 0 }}
              />
              <div>
                <h2 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.4rem' }}>{selectedMovie.title}</h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedMovie.genres.map(g => (
                    <span key={g} style={{
                      background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.25)',
                      borderRadius: 4, padding: '2px 8px', color: '#E50914', fontSize: '0.72rem',
                    }}>{g}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedMovie(selectedMovie)}
                style={{
                  marginLeft: 'auto', background: '#E50914', border: 'none',
                  borderRadius: 8, padding: '8px 16px', color: '#fff',
                  cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0,
                }}
              >
                View Details
              </button>
            </div>

            {/* AI Summary */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(229,9,20,0.06), transparent)',
              border: '1px solid rgba(229,9,20,0.15)',
              borderRadius: 12, padding: 20, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Brain size={16} color="#E50914" />
                <span style={{ color: '#E50914', fontWeight: 600, fontSize: '0.85rem' }}>AI Summary</span>
                <span style={{
                  background: 'rgba(38,222,129,0.1)', border: '1px solid rgba(38,222,129,0.2)',
                  borderRadius: 4, padding: '1px 6px', color: '#26de81', fontSize: '0.68rem', marginLeft: 'auto',
                }}>
                  Sentiment: {(summary as { sentiment: string }).sentiment}
                </span>
              </div>
              <p style={{ color: '#ccc', lineHeight: 1.7, margin: 0, fontSize: '0.88rem' }}>
                {(summary as { summary: string }).summary}
              </p>
            </div>

            {/* Themes */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Tag size={14} color="#888" />
                <span style={{ color: '#888', fontSize: '0.78rem' }}>Key Themes</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {((summary as { themes: string[] }).themes || []).map((theme: string) => (
                  <span key={theme} style={{
                    background: '#1F1F1F', border: '1px solid #2a2a2a',
                    borderRadius: 20, padding: '6px 14px', color: '#aaa', fontSize: '0.8rem',
                  }}>
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Score Breakdown */}
            <AIScoreBreakdown
              breakdown={selectedMovie.aiScoreBreakdown}
              totalScore={selectedMovie.aiScore}
            />

            {/* Key Scenes */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <BarChart2 size={14} color="#888" />
                <span style={{ color: '#888', fontSize: '0.78rem' }}>Notable Moments</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {((summary as { keyScenes: string[] }).keyScenes || []).map((scene: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#E50914', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '0.83rem' }}>{scene}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
