import React from 'react';
import { motion } from 'motion/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizes[size]} border-3 border-[#333] border-t-[#E50914] rounded-full`}
        style={{ borderWidth: 3 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p style={{ color: '#808080', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
};

// Full-page loading overlay
export const LoadingOverlay: React.FC<{ text?: string }> = ({ text = 'AI is thinking...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(4px)' }}
  >
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full border-4"
          style={{ borderColor: '#1F1F1F', borderTopColor: '#E50914' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color: '#E50914', fontSize: '1.2rem' }}>✦</span>
        </div>
      </div>
      <p style={{ color: '#fff', fontSize: '1rem', letterSpacing: '0.05em' }}>{text}</p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#E50914' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);