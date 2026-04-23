import React, { useState } from 'react';
import { motion } from 'motion/react';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
}) => {
  const [hovered, setHovered] = useState<number>(0);
  const sizes = { sm: 14, md: 18, lg: 24 };
  const starSize = sizes[size];
  const display = hovered > 0 ? hovered : value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          whileHover={readonly ? {} : { scale: 1.2 }}
          whileTap={readonly ? {} : { scale: 0.9 }}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            cursor: readonly ? 'default' : 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill={star <= display ? '#F5C518' : 'none'}
            stroke={star <= display ? '#F5C518' : '#555'}
            strokeWidth={1.5}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </motion.button>
      ))}
      {showValue && value > 0 && (
        <span style={{ color: '#F5C518', fontSize: '0.85rem', marginLeft: 4 }}>
          {value}/5
        </span>
      )}
    </div>
  );
};

// Compact star display (for cards)
export const StarDisplay: React.FC<{ rating: number; max?: number }> = ({ rating, max = 10 }) => {
  const normalized = (rating / max) * 5;
  return (
    <div className="flex items-center gap-1">
      <svg width={14} height={14} viewBox="0 0 24 24" fill="#F5C518" stroke="#F5C518" strokeWidth={1}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      <span style={{ color: '#F5C518', fontSize: '0.78rem' }}>{rating.toFixed(1)}</span>
    </div>
  );
};