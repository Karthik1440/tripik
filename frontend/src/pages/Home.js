// src/pages/Home.js — Reworked with Lucide Icons & Global Nav
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, MapPin, Star, Heart, TrendingUp, Navigation, User, Home as HomeIcon, Briefcase, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNotifications } from '../context/NotificationContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { unreadCount } = useNotifications();

  const [packages, setPackages] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    if (user === undefined) return;
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (user === undefined) return;
    fetchPackages();
  }, [selectedCat, user]);

  const fetchInitialData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/trips/banners/'),
        api.get('/trips/categories/')
      ]);
      setBanners(bRes.data);
      setCategories(cRes.data);
      fetchPackages();
    } catch (e) { console.error(e); }
  };

  const fetchPackages = async () => {
    try {
      let url = '/trips/packages/';
      if (selectedCat) url += `?category=${selectedCat}`;
      const res = await api.get(url);
      setPackages(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = packages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.to_location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.page}>
      <Helmet>
        <title>Tripik | Discover Your Next Adventure</title>
        <meta name="description" content="Explore premium, hand-picked tour packages. Day-wise itineraries, transparent pricing, and instant booking inquiries." />
      </Helmet>

      {/* ── TOP NAV ── */}
      <nav style={s.topNav}>
        <div style={s.topNavInner}>
          <div style={s.logoArea}>
            <h1 style={s.logoText}>Tri<span style={{ color: 'var(--primary)' }}>pik</span></h1>
          </div>
          <div style={s.topActions}>
            <Link to="/notifications" style={s.iconBtn}>
              <Bell size={22} color="var(--text-primary)" />
              {unreadCount > 0 && <span style={s.notifBadge}>{unreadCount}</span>}
            </Link>
            <button style={s.profileBtn} onClick={() => navigate('/bookings')}>
              <User size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER SLIDER ── */}
      {banners.length > 0 && (
        <div style={s.bannerWrap}>
          <div style={s.bannerSlider} onScroll={e => {
            const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
            setActiveBanner(index);
          }}>
            {banners.map((b, i) => (
              <div key={b.id} style={s.bannerItem}>
                <img src={b.image_url} alt="" style={s.bannerImg} />
                <div style={s.bannerOverlay}>
                  <h3 style={s.bannerTitle}>{b.title}</h3>
                  <p style={s.bannerSub}>{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={s.bannerDots}>
            {banners.map((_, i) => (
              <div key={i} style={{ ...s.dot, background: activeBanner === i ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH ── */}
      <div style={s.hero}>
        <h2 style={s.heroTitle}>Where do you <br />want to go?</h2>
        <div style={s.searchBar}>
          <Search size={20} color="var(--text-muted)" />
          <input
            style={s.searchInput}
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div style={s.catBar}>
        <button
          style={{ ...s.catItem, ...(selectedCat === null ? s.catActive : {}) }}
          onClick={() => setSelectedCat(null)}
        >
          <TrendingUp size={20} />
          <span>All</span>
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            style={{ ...s.catItem, ...(selectedCat === c.slug ? s.catActive : {}) }}
            onClick={() => setSelectedCat(c.slug)}
          >
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* ── TRIP LIST ── */}
      <main style={s.main}>
        <div style={s.sectionHead}>
          <h3 style={s.sectionTitle}>
            {selectedCat ? `${selectedCat.charAt(0).toUpperCase() + selectedCat.slice(1)} Trips` : 'Explore Destinations'}
          </h3>
        </div>

        {filtered.length > 0 ? (
          <div style={s.grid}>
            {filtered.map(p => (
              <div key={p.id} style={s.gCard} onClick={() => navigate(`/package/${p.id}`)}>
                <div style={s.gImgWrap}>
                  {p.banner_url && <img src={p.banner_url} alt="" style={s.gImg} />}
                  <button
                    style={s.gFavBtn}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                  >
                    <Heart
                      size={24}
                      fill={isFavorite(p.id) ? "#ed4956" : "none"}
                      color={isFavorite(p.id) ? "#ed4956" : "#fff"}
                      style={{
                        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: isFavorite(p.id) ? 'scale(1.15)' : 'scale(1)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }}
                    />
                  </button>
                  <div style={s.gBadge}>{p.days}D / {p.nights}N</div>
                </div>
                <div style={s.gBody}>
                  <div style={s.gLoc}><MapPin size={14} /> {p.to_location}</div>
                  <h4 style={s.gTitle}>{p.title}</h4>
                  <div style={s.gDuration}><Clock size={14} style={{ marginRight: 6 }} /> {p.days} Days / {p.nights} Nights</div>
                  <div style={s.gMeta}>
                    <div style={s.gRating}><Star size={14} fill="#f59e0b" color="#f59e0b" /> {Number(p.avg_rating || 5).toFixed(1)}</div>
                    <div style={s.gPrice}>₹{Number(p.price_per_person).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={s.emptyState}>
            No destinations found matching "{search}".
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={s.bottomNav}>
        <button style={{ ...s.navItem, color: 'var(--primary)' }} onClick={() => navigate('/')}>
          <HomeIcon size={24} />
          <span style={s.navLabel}>Home</span>
          <div style={s.navDot} />
        </button>
        <button style={s.navItem} onClick={() => navigate('/bookings')}>
          <Briefcase size={24} />
          <span style={s.navLabel}>Bookings</span>
        </button>
        <button style={s.navItem} onClick={() => navigate('/favorites')}>
          <Heart size={24} />
          <span style={s.navLabel}>Favorites</span>
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

  // Top Nav
  topNav: { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', zIndex: 100 },
  topNavInner: { maxWidth: 500, margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoArea: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' },
  topActions: { display: 'flex', alignItems: 'center', gap: 15 },
  iconBtn: { position: 'relative', background: 'none', border: 'none', display: 'flex', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#ef4444', color: '#fff', fontSize: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid #fff' },
  profileBtn: { width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  emptyState: { textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 15 },

  // Banners
  bannerWrap: { position: 'relative', maxWidth: 500, margin: '15px auto', padding: '0 20px' },
  bannerSlider: { display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: 15, scrollbarWidth: 'none', borderRadius: 24 },
  bannerItem: { flex: '0 0 100%', scrollSnapAlign: 'start', position: 'relative', height: 220, borderRadius: 24, overflow: 'hidden' },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px 20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' },
  bannerTitle: { margin: 0, fontSize: 22, fontWeight: 900 },
  bannerSub: { margin: '4px 0 0', fontSize: 14, opacity: 0.8 },
  bannerDots: { position: 'absolute', bottom: 15, width: '100%', display: 'flex', justifyContent: 'center', gap: 6, zIndex: 5 },
  dot: { width: 6, height: 6, borderRadius: '50%', transition: 'all 0.3s' },

  // Categories
  catBar: { display: 'flex', overflowX: 'auto', gap: 12, padding: '10px 20px 20px', scrollbarWidth: 'none', maxWidth: 500, margin: '0 auto' },
  catItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', border: '1px solid var(--border)', borderRadius: 100, whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  catActive: { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' },

  // Hero
  hero: { maxWidth: 500, margin: '0 auto', padding: '10px 20px 10px' },
  heroTitle: { fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 20 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '14px 20px', borderRadius: 20, boxShadow: 'var(--shadow-md)' },
  searchInput: { border: 'none', fontSize: 15, width: '100%', fontWeight: 500 },

  // Main
  main: { maxWidth: 500, margin: '0 auto', padding: '0 20px', minHeight: '50vh' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', color: 'var(--text-primary)' },

  // Grid
  grid: { display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 20 },
  gCard: { background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' },
  gImgWrap: { height: 200, position: 'relative' },
  gImg: { width: '100%', height: '100%', objectFit: 'cover' },
  gFavBtn: { position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 },
  gBadge: { position: 'absolute', top: 15, left: 15, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, backdropFilter: 'blur(4px)' },
  gBody: { padding: '18px 20px' },
  gLoc: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  gTitle: { fontSize: 18, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.3, color: 'var(--text-primary)' },
  gDuration: { fontSize: 13, color: 'var(--primary)', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center' },
  gMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  gRating: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 },
  gPrice: { fontSize: 18, fontWeight: 800, color: 'var(--primary)' },

  // Bottom Nav
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, height: 75, background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 10px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 1000 },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', color: 'var(--text-muted)', position: 'relative', minWidth: 60 },
  navLabel: { fontSize: 10, fontWeight: 700 },
  navDot: { width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)', marginTop: 2 }
};