import { motion } from 'motion/react';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

interface SentimentCardProps {
  positive: number;
  mixed: number;
  negative: number;
  movieTitle?: string;
  showIcons?: boolean;
  compact?: boolean;
}

/**
 * SentimentCard Component
 * Displays movie sentiment ratios in a Netflix/IMDb style
 * Each card shows percentages with appropriate color coding:
 * - Positive (green): #26de81
 * - Mixed (yellow/orange): #F7B731
 * - Negative (red): #fc5c65
 */
export const SentimentCard: React.FC<SentimentCardProps> = ({
  positive,
  mixed,
  negative,
  movieTitle,
  showIcons = true,
  compact = false,
}) => {
  const sentiments = [
    {
      label: 'Positive',
      value: positive,
      color: '#26de81',
      bgGradient: 'linear-gradient(135deg, rgba(38, 222, 129, 0.15) 0%, rgba(38, 222, 129, 0.05) 100%)',
      icon: ThumbsUp,
    },
    {
      label: 'Mixed',
      value: mixed,
      color: '#F7B731',
      bgGradient: 'linear-gradient(135deg, rgba(247, 183, 49, 0.15) 0%, rgba(247, 183, 49, 0.05) 100%)',
      icon: Minus,
    },
    {
      label: 'Negative',
      value: negative,
      color: '#fc5c65',
      bgGradient: 'linear-gradient(135deg, rgba(252, 92, 101, 0.15) 0%, rgba(252, 92, 101, 0.05) 100%)',
      icon: ThumbsDown,
    },
  ];

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        {sentiments.map((s, index) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{
              flex: 1,
              background: s.bgGradient,
              border: `1px solid ${s.color}33`,
              borderRadius: 8,
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div style={{ 
              color: s.color, 
              fontSize: '1.1rem', 
              fontWeight: 700,
              lineHeight: 1,
            }}>
              {s.value}%
            </div>
            <div style={{ 
              color: '#888', 
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {movieTitle && (
        <h3 style={{ 
          color: '#fff', 
          margin: '0 0 16px 0', 
          fontSize: '1.1rem',
          fontWeight: 600,
        }}>
          {movieTitle} — Audience Sentiment
        </h3>
      )}
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}>
        {sentiments.map((s, index) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              style={{
                background: s.bgGradient,
                border: `1.5px solid ${s.color}44`,
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                cursor: 'default',
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Icon and percentage row */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
              }}>
                {showIcons && (
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `${s.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} color={s.color} />
                  </div>
                )}
                
                <div style={{ 
                  color: s.color, 
                  fontSize: '2rem', 
                  fontWeight: 700,
                  lineHeight: 1,
                  marginLeft: showIcons ? 'auto' : 0,
                }}>
                  {s.value}%
                </div>
              </div>

              {/* Label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ 
                  color: '#aaa', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  {s.label}
                </span>
                
                {/* Progress bar */}
                <div style={{
                  flex: 1,
                  height: 4,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  marginLeft: 12,
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.8, delay: index * 0.15 }}
                    style={{
                      height: '100%',
                      background: s.color,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary text */}
      <div style={{
        marginTop: 12,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
      }}>
        <p style={{ 
          color: '#888', 
          fontSize: '0.75rem', 
          margin: 0,
          lineHeight: 1.5,
        }}>
          Based on audience reviews and ratings • {positive}% positive, {mixed}% mixed, {negative}% negative
        </p>
      </div>
    </div>
  );
};
