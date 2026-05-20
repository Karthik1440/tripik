// src/pages/Login.js — Premium Redesign
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Navigation, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Background Overlay */}
      <div style={s.bgOverlay} />

      <div style={s.card} className="glass animate-fadeUp">
        {/* Logo */}
        <div style={s.logoArea} className="animate-float">
          <div style={s.logoCircle}>
            <Navigation size={24} color="#fff" fill="#fff" />
          </div>
          <h1 style={s.logoText}>Tri<span className="text-gradient">pik</span></h1>
        </div>

        <div style={s.header}>
          <h2 style={s.title}>{isRegister ? 'Start Your Journey' : 'Welcome Back'}</h2>
          <p style={s.subtitle}>
            {isRegister
              ? 'Join our community of global explorers today.'
              : 'Enter your credentials to access your world.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.inputGroup}>
            <div style={s.inputWrap}>
              <Mail size={18} style={s.inputIcon} />
              <input
                style={s.input}
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={s.inputGroup}>
            <div style={s.inputWrap}>
              <Lock size={18} style={s.inputIcon} />
              <input
                style={s.input}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isRegister && (
            <button
              type="button"
              style={s.forgotBtn}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          )}

          <button style={s.submitBtn} disabled={loading} className="shadow-premium">
            {loading ? (
              <span style={s.loader} />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={20} style={{ marginLeft: 10 }} />
              </>
            )}
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.line} />
          <span style={s.dividerText}>OR</span>
          <div style={s.line} />
        </div>

        <button style={s.toggleBtn} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? (
            <>Already have an account? <span style={s.toggleSpan}>Sign In</span></>
          ) : (
            <>Don't have an account? <span style={s.toggleSpan}>Create one</span></>
          )}
        </button>

        <div style={s.footerBadges}>
          <div style={s.badge}><ShieldCheck size={14} /> 256-bit SSL</div>
          <div style={s.badge}><Globe size={14} /> 50+ Countries</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073") center/cover no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative'
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
    zIndex: 1
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 'var(--radius-2xl)',
    padding: '48px 40px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },

  logoArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 },
  logoCircle: {
    width: 48,
    height: 48,
    background: 'var(--primary-gradient)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(0, 208, 132, 0.3)'
  },
  logoText: { fontSize: 28, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-1px' },

  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 500, lineHeight: 1.4 },

  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  inputGroup: { textAlign: 'left' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 18, color: 'rgba(255,255,255,0.6)' },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '16px 18px 16px 52px',
    borderRadius: 'var(--radius-lg)',
    fontSize: 15,
    fontWeight: 500,
    color: '#fff',
    backdropFilter: 'blur(4px)'
  },
  eyeBtn: { position: 'absolute', right: 18, background: 'none', color: 'rgba(255,255,255,0.6)' },

  forgotBtn: { background: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 600, alignSelf: 'flex-end', padding: 0 },
  submitBtn: {
    background: 'var(--primary-gradient)',
    color: '#fff',
    padding: '18px',
    borderRadius: 'var(--radius-lg)',
    fontSize: 16,
    fontWeight: 700,
    width: '100%',
    marginTop: 10,
    boxShadow: '0 10px 20px rgba(0, 208, 132, 0.2)'
  },

  divider: { display: 'flex', alignItems: 'center', gap: 15, margin: '32px 0' },
  line: { flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' },
  dividerText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '1px' },

  toggleBtn: { background: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 500 },
  toggleSpan: { color: 'var(--primary)', fontWeight: 700, marginLeft: 5 },

  footerBadges: { display: 'flex', gap: 20, justifyContent: 'center', marginTop: 40 },
  badge: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 },

  loader: {
    width: 20,
    height: 20,
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};