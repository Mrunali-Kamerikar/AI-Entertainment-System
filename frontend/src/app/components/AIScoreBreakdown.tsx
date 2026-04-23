import React from 'react';
import { motion } from 'motion/react';

interface ScoreBreakdown {
  similarityScore: number;
  ratingBoost: number;
  genreBoost: number;
  historyPenalty: number;
}

interface AIScoreBreakdownProps {
  breakdown: ScoreBreakdown;
  totalScore: number;
  compact?: boolean;
}

const ScoreBar: React.FC<{ label: string; value: number; max: number; color: string; delay: number }> = ({
  label, value, max, color, delay,
}) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ color: '#aaa', fontSize: '0.78rem' }}>{label}</span>
      <span style={{ color, fontSize: '0.78rem', fontWeight: 600 }}>+{value}</span>
    </div>
    <div style={{ background: '#2a2a2a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 4 }}
      />
    </div>
  </div>
);

export const AIScoreBreakdown: React.FC<AIScoreBreakdownProps> = ({
  breakdown, totalScore, compact = false,
}) => {
  if (compact) {
    return (
      <div style={{
        background: 'rgba(229,9,20,0.08)',
        border: '1px solid rgba(229,9,20,0.2)',
        borderRadius: 8,
        padding: '8px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#E50914', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI Score
          </span>
          <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{totalScore}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i < Math.round(totalScore) ? '#E50914' : '#333',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>AI Score Breakdown</p>
        <div style={{
          background: 'linear-gradient(135deg, #E50914, #ff4d4d)',
          borderRadius: 8,
          padding: '4px 12px',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{totalScore}/10</span>
        </div>
      </div>
      <ScoreBar label="Similarity Score" value={breakdown.similarityScore} max={10} color="#4BCBEB" delay={0.1} />
      <ScoreBar label="Rating Boost" value={breakdown.ratingBoost} max={1} color="#26de81" delay={0.2} />
      <ScoreBar label="Genre Boost" value={breakdown.genreBoost} max={1} color="#F7B731" delay={0.3} />
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a2a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#aaa', fontSize: '0.78rem' }}>History Penalty</span>
          <span style={{ color: '#fc5c65', fontSize: '0.78rem', fontWeight: 600 }}>-{breakdown.historyPenalty}</span>
        </div>
        <div style={{ background: '#2a2a2a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(breakdown.historyPenalty / 1) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: '#fc5c65', borderRadius: 4 }}
          />
        </div>
      </div>
    </div>
  );
};