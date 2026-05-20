// src/pages/ForgotPassword.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch (err) {
      console.error("Firebase Reset Error:", err.code, err.message);
      if (err.code === 'auth/user-not-found') {
        setError("This email is not registered in our system.");
      } else if (err.code === 'auth/invalid-email') {
        setError("The email address is badly formatted.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please try again later.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.card} className="animate-fadeUp">
          <div style={s.successIcon}>
            <CheckCircle size={60} color="var(--primary)" />
          </div>
          <h2 style={s.title}>Check your email</h2>
          <p style={s.subtitle}>
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <div style={s.debugBox}>
            <p>Project: {auth.config.projectId}</p>
            <p>If you don't see it, check your Spam folder.</p>
          </div>
          <button style={s.submitBtn} onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card} className="animate-fadeUp">
        <Link to="/login" style={s.backLink}>
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </Link>

        <h2 style={s.title}>Reset Password</h2>
        <p style={s.subtitle}>Enter your email address and we'll send you a link to reset your password.</p>

        {error && <div style={s.errorMsg}>{error}</div>}

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

          <button style={s.submitBtn} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
            <Send size={18} style={{ marginLeft: 10 }} />
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, background: '#fff', borderRadius: 32, padding: '40px 30px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' },

  backLink: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 30, textDecoration: 'none', transition: 'color 0.3s' },

  title: { fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 35, lineHeight: 1.6 },

  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 18 },
  input: { width: '100%', background: 'var(--bg-input)', border: '1px solid transparent', padding: '16px 18px 16px 50px', borderRadius: 18, fontSize: 15, fontWeight: 500 },

  submitBtn: { background: 'var(--text-primary)', color: '#fff', padding: '16px', borderRadius: 18, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, transition: 'all 0.3s', width: '100%', border: 'none', cursor: 'pointer' },

  errorMsg: { background: '#fff5f5', color: '#e53e3e', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 20 },

  successIcon: { marginBottom: 25, display: 'flex', justifyContent: 'center' },

  debugBox: { background: 'var(--bg-page)', padding: '15px', borderRadius: '12px', marginBottom: '25px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'left', border: '1px solid var(--border)' }
};
