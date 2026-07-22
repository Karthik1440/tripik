// src/pages/UserBookings.js — Reworked with Lucide Icons & Status Tracking
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, CheckCircle, XCircle,
  HelpCircle, MessageSquare, ArrowRight, Star,
  Home as HomeIcon, Briefcase, Navigation, User, Heart,
  Shield, FileText, Info as InfoIcon, PhoneCall, ChevronRight, Trash2
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function UserBookings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const [reviewModal, setReviewModal] = useState({ show: false, booking: null });
  const [reviewData, setReviewData] = useState({ rating: 5, accommodation_rating: 5, guide_rating: 5, experience_rating: 5, title: '', review_text: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate('/login');
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/trips/bookings/');
      setBookings(res.data);
    } catch (e) {
      console.error('Error fetching bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewData.title || !reviewData.review_text) return alert('Please fill in both the title and the review text.');
    try {
      setReviewSubmitting(true);
      await api.post(`/trips/bookings/${reviewModal.booking.id}/review/`, reviewData);
      setBookings(bookings.map(b => b.id === reviewModal.booking.id ? { ...b, review_submitted: true } : b));
      setReviewModal({ show: false, booking: null });
      setReviewData({ rating: 5, accommodation_rating: 5, guide_rating: 5, experience_rating: 5, title: '', review_text: '' });
      alert('Review submitted successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const clearBooking = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to clear this booking history?")) {
      try {
        await api.delete(`/trips/bookings/${id}/`);
        setBookings(bookings.filter(b => b.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to clear booking");
      }
    }
  };

  const filtered = bookings.filter(b =>
    filter === 'All' || b.status.toLowerCase() === filter.toLowerCase()
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#f59e0b'; // inquiry
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'completed': return <Star size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <h1 style={s.headerTitle}>My Account</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.refreshCircle} onClick={fetchBookings} title="Refresh Data">
              <Clock size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div style={s.profileCard}>
          <div style={s.avatar}>{user?.email?.charAt(0).toUpperCase()}</div>
          <div style={s.userInfo}>
            <h3 style={s.userEmail}>{user?.email}</h3>
            <p style={s.userStatus}>Logged in via Email</p>
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <div style={s.tabs} className="hide-scrollbar">
        {['All', 'Inquiry', 'Confirmed', 'Completed', 'Cancelled'].map(t => (
          <button
            key={t}
            style={{ ...s.tab, ...(filter === t ? s.activeTab : {}) }}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <main style={s.main}>
        {loading ? (
          <div style={s.loader}>Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: 15 }} />
            <p>No bookings found in this category.</p>
          </div>
        ) : (
          <div style={s.list}>
            {filtered.map(b => (
              <div key={b.id} style={s.card} onClick={() => navigate(`/package/${b.package}`)}>
                <div style={s.cardTop}>
                  <div style={{ ...s.statusBadge, background: `${getStatusColor(b.status)}15`, color: getStatusColor(b.status) }}>
                    {getStatusIcon(b.status)} {b.status.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={s.bookingId}>ID: #TPK-{b.id}</span>
                    <button style={s.clearBtn} onClick={(e) => clearBooking(e, b.id)}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>

                <div style={s.cardCore}>
                  {b.package_banner && <img src={b.package_banner} alt="" style={s.cardImg} />}
                  <div style={s.cardInfo}>
                    <h3 style={s.packageTitle}>{b.package_title}</h3>
                    <div style={s.metaWrap}>
                      <div style={s.metaItem}><MapPin size={14} /> {b.destination}</div>
                      <div style={s.metaItem}><Clock size={14} /> {b.days}D/{b.nights}N</div>
                    </div>
                  </div>
                </div>

                <div style={s.metaDetails}>
                  <div style={s.metaItem}><Calendar size={14} /> {new Date(b.start_date).toLocaleDateString()}</div>
                  <div style={s.metaItem}><User size={14} /> {b.adults} Adults, {b.children} kids</div>
                </div>

                <div style={s.footer}>
                  <div style={s.priceArea}>
                    <span style={s.totalLabel}>Total Price</span>
                    <span style={s.totalVal}>₹{Number(b.total_cost).toLocaleString()}</span>
                  </div>
                  {b.status === 'inquiry' && (
                    <button style={s.waBtn} onClick={(e) => {
                      e.stopPropagation();
                      const msg = `Hi Tripik Team! 👋 I have an inquiry for *${b.package_title}* (Booking ID: #${b.id}). Please share more details & itinerary!`;
                      window.open(`https://wa.me/916238980278?text=${encodeURIComponent(msg)}`, '_blank');
                    }}>
                      <MessageSquare size={16} /> Chat
                    </button>
                  )}
                  {b.status === 'completed' && !b.review_submitted && (
                    <button style={s.reviewBtn} onClick={(e) => {
                      e.stopPropagation();
                      setReviewModal({ show: true, booking: b });
                    }}>Write Review</button>
                  )}
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* ── SETTINGS & LEGAL ── */}
        <div style={s.legalSection}>
          <h3 style={s.sectionHeader}>Settings & Legal</h3>
          <div style={s.legalList}>
            <LegalItem icon={FileText} label="Terms & Conditions" onClick={() => alert("Terms of Service")} />
            <LegalItem icon={Shield} label="Privacy Policy" onClick={() => alert("Privacy Policy")} />
            <LegalItem icon={PhoneCall} label="Help & Support" onClick={() => alert("Support Center")} />
            <LegalItem icon={InfoIcon} label="About Tripik" onClick={() => alert("Tripik v1.0.4")} />
          </div>
        </div>

        <div style={s.version}>
          <p>Tripik </p>
          <p>© 2026 Tripik Inc.</p>
        </div>
      </main>

      {/* ── BOTTOM NAV ── */}
      <BottomNav />

      {/* ── REVIEW MODAL ── */}
      {reviewModal.show && (
        <div style={s.modalOverlay} onClick={() => setReviewModal({ show: false, booking: null })}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Write a Review</h2>
            <p style={s.modalSub}>For {reviewModal.booking?.package_title}</p>

            <div style={s.ratingGroup}>
              <label style={s.inputLabel}>Overall Rating</label>
              <div style={s.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={24} fill={reviewData.rating >= star ? '#f59e0b' : 'transparent'} color={reviewData.rating >= star ? '#f59e0b' : '#d1d5db'} onClick={() => setReviewData({ ...reviewData, rating: star })} style={{ cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.inputLabel}>Review Title</label>
              <input style={s.input} value={reviewData.title} onChange={e => setReviewData({ ...reviewData, title: e.target.value })} placeholder="Give your review a title" />
            </div>

            <div style={s.inputGroup}>
              <label style={s.inputLabel}>Review text</label>
              <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={reviewData.review_text} onChange={e => setReviewData({ ...reviewData, review_text: e.target.value })} placeholder="Tell us about your experience..." />
            </div>

            <button style={{ ...s.submitReviewBtn, opacity: reviewSubmitting ? 0.7 : 1 }} onClick={submitReview} disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const LegalItem = ({ icon: Icon, label, onClick }) => (
  <button style={s.legalItem} onClick={onClick}>
    <div style={s.legalLeft}>
      <Icon size={18} color="var(--text-secondary)" />
      <span style={s.legalLabel}>{label}</span>
    </div>
    <ChevronRight size={16} color="var(--text-muted)" />
  </button>
);

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 100 },
  header: { background: '#fff', padding: '40px 20px 20px', borderBottom: '1px solid var(--border)' },
  headerInner: { maxWidth: 500, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 900, margin: 0 },
  refreshCircle: { width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-page)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' },
  logoutBtn: { background: '#fef2f2', color: '#ef4444', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: '1px solid #fee2e2' },

  profileCard: { maxWidth: 500, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 15, background: 'var(--bg-page)', padding: 15, borderRadius: 20 },
  avatar: { width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 },
  userInfo: { flex: 1 },
  userEmail: { fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' },
  userStatus: { fontSize: 12, color: 'var(--text-muted)', margin: 0 },

  helpBtn: { width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  tabs: { maxWidth: 500, margin: '0 auto', display: 'flex', gap: 10, padding: '15px 20px', overflowX: 'auto', background: '#fff' },
  tab: { flexShrink: 0, padding: '8px 18px', borderRadius: 12, background: 'var(--bg-page)', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', border: 'none' },
  activeTab: { background: 'var(--primary)', color: '#fff' },

  main: { maxWidth: 500, margin: '0 auto', padding: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: 15 },
  card: { background: '#fff', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-sm)', cursor: 'pointer', border: '1px solid var(--border-light)', marginBottom: 5 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 },
  bookingId: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 },

  cardCore: { display: 'flex', gap: 15, marginBottom: 15 },
  cardImg: { width: 80, height: 80, borderRadius: 16, objectFit: 'cover' },
  cardInfo: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  packageTitle: { fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' },
  metaWrap: { display: 'flex', gap: 12 },
  metaDetails: { display: 'flex', gap: 15, marginBottom: 20 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 },

  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTop: '1px dashed var(--border)' },
  priceArea: { display: 'flex', flexDirection: 'column' },
  totalLabel: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 },
  totalVal: { fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' },
  waBtn: { background: '#25D366', color: '#fff', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 },
  reviewBtn: { background: 'var(--primary)', color: '#fff', padding: '8px 15px', borderRadius: 10, fontSize: 12, fontWeight: 700 },
  clearBtn: { background: '#fef2f2', border: 'none', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  empty: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' },
  loader: { textAlign: 'center', padding: 50, color: 'var(--text-muted)', fontWeight: 600 },

  legalSection: { marginTop: 30, marginBottom: 20 },
  sectionHeader: { fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, paddingLeft: 5 },
  legalList: { background: '#fff', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' },
  legalItem: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', borderBottom: '1px solid var(--border-light)' },
  legalLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  legalLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },

  version: { textAlign: 'center', marginTop: 30, paddingBottom: 20 },
  versionText: { fontSize: 12, color: 'var(--text-muted)', margin: 0 },

  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, height: 75, background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 10px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 1000 },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', color: 'var(--text-muted)', position: 'relative', minWidth: 60 },
  navLabel: { fontSize: 10, fontWeight: 700 },
  navDot: { width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)', marginTop: 2 },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { background: '#fff', padding: 25, borderRadius: 24, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' },
  modalTitle: { margin: '0 0 5px', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' },
  modalSub: { margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' },
  ratingGroup: { marginBottom: 15 },
  stars: { display: 'flex', gap: 10, marginTop: 5 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 },
  input: { width: '100%', padding: '12px 15px', borderRadius: 12, border: '1px solid var(--border-light)', fontSize: 14, outline: 'none' },
  submitReviewBtn: { width: '100%', padding: '15px', borderRadius: 14, background: 'var(--primary)', color: '#fff', fontSize: 15, fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: 10 },
};