import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Eye, EyeOff, AlertCircle, CheckCircle2, Mail, User, Lock, Check, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { CineVerseLogo } from '../components/CineVerseLogo';
import { useApp } from '../context/AppContext';
import {
  rememberUsername,
  forgetUsername,
  createSession,
  storeUserData,
} from '../utils/authStorage';

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

// Password strength checker
const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
  let strength = 0;
  if (pwd.length >= 6) strength++;
  if (pwd.length >= 10) strength++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;

  if (strength <= 1) return { strength: 1, label: 'Weak', color: '#E50914' };
  if (strength <= 3) return { strength: 2, label: 'Medium', color: '#FFA500' };
  return { strength: 3, label: 'Strong', color: '#4CAF50' };
};

export const SignUp: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const passwordStrength = password ? getPasswordStrength(password) : null;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    if (!username.trim()) { setError('Please enter a username'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!password.trim()) { setError('Please enter a password'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setIsLoading(true);

    try {
      // Simulate user registration
      // In production: POST /signup to backend
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Check if user already exists (simulated)
      const existingUsers = localStorage.getItem('cineverse_user_data');
      if (existingUsers) {
        const users = JSON.parse(existingUsers);
        if (users.some((u: { username: string }) => u.username.toLowerCase() === username.toLowerCase())) {
          setError('Username already exists. Please choose another one.');
          setIsLoading(false);
          return;
        }
      }

      // Create user account
      const userId = `user_${username.toLowerCase().replace(/\s/g, '_')}`;
      
      // Store user data (simulates backend database)
      storeUserData(username, userId);

      // Handle "Remember Me"
      if (rememberMe) {
        rememberUsername(username);
      } else {
        forgetUsername();
      }

      // Create session
      createSession(username, userId, rememberMe);

      // Auto-login after signup
      await login(username, password);

      // Show success
      setSuccess('Account created successfully!');

      // Navigate to dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError('Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  // If success, show success screen
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
            Welcome to CineVerse, {username}!
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

      {/* Sign Up card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          background: 'rgba(20,20,20,0.95)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: '40px 40px',
          width: '100%', maxWidth: 440,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(229,9,20,0.1)',
          zIndex: 10, position: 'relative',
        }}
      >
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
          Create Your Account
        </h2>
        <p style={{ color: '#555', fontSize: '0.82rem', textAlign: 'center', margin: '0 0 24px' }}>
          Join CineVerse for AI-powered recommendations
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
              Email
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

          {/* Username */}
          <div>
            <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <motion.div
              animate={{ boxShadow: focusedField === 'username' ? '0 0 0 2px rgba(229,9,20,0.35)' : '0 0 0 1px rgba(255,255,255,0.08)' }}
              style={{ borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center' }}
            >
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
                <User size={16} color="#666" />
              </div>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Choose a username"
                autoComplete="username"
                style={{
                  flex: 1, padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  color: '#fff', fontSize: '0.9rem', outline: 'none',
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
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
                <Lock size={16} color="#666" />
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Create a password"
                autoComplete="new-password"
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

            {/* Password strength indicator */}
            <AnimatePresence>
              {password && passwordStrength && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ flex: 1, height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                        style={{
                          height: '100%',
                          background: passwordStrength.color,
                          transition: 'width 0.3s, background 0.3s',
                        }}
                      />
                    </div>
                    <span style={{ color: passwordStrength.color, fontSize: '0.72rem', fontWeight: 600 }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>
              Confirm Password
            </label>
            <motion.div
              animate={{ 
                boxShadow: focusedField === 'confirmPassword' 
                  ? '0 0 0 2px rgba(229,9,20,0.35)' 
                  : passwordsMatch 
                    ? '0 0 0 1px rgba(76,175,80,0.3)' 
                    : passwordsDontMatch 
                      ? '0 0 0 1px rgba(229,9,20,0.3)'
                      : '0 0 0 1px rgba(255,255,255,0.08)'
              }}
              style={{ borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center' }}
            >
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
                <Lock size={16} color="#666" />
              </div>
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                style={{
                  flex: 1, padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  color: '#fff', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  padding: '12px 14px', cursor: 'pointer', color: '#666',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </motion.div>

            {/* Password match indicator */}
            <AnimatePresence>
              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {passwordsMatch ? (
                    <>
                      <Check size={14} color="#4CAF50" />
                      <span style={{ color: '#4CAF50', fontSize: '0.75rem' }}>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X size={14} color="#E50914" />
                      <span style={{ color: '#E50914', fontSize: '0.75rem' }}>Passwords don't match</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
              id="remember-me-signup"
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
              htmlFor="remember-me-signup"
              style={{
                color: '#888',
                fontSize: '0.82rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Remember me (auto login after signup)
            </label>
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !passwordsMatch}
            style={{
              background: isLoading || !passwordsMatch ? '#333' : 'linear-gradient(135deg, #E50914, #b30000)',
              border: 'none', borderRadius: 10, padding: '13px',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              cursor: isLoading || !passwordsMatch ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 4, boxShadow: isLoading || !passwordsMatch ? 'none' : '0 4px 16px rgba(229,9,20,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Brain size={16} /> Create Account
              </>
            )}
          </motion.button>
        </form>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#666' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: '#E50914', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>

        {/* Security note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 16,
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#444',
            lineHeight: 1.4,
          }}
        >
          🔒 Your password will be securely encrypted
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
