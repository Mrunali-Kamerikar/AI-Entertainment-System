import React from 'react';
import { motion } from 'motion/react';
import { Film, Search, TrendingUp, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'nodata' | 'error' | 'loading';
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'nodata',
  title,
  message,
  icon,
  action,
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search size={48} />,
          title: 'No Results Found',
          message: 'Try adjusting your search or browse our categories to discover amazing content.',
        };
      case 'error':
        return {
          icon: <Film size={48} />,
          title: 'Something Went Wrong',
          message: 'We encountered an error loading the content. Please try again later.',
        };
      case 'loading':
        return {
          icon: <Sparkles size={48} />,
          title: 'Loading Content',
          message: 'Please wait while we fetch the latest movies for you...',
        };
      case 'nodata':
      default:
        return {
          icon: <TrendingUp size={48} />,
          title: 'No Content Available',
          message: 'There are no movies available in this category at the moment.',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayIcon = icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        minHeight: 400,
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(229,9,20,0.1)',
          border: '2px solid rgba(229,9,20,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E50914',
          marginBottom: 24,
        }}
      >
        {displayIcon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 12px',
        }}
      >
        {displayTitle}
      </motion.h3>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          color: '#888',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          maxWidth: 480,
          margin: '0 0 24px',
        }}
      >
        {displayMessage}
      </motion.p>

      {/* Action Button */}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          style={{
            background: 'linear-gradient(135deg, #E50914, #b30000)',
            border: 'none',
            borderRadius: 8,
            padding: '12px 32px',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(229,9,20,0.3)',
          }}
        >
          {action.label}
        </motion.button>
      )}

      {/* Decorative Elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.03 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            style={{
              position: 'absolute',
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
              width: 80 + i * 20,
              height: 80 + i * 20,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #E50914, transparent)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
