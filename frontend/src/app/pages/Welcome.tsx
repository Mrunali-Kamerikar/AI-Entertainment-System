import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Film, Sparkles, TrendingUp, Brain, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router';
import { CineVerseLogo } from '../components/CineVerseLogo';

// Particle animation background
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      radius: number; opacity: number; color: string;
    }

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.6 ? '#E50914' : '#ffffff',
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(229,9,20,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
};

export const Welcome: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      <ParticleBackground />

      {/* Radial gradient glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(229,9,20,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Film strip decoration - Top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 8,
        background: 'repeating-linear-gradient(90deg, #E50914 0px, #E50914 50px, transparent 50px, transparent 60px)',
        opacity: 0.7,
      }} />

      {/* Film strip decoration - Bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
        background: 'repeating-linear-gradient(90deg, #E50914 0px, #E50914 50px, transparent 50px, transparent 60px)',
        opacity: 0.7,
      }} />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          maxWidth: 540,
          width: '100%',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Logo and title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 15 }}
            style={{ display: 'inline-block', marginBottom: 24 }}
          >
            <CineVerseLogo size={70} variant="full" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              color: '#fff',
              fontSize: '2.4rem',
              margin: '0 0 12px',
              background: 'linear-gradient(135deg, #ffffff 0%, #E50914 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome to CineVerse
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              color: '#888',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}
          >
            Access your personalized movie experience
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              color: '#666',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            Powered by AI • TMDB Integration • Smart Recommendations
          </motion.p>
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {[
            { icon: Brain, label: 'AI Powered', color: '#E50914' },
            { icon: Sparkles, label: 'Personalized', color: '#FFC107' },
            { icon: TrendingUp, label: 'Trending', color: '#4CAF50' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.1, type: 'spring', stiffness: 200 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '16px 12px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <item.icon size={24} color={item.color} strokeWidth={2} style={{ margin: '0 auto 8px' }} />
              <p style={{ color: '#999', fontSize: '0.8rem', margin: 0 }}>{item.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Auth buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          style={{
            background: 'rgba(20,20,20,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 32,
            backdropFilter: 'blur(30px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(229,9,20,0.1)',
          }}
        >
          <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 24px' }}>
            Choose how you want to continue
          </p>

          {/* Sign In button */}
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(229,9,20,0.45)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #E50914, #b30000)',
                border: 'none',
                borderRadius: 12,
                padding: '16px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 14,
                boxShadow: '0 4px 16px rgba(229,9,20,0.35)',
                transition: 'all 0.2s',
              }}
            >
              <LogIn size={20} />
              Sign In
            </motion.button>
          </Link>

          {/* Sign Up button */}
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.02, borderColor: '#E50914' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '16px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s',
              }}
            >
              <UserPlus size={20} />
              Sign Up
            </motion.button>
          </Link>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: '#555', fontSize: '0.75rem' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Demo account */}
          <Link to="/login?demo=true">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '12px',
                color: '#888',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <Film size={16} />
              Try Demo Account
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#444',
            lineHeight: 1.5,
          }}
        >
          🔒 Your data is secure and encrypted
          <br />
          No credit card required • Explore without signup
        </motion.p>
      </motion.div>

      {/* Floating film icons */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            opacity: [0.05, 0.15, 0.05],
            rotate: [0, 360],
          }}
          transition={{
            duration: 4 + i * 0.8,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${8 + i * 12}%`,
            top: `${15 + (i % 4) * 22}%`,
            color: i % 2 === 0 ? '#E50914' : '#ffffff',
            fontSize: i % 3 === 0 ? '2.5rem' : '1.8rem',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {['🎬', '🎭', '🍿', '🎦', '⭐', '🎞️', '🎪', '🌟'][i]}
        </motion.div>
      ))}

      {/* Spotlight effect */}
      <motion.div
        animate={{
          opacity: [0.05, 0.15, 0.05],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(229,9,20,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
};
