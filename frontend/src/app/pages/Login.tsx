import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Film, Eye, EyeOff, AlertCircle, CheckCircle2, User, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { CineVerseLogo } from '../components/CineVerseLogo';
import {
  rememberUsername,
  getRememberedUsername,
  forgetUsername,
  createSession,
  getSession,
  storeUserData,
} from '../utils/authStorage';

// Particle animation on canvas
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
      // Draw connections
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

export const Login: React.FC = () => {
  const { login, user, enterDemoMode } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Returning user states
  const [showReturningUser, setShowReturningUser] = useState(false);
  const [returningUsername, setReturningUsername] = useState<string | null>(null);

  // Initialize returning user state
  useEffect(() => {
    const remembered = getRememberedUsername();
    if (remembered) {
      setReturningUsername(remembered);
      setShowReturningUser(true);
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleContinueAsUser = () => {
    setShowReturningUser(false);
  };

  const handleDifferentUser = () => {
    setShowReturningUser(false);
    setReturningUsername(null);
    setEmail('');
    setRememberMe(false);
    forgetUsername();
  };

  // We are NOT auto-redirecting to dashboard here to satisfy the user's request
  // of showing the sign-in/sign-up page first.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }
    
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      if (rememberMe) {
        rememberUsername(email);
      } else {
        forgetUsername();
      }
      setSuccess('Login successful!');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    enterDemoMode();
    setSuccess('Demo mode activated!');
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  // If showing success (auto-login), show welcome screen
  if (success && !error) {
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
            {success}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ color: '#888', marginTop: 8, fontSize: '0.9rem' }}
          >
            Redirecting to your dashboard...
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
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Animated background */}
      <ParticleBackground />

      {/* Radial gradient overlay */}
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

      {/* Login card */}
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <CineVerseLogo size={50} variant="full" />
          </motion.div>
        </div>

        {/* Already Logged In Note */}
        {user && !success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(229,9,20,0.1)',
              border: '1px solid rgba(229,9,20,0.3)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 24,
              textAlign: 'center'
            }}
          >
            <p style={{ color: '#fff', fontSize: '0.9rem', margin: '0 0 8px' }}>
              You are already logged in as <strong>{user.username}</strong>
            </p>
            <Link 
              to="/dashboard" 
              style={{ 
                color: '#E50914', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Go to Dashboard →
            </Link>
          </motion.div>
        )}

        {/* Returning User Quick Login */}
        <AnimatePresence mode="wait">
          {showReturningUser && returningUsername && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(229,9,20,0.05)',
                border: '1px solid rgba(229,9,20,0.2)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E50914, #b30000)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                    Welcome back!
                  </p>
                  <p style={{ color: '#888', fontSize: '0.78rem', margin: '2px 0 0' }}>
                    {returningUsername}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinueAsUser}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #E50914, #b30000)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Continue as {returningUsername}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDifferentUser}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '10px 16px',
                    color: '#888',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Different User
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <h2 style={{ color: '#fff', margin: '0 0 6px', textAlign: 'center', fontSize: '1.15rem' }}>
          {showReturningUser ? 'Enter Your Password' : 'Welcome Back'}
        </h2>
        <p style={{ color: '#555', fontSize: '0.82rem', textAlign: 'center', margin: '0 0 28px' }}>
          Sign in to get personalized AI recommendations
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
              style={{ borderRadius: 10, overflow: 'hidden' }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="your@email.com"
                autoComplete="email"
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#fff', fontSize: '0.9rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </motion.div>
          </div>

          {/* Password */}
          <div>
            <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <motion.div
              animate={{ boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(229,9,20,0.35)' : '0 0 0 1px rgba(255,255,255,0.08)' }}
              style={{ borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center' }}
            >
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  flex: 1, padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  color: '#fff', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  padding: '12px 14px', cursor: 'pointer', color: '#666',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </motion.div>
          </div>

          {/* Remember Me */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
            }}
          >
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                cursor: 'pointer',
                accentColor: '#E50914',
              }}
            />
            <label
              htmlFor="remember-me"
              style={{
                color: '#888',
                fontSize: '0.82rem',
                cursor: 'pointer',
                userSelect: 'none',
                flex: 1,
              }}
            >
              Remember me
            </label>
            <Link
              to="/forgot-password"
              style={{
                color: '#888',
                fontSize: '0.82rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E50914'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
            >
              Forgot Password?
            </Link>
          </motion.div>

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
              marginTop: 4, boxShadow: isLoading ? 'none' : '0 4px 16px rgba(229,9,20,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Brain size={16} /> Sign In
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
          <span style={{ color: '#444', fontSize: '0.75rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
        </div>

        {/* Demo button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDemo}
          disabled={isLoading}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '11px',
            color: '#aaa', fontWeight: 600, fontSize: '0.88rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Film size={15} /> Try Demo Account
        </motion.button>

        {/* Features preview */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['🤖 AI Recommendations', '🎬 TMDB Powered', '⭐ Smart Ratings'].map(f => (
            <span key={f} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a',
              borderRadius: 20, padding: '4px 10px', color: '#555', fontSize: '0.7rem',
            }}>
              {f}
            </span>
          ))}
        </div>

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
          🔒 Secured with encryption • Your data is protected
        </motion.p>

        {/* Sign up link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 16,
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#666',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              color: '#E50914',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Sign Up
          </Link>
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