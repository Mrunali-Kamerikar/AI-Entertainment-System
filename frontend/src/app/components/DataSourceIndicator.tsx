import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Wifi, WifiOff, X, AlertCircle } from 'lucide-react';
import { TMDB_CONFIG } from '../config/env';

type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'using-fallback';

export const DataSourceIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('checking');

  useEffect(() => {
    // Test TMDB connectivity
    const testConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
          `${TMDB_CONFIG.baseUrl}/configuration?api_key=${TMDB_CONFIG.apiKey}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);

        if (response.ok) {
          setStatus('connected');
          // Auto-hide after 5 seconds if connected
          setTimeout(() => setIsVisible(false), 5000);
        } else {
          setStatus('using-fallback');
        }
      } catch (error) {
        setStatus('using-fallback');
        // Keep visible longer if using fallback
        setTimeout(() => setIsVisible(false), 8000);
      }
    };

    testConnection();
  }, []);

  if (dismissed) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Wifi size={18} color="#2196F3" />,
          title: 'Connecting to TMDB...',
          description: 'Testing API connection',
          bgGradient: 'linear-gradient(135deg, rgba(33,150,243,0.15), rgba(25,118,210,0.15))',
          border: '1px solid rgba(33,150,243,0.3)',
          titleColor: '#2196F3',
        };
      case 'connected':
        return {
          icon: <Wifi size={18} color="#4CAF50" />,
          title: 'Live TMDB Data',
          description: 'Connected successfully',
          bgGradient: 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(56,142,60,0.15))',
          border: '1px solid rgba(76,175,80,0.3)',
          titleColor: '#4CAF50',
        };
      case 'using-fallback':
        return {
          icon: <AlertCircle size={18} color="#FF9800" />,
          title: 'Using Sample Data',
          description: 'TMDB API unavailable',
          bgGradient: 'linear-gradient(135deg, rgba(255,152,0,0.15), rgba(245,124,0,0.15))',
          border: '1px solid rgba(255,152,0,0.3)',
          titleColor: '#FF9800',
        };
      default:
        return {
          icon: <WifiOff size={18} color="#F44336" />,
          title: 'Connection Error',
          description: 'Check network settings',
          bgGradient: 'linear-gradient(135deg, rgba(244,67,54,0.15), rgba(211,47,47,0.15))',
          border: '1px solid rgba(244,67,54,0.3)',
          titleColor: '#F44336',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            background: config.bgGradient,
            border: config.border,
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 320,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {config.icon}
          
          <div style={{ flex: 1 }}>
            <p style={{ 
              margin: 0, 
              fontSize: '0.8rem', 
              fontWeight: 600,
              color: config.titleColor,
            }}>
              {config.title}
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: '0.72rem', 
              color: '#999',
              lineHeight: 1.4,
            }}>
              {config.description}
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};