import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, MapPin, Star, Trash2, Home as HomeIcon, Briefcase, User, Sparkles } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { Helmet } from 'react-helmet-async';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <div style={s.page}>
      <Helmet>
        <title>My Wishlist | Tripik</title>
      </Helmet>

      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={s.headerTitle}>My Wishlist</h2>
          <div style={{ width: 24 }} />
        </div>
      </header>

      <main style={s.main}>
        {favorites.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyVisual}>
              <div style={s.emptyPulse} />
              <div style={s.emptyIcon}>
                <Heart size={44} fill="var(--primary)" color="var(--primary)" />
              </div>
            </div>
            <h3 style={s.emptyTitle}>Your wishlist is empty</h3>
            <p style={s.emptySub}>Looks like you haven't saved any trips yet. Start exploring and find your dream destination!</p>
            <button style={s.browseBtn} onClick={() => navigate('/')}>
              <Sparkles size={18} />
              Start Exploring
            </button>
          </div>
        ) : (
          <div style={s.list}>
            <div style={s.listMeta}>
              <span style={s.countBadge}>{favorites.length}</span>
              <span style={s.listSubtitle}>Items in your collection</span>
            </div>
            
            <div style={s.grid}>
              {favorites.map(p => (
                <div key={p.id} style={s.card} onClick={() => navigate(`/package/${p.id}`)}>
                  <div style={s.cardImgWrap}>
                    <img src={p.banner_url} alt="" style={s.cardImg} />
                    <div style={s.cardBadge}>{p.days}D / {p.nights}N</div>
                    <button 
                      style={s.removeBtn} 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                    >
                      <Trash2 size={20} color="#fff" />
                    </button>
                  </div>
                  <div style={s.cardBody}>
                    <div style={s.cardLoc}><MapPin size={12} /> {p.to_location}</div>
                    <h4 style={s.cardTitle}>{p.title}</h4>
                    <div style={s.cardPriceRow}>
                      <div style={s.cardRating}><Star size={14} fill="#f59e0b" color="#f59e0b" /> {Number(p.avg_rating || 5).toFixed(1)}</div>
                      <div style={s.cardPrice}>₹{Number(p.price_per_person).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={s.bottomNav}>
        <button style={s.navItem} onClick={() => navigate('/')}>
          <HomeIcon size={24} />
          <span style={s.navLabel}>Home</span>
        </button>
        <button style={s.navItem} onClick={() => navigate('/bookings')}>
          <Briefcase size={24} />
          <span style={s.navLabel}>Bookings</span>
        </button>
        <button style={{ ...s.navItem, color: 'var(--primary)' }} onClick={() => navigate('/favorites')}>
          <Heart size={24} fill="var(--primary)" />
          <span style={s.navLabel}>Favorites</span>
          <div style={s.navDot} />
        </button>
        <button style={s.navItem} onClick={() => navigate('/profile')}>
          <User size={24} />
          <span style={s.navLabel}>Account</span>
        </button>
      </nav>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 100 },
  
  // Header
  header: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' },
  headerInner: { maxWidth: 500, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' },
  backBtn: { background: 'none', border: 'none', padding: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' },

  main: { maxWidth: 500, margin: '0 auto', padding: '20px' },
  
  // List Meta
  listMeta: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 25 },
  countBadge: { background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 900, padding: '4px 12px', borderRadius: 10 },
  listSubtitle: { fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 },

  // Grid / Cards
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: 20 },
  card: { background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s' },
  cardImgWrap: { height: 180, position: 'relative' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBadge: { position: 'absolute', top: 15, left: 15, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 14px', borderRadius: 12, fontSize: 12, fontWeight: 800, backdropFilter: 'blur(4px)' },
  removeBtn: { position: 'absolute', top: 15, right: 15, background: 'rgba(239, 68, 68, 0.9)', padding: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  
  cardBody: { padding: '18px 20px' },
  cardLoc: { fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, fontWeight: 600 },
  cardTitle: { fontSize: 17, fontWeight: 800, margin: '0 0 12px', color: 'var(--text-primary)', lineHeight: 1.3 },
  cardPriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardRating: { fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 },
  cardPrice: { fontSize: 18, fontWeight: 900, color: 'var(--primary)' },

  // Empty State
  empty: { textAlign: 'center', padding: '100px 20px' },
  emptyVisual: { position: 'relative', width: 100, height: 100, margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyPulse: { position: 'absolute', width: '100%', height: '100%', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', animation: 'pulse 2s infinite' },
  emptyIcon: { position: 'relative', width: 70, height: 70, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' },
  emptyTitle: { fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 },
  emptySub: { fontSize: 15, color: 'var(--text-muted)', marginBottom: 35, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 35px' },
  browseBtn: { background: 'var(--primary)', color: '#fff', padding: '16px 35px', borderRadius: 20, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 20px rgba(99,102,241,0.3)', cursor: 'pointer' },

  // Bottom Nav
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, height: 75, background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 10px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 1000 },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', color: 'var(--text-muted)', position: 'relative', minWidth: 60, cursor: 'pointer', border: 'none' },
  navLabel: { fontSize: 10, fontWeight: 700 },
  navDot: { width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)', marginTop: 2 }
};

