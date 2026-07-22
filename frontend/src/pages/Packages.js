// src/pages/Packages.js — Professional Browse Packages Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Heart, ArrowLeft, Home as HomeIcon, Briefcase, Navigation, User } from 'lucide-react';
import api from '../api';
import { useFavorites } from '../context/FavoritesContext';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

export default function Packages() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get('/trips/packages/');
      setPackages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpand = (e, pkgId) => {
    e.stopPropagation();
    setExpandedCards(prev => ({ ...prev, [pkgId]: !prev[pkgId] }));
  };

  const filtered = packages.filter(p =>
    (activeTab === 'All' || p.accommodation_type?.toLowerCase().includes(activeTab.toLowerCase())) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.to_location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <button style={s.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={s.headerTitle}>Browse Packages</h2>
          <button style={s.filterBtn}>
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* ── SEARCH & FILTER ── */}
      <div style={s.searchWrap}>
        <div style={s.searchBar}>
          <Search size={20} color="var(--text-muted)" />
          <input
            style={s.searchInput}
            placeholder="Search destination, theme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={s.tabs} className="hide-scrollbar">
          {['All', 'Budget', 'Luxury', 'Family', 'Honeymoon'].map(t => (
            <button
              key={t}
              style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── LISTING ── */}
      <main style={s.main}>
        {loading ? (
          <div style={s.loader}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <Search size={48} color="var(--text-muted)" style={{ marginBottom: 15 }} />
            <p>No packages found matching your search.</p>
          </div>
        ) : (
          <div style={s.list}>
            {filtered.map(p => (
              <div key={p.id} style={s.card} onClick={() => navigate(`/package/${p.id}`)}>
                <div style={s.cardImgWrap}>
                  {p.banner_url && <img src={p.banner_url} alt="" style={s.cardImg} />}
                  <button
                    style={s.favBtn}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                  >
                    <Heart size={20} fill={isFavorite(p.id) ? "var(--primary)" : "none"} color={isFavorite(p.id) ? "var(--primary)" : "#fff"} />
                  </button>
                  <div style={s.priceTag}>₹{Number(p.price_per_person).toLocaleString()}</div>
                </div>
                <div style={s.cardBody}>
                  <div style={s.cardTop}>
                    <h3 style={s.cardTitle}>{p.title}</h3>
                    <div style={s.cardRating}><Star size={14} fill="var(--accent)" color="var(--accent)" /> {p.avg_rating || '5.0'}</div>
                  </div>
                  <div style={s.cardLoc}><MapPin size={14} style={{ marginRight: 4 }} /> {p.to_location}</div>
                  
                  {/* Package Description with 100-word snippet & Read More / Read Less */}
                  {(() => {
                    const fullDesc = p.description || p.short_description || '';
                    const isExpanded = !!expandedCards[p.id];
                    const words = fullDesc.split(' ');
                    const isLong = words.length > 18 || fullDesc.length > 100;
                    
                    const descToShow = isExpanded 
                      ? words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '')
                      : words.slice(0, 18).join(' ') + (isLong ? '...' : '');

                    return (
                      <div style={s.cardDescWrap}>
                        <p style={s.cardDescText}>
                          {descToShow}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={(e) => toggleCardExpand(e, p.id)}
                            style={s.readMoreBtn}
                          >
                            {isExpanded ? 'Read Less ▲' : 'Read More ▼'}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div style={s.cardFooter}>
                    <span style={s.cardDuration}>{p.days} Days / {p.nights} Nights</span>
                    <button style={s.bookBtn}>View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER & BOTTOM NAV ── */}
      <Footer />
      <BottomNav />

      <style>{`
        .spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 0 },
  header: { background: '#fff', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)' },
  headerInner: { maxWidth: 500, margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { background: 'none', color: 'var(--text-primary)' },
  headerTitle: { fontSize: 18, fontWeight: 800, margin: 0 },
  filterBtn: { width: 38, height: 38, borderRadius: 12, background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  searchWrap: { maxWidth: 500, margin: '0 auto', padding: '20px 20px 10px' },
  searchBar: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '12px 18px', borderRadius: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 15 },
  searchInput: { border: 'none', fontSize: 14, width: '100%', fontWeight: 500 },
  tabs: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 5 },
  tab: { flexShrink: 0, padding: '8px 18px', borderRadius: 12, background: '#fff', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)' },
  tabActive: { background: 'var(--text-primary)', color: '#fff', borderColor: 'var(--text-primary)' },

  main: { maxWidth: 500, margin: '0 auto', padding: '0 20px' },
  list: { display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-md)', cursor: 'pointer' },
  cardImgWrap: { height: 180, position: 'relative' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  favBtn: { position: 'absolute', top: 15, right: 15, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  priceTag: { position: 'absolute', bottom: 15, left: 15, background: 'var(--primary)', color: '#fff', padding: '6px 14px', borderRadius: 12, fontWeight: 800, fontSize: 14, boxShadow: '0 4px 12px rgba(26,158,92,0.3)' },

  cardBody: { padding: '18px 20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  cardTitle: { fontSize: 17, fontWeight: 800, margin: 0, flex: 1 },
  cardRating: { fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 8 },
  cardLoc: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginBottom: 10 },
  cardDescWrap: { margin: '0 0 12px' },
  cardDescText: { fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' },
  readMoreBtn: { background: 'none', border: 'none', color: '#059669', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '4px 0 0 0', display: 'inline-flex', alignItems: 'center' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTop: '1px solid var(--border-light)' },
  cardDuration: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' },
  bookBtn: { background: 'var(--text-primary)', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700 },

  loader: { display: 'flex', justifyContent: 'center', padding: 50 },
  empty: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' },

  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, height: 75, background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 10px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 1000 },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', color: 'var(--text-muted)', position: 'relative', minWidth: 60 },
  navLabel: { fontSize: 10, fontWeight: 700 },
  navDot: { width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)', marginTop: 2 }
};
