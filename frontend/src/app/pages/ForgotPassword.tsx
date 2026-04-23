import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Link } from 'react-router';
import { CineVerseLogo } from '../components/CineVerseLogo';

// Particle animation (same as login)
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

    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.05,
      color: Math.random() > 0.7 ? '#E50914' : '#ffffff',
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
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(229,9,20,${0.06 * (1 - dist / 100)})`;
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

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }

    setIsLoading(true);

    try {
      // Simulate sending reset email
      // In production: POST /forgot-password to backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success
      setSuccess(true);
      console.log('📧 Password reset email sent to:', email);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh', background: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <ParticleBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            zIndex: 10,
            maxWidth: 400,
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 size={64} color="#4CAF50" strokeWidth={2} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ color: '#fff', marginTop: 20, fontSize: '1.5rem' }}
          >
            Check Your Email
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ color: '#888', marginTop: 12, fontSize: '0.9rem', lineHeight: 1.6 }}
          >
            We've sent a password reset link to <strong style={{ color: '#E50914' }}>{email}</strong>.
            <br />Please check your inbox and follow the instructions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ marginTop: 24 }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #E50914, #b30000)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ marginTop: 20, fontSize: '0.75rem', color: '#555' }}
          >
            Didn't receive the email? Check your spam folder or try again.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh', background: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '20px',
      }}
    >
      <ParticleBackground />

      {/* Radial gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(229,9,20,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Film strip decoration */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        background: 'repeating-linear-gradient(90deg, #E50914 0px, #E50914 40px, transparent 40px, transparent 50px)',
        opacity: 0.6,
      }} />

      {/* Forgot Password card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          background: 'rgba(20,20,20,0.95)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: '40px 40px',
          width: '100%', maxWidth: 420,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(229,9,20,0.1)',
          zIndex: 10, position: 'relative',
        }}
      >
        {/* Back button */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#888',
            textDecoration: 'none',
            fontSize: '0.85rem',
            marginBottom: 20,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#E50914'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <CineVerseLogo size={50} variant="full" />
          </motion.div>
        </div>

        <h2 style={{ color: '#fff', margin: '0 0 6px', textAlign: 'center', fontSize: '1.15rem' }}>
          Forgot Password?
        </h2>
        <p style={{ color: '#555', fontSize: '0.82rem', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
          No worries! Enter your email and we'll send you reset instructions.
        </p>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <AlertCircle size={14} color="#E50914" />
              <p style={{ color: '#E50914', margin: 0, fontSize: '0.8rem' }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <motion.div
              animate={{ boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(229,9,20,0.35)' : '0 0 0 1px rgba(255,255,255,0.08)' }}
              style={{ borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center' }}
            >
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
                <Mail size={16} color="#666" />
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="your@email.com"
                autoComplete="email"
                style={{
                  flex: 1, padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  color: '#fff', fontSize: '0.9rem', outline: 'none',
                }}
              />
            </motion.div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            style={{
              background: isLoading ? '#333' : 'linear-gradient(135deg, #E50914, #b30000)',
              border: 'none', borderRadius: 10, padding: '13px',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 8, boxShadow: isLoading ? 'none' : '0 4px 16px rgba(229,9,20,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={16} /> Send Reset Link
              </>
            )}
          </motion.button>
        </form>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 24,
            background: 'rgba(229,9,20,0.05)',
            border: '1px solid rgba(229,9,20,0.15)',
            borderRadius: 10,
            padding: 12,
          }}
        >
          <p style={{ color: '#888', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
            💡 <strong style={{ color: '#ccc' }}>Tip:</strong> Make sure to check your spam folder if you don't see the email in your inbox.
          </p>
        </motion.div>

        {/* Security note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#444',
            lineHeight: 1.4,
          }}
        >
          🔒 Your data is secure • Reset link expires in 24 hours
        </motion.p>
      </motion.div>

      {/* Floating film icons */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{
            duration: 3 + i * 0.7,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 30}%`,
            color: '#E50914',
            fontSize: i % 2 === 0 ? '2rem' : '1.5rem',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {['🎬', '🎭', '🍿', '🎦', '⭐', '🎞️'][i]}
        </motion.div>
      ))}
    </div>
  );
};
