import React from 'react';
import { motion } from 'motion/react';

interface MovieCardSkeletonProps {
  index?: number;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        background: '#181818',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Poster Skeleton */}
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
        <motion.div
          animate={{
            background: [
              'linear-gradient(90deg, #1a1a1a 0%, #252525 50%, #1a1a1a 100%)',
              'linear-gradient(90deg, #1a1a1a 100%, #252525 150%, #1a1a1a 200%)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '100%',
            height: '100%',
            backgroundSize: '200% 100%',
          }}
        />
        
        {/* AI Score Badge Skeleton */}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(40,40,40,0.8)',
          borderRadius: 6,
          padding: '3px 8px',
          width: 45,
          height: 20,
        }}>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: '100%',
              height: '100%',
              background: '#333',
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* Card Footer Skeleton */}
      <div style={{ padding: '10px 10px 12px' }}>
        {/* Title Skeleton */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          style={{
            height: 14,
            background: '#252525',
            borderRadius: 4,
            marginBottom: 8,
            width: '85%',
          }}
        />

        {/* Genre Tags Skeleton */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            style={{
              height: 18,
              background: '#252525',
              borderRadius: 4,
              width: 60,
            }}
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            style={{
              height: 18,
              background: '#252525',
              borderRadius: 4,
              width: 50,
            }}
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            style={{
              height: 18,
              background: '#252525',
              borderRadius: 4,
              width: 35,
            }}
          />
        </div>

        {/* Industry Tag Skeleton */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          style={{
            height: 20,
            background: '#252525',
            borderRadius: 4,
            width: 70,
            marginTop: 4,
          }}
        />
      </div>
    </motion.div>
  );
};
