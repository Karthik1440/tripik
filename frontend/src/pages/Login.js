// src/pages/Login.js — Tripik Professional Login
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Navigation, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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
      <div style={s.card} className="animate-fadeUp">
        {/* Logo */}
        <div style={s.logoArea}>
          <Navigation size={32} color="#fff" />
          <h1 style={s.logoText}>Tripik</h1>
        </div>

        <h2 style={s.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p style={s.subtitle}>{isRegister ? 'Join us and start your journey today.' : 'Please enter your details to sign in.'}</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.inputWrap}>
            <Mail size={18} color="var(--text-muted)" style={s.inputIcon} />
            <input
              style={s.input}
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div style={s.inputWrap}>
            <Lock size={18} color="var(--text-muted)" style={s.inputIcon} />
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

          {!isRegister && (
            <button 
              type="button" 
              style={s.forgotBtn}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          )}

          <button style={s.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            <ArrowRight size={20} style={{ marginLeft: 10 }} />
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.line} />
          <span style={s.dividerText}>or continue with</span>
          <div style={s.line} />
        </div>

        <button style={s.toggleBtn} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>

        <div style={s.badges}>
          <div style={s.badge}><ShieldCheck size={14} /> Secure Login</div>
          <div style={s.badge}><Zap size={14} /> Instant Access</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, background: '#fff', borderRadius: 32, padding: '40px 30px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' },

  logoArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 30 },
  logoCircle: { width: 44, height: 44, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(26,158,92,0.2)' },
  logoText: { fontSize: 24, fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' },

  title: { fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 35 },

  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 18 },
  input: { width: '100%', background: 'var(--bg-input)', border: '1px solid transparent', padding: '16px 18px 16px 50px', borderRadius: 18, fontSize: 15, fontWeight: 500 },
  eyeBtn: { position: 'absolute', right: 18, background: 'none', color: 'var(--text-muted)' },

  forgotBtn: { background: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 700, alignSelf: 'flex-start', padding: 0 },
  submitBtn: { background: 'var(--text-primary)', color: '#fff', padding: '16px', borderRadius: 18, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, transition: 'all 0.3s' },

  divider: { display: 'flex', alignItems: 'center', gap: 15, margin: '30px 0' },
  line: { flex: 1, height: 1, background: 'var(--border)' },
  dividerText: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 },

  toggleBtn: { background: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 },

  badges: { display: 'flex', gap: 15, justifyContent: 'center', marginTop: 40 },
  badge: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg-page)', padding: '5px 12px', borderRadius: 10 }
};