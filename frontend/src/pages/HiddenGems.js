// src/pages/HiddenGems.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Bookmark, Heart, MapPin, Star, Plus, Compass,
  Mountain, Waves, Sun, Sparkles, Navigation, Search, Filter, LocateFixed, Utensils
} from 'lucide-react';
import AddHiddenSpotModal from '../components/AddHiddenSpotModal';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

export default function HiddenGems() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState('');

  const categories = [
    { name: 'All', icon: <Compass size={16} /> },
    { name: 'Mountains', icon: <Mountain size={16} /> },
    { name: 'Waterfalls', icon: <Waves size={16} /> },
    { name: 'Beaches', icon: <Sun size={16} /> },
    { name: 'Food Spot', icon: <Utensils size={16} /> },
  ];

  useEffect(() => {
    fetchSpots();
  }, [selectedCategory]);

  const fetchSpots = async () => {
    setLoading(true);
    try {
      let url = '/trips/hidden-spots/';
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const res = await api.get(url, { params });
      setSpots(res.data);
    } catch (err) {
      console.error('Failed to fetch hidden spots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectUserLocation = () => {
    setIsLocating(true);
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setIsLocating(false);
      },
      (err) => {
        console.error('GPS Location error:', err);
        setLocError('Could not access location. Please check browser GPS permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const displayedSpots = React.useMemo(() => {
    if (!userLocation) return spots;
    return [...spots].sort((a, b) => {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude) ?? (a.distance_km || 9999);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude) ?? (b.distance_km || 9999);
      return distA - distB;
    });
  }, [spots, userLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSpots();
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSpotAdded = (newSpot) => {
    setSpots((prev) => [newSpot, ...prev]);
  };

  return (
    <div style={styles.container}>
      <Helmet>
        <title>Hidden Gems — Tripik</title>
        <meta name="description" content="Discover handpicked unexplored hidden spots and secret travel gems." />
      </Helmet>

      {/* ── Top Nav Header ── */}
      <header style={styles.navHeader}>
        <div className="desktop-header-nav" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/')} style={styles.iconBtn} aria-label="Go Back">
              <ArrowLeft size={20} color="#0f172a" />
            </button>
            <h1 style={styles.pageTitle}>Hidden Gems</h1>
          </div>

          <nav className="desktop-nav-links">
            <Link to="/" className="desktop-nav-link">Home</Link>
            <Link to="/packages" className="desktop-nav-link">Packages</Link>
            <Link to="/hidden-gems" className="desktop-nav-link active">Hidden Gems</Link>
            <Link to="/bookings" className="desktop-nav-link">My Bookings</Link>
            <Link to="/favorites" className="desktop-nav-link">Favorites</Link>
          </nav>
        </div>
      </header>

      <main className="desktop-app-container" style={styles.mainContent}>
        {/* ── Banner ── */}
        <section style={styles.banner}>
          <div style={styles.bannerContent}>
            <span style={styles.bannerBadge}>
              <Sparkles size={14} color="#a7f3d0" /> Handpicked Unexplored Places
            </span>
            <h2 style={styles.bannerHeading}>
              Find the places that most travelers never see!
            </h2>
            <p style={styles.bannerSub}>
              Handpicked hidden gems for curious travelers like you.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              style={styles.addSpotCta}
            >
              <Plus size={18} />
              <span>Add Hidden Spot</span>
            </button>
          </div>
        </section>

        {/* ── Search & Categories Filter Bar ── */}
        <section style={styles.filterSection}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Search spots, landmarks, regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <button
              type="button"
              onClick={handleDetectUserLocation}
              disabled={isLocating}
              title={
                isLocating
                  ? "Detecting location..."
                  : userLocation
                  ? "GPS Active — Sorted by Nearest Gems"
                  : "Detect My GPS Location & Distance (km)"
              }
              style={{
                ...styles.gpsSearchIconBtn,
                background: userLocation || isLocating ? '#059669' : '#f1f5f9',
                color: userLocation || isLocating ? '#ffffff' : '#059669',
                borderWidth: userLocation || isLocating ? '0px' : '1px',
                borderStyle: 'solid',
                borderColor: userLocation || isLocating ? 'transparent' : '#cbd5e1',
                boxShadow: userLocation || isLocating ? '0 4px 14px rgba(5, 150, 105, 0.4)' : 'none',
              }}
            >
              <LocateFixed size={18} color={userLocation || isLocating ? '#ffffff' : '#059669'} />
            </button>
          </form>
          {locError && <span style={styles.locErrorMsg}>{locError}</span>}

          <div style={styles.categoryBar}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    ...styles.catPill,
                    ...(active ? styles.catPillActive : {}),
                  }}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Hidden Spots Cards List ── */}
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>Loading hidden gems...</p>
          </div>
        ) : displayedSpots.length === 0 ? (
          <div style={styles.emptyBox}>
            <Compass size={48} color="#059669" />
            <h3 style={{ fontSize: 18, color: '#0f172a', margin: '12px 0 4px' }}>No hidden spots found</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Be the first traveler to contribute a hidden spot!</p>
            <button onClick={() => setIsModalOpen(true)} style={styles.addSpotCta}>
              <Plus size={16} /> Add Hidden Spot
            </button>
          </div>
        ) : (
          <div className="desktop-gems-grid" style={styles.spotsGrid}>
            {displayedSpots.map((spot) => {
              const isFav = !!favorites[spot.id];
              const liveDist = userLocation && spot.latitude && spot.longitude
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, spot.latitude, spot.longitude)
                : null;
              const mapUrl = spot.latitude && spot.longitude
                ? `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.address)}`;

              return (
                <article key={spot.id} style={styles.spotCard}>
                  {/* Image Container */}
                  <div style={{ ...styles.imageWrap, cursor: 'pointer' }} onClick={() => navigate(`/hidden-gems/${spot.id}`)}>
                    <img
                      src={spot.cover_image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'}
                      alt={spot.name}
                      style={styles.spotImg}
                    />

                    {/* Green Hidden Gem Badge */}
                    <div style={styles.gemBadge}>
                      <Sparkles size={13} color="#ffffff" />
                      <span>Hidden Gem</span>
                    </div>

                    {/* Dynamic GPS Distance Badge */}
                    <div
                      style={{
                        ...styles.distanceBadge,
                        background: liveDist !== null ? '#047857' : 'rgba(255, 255, 255, 0.95)',
                        color: liveDist !== null ? '#ffffff' : '#0f172a',
                      }}
                    >
                      <span>{liveDist !== null ? `🎯 ${liveDist} km away` : `${spot.distance_km} km`}</span>
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(spot.id);
                      }}
                      style={{
                        ...styles.heartBtn,
                        background: isFav ? '#ef4444' : 'rgba(15, 23, 42, 0.45)',
                      }}
                      aria-label="Save to favorites"
                    >
                      <Heart size={16} color="#ffffff" fill={isFav ? '#ffffff' : 'none'} />
                    </button>
                  </div>

                  {/* Spot Card Body */}
                  <div style={styles.cardBody}>
                    <div>
                      <div style={styles.cardHeader}>
                        <h3
                          style={{ ...styles.spotName, cursor: 'pointer' }}
                          onClick={() => navigate(`/hidden-gems/${spot.id}`)}
                          title={spot.name}
                        >
                          {spot.name}
                        </h3>
                        <div style={styles.ratingBox}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <span style={styles.ratingText}>{spot.avg_rating || '4.7'}</span>
                          <span style={styles.reviewCount}>({spot.reviews_count || 12})</span>
                        </div>
                      </div>

                      <div style={styles.locationRow}>
                        <MapPin size={12} color="#059669" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{spot.address}</span>
                      </div>

                      {spot.nearby_landmark && (
                        <div style={styles.landmarkTag}>
                          🏛️ {spot.nearby_landmark}
                        </div>
                      )}

                      <p style={styles.description}>
                        {spot.description}
                      </p>
                    </div>

                    <div style={styles.cardFooter}>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.mapLinkBtn}
                      >
                        <Navigation size={12} />
                        <span>Navigate</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Add Hidden Spot Modal ── */}
      <AddHiddenSpotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSpotAdded={handleSpotAdded}
      />

      <Footer />
      <BottomNav />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: 0,
  },
  navHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid #e2e8f0',
  },
  iconBtn: {
    background: '#f1f5f9',
    border: 'none',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  pageTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
    color: '#0f172a',
  },
  mainContent: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '16px',
  },
  banner: {
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)',
    borderRadius: '24px',
    padding: '24px',
    color: '#ffffff',
    marginBottom: '20px',
    boxShadow: '0 12px 30px -10px rgba(4, 120, 87, 0.35)',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerContent: {
    maxWidth: '420px',
    position: 'relative',
    zIndex: 2,
  },
  bannerBadge: {
    fontSize: '12px',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
  },
  bannerHeading: {
    fontSize: '22px',
    fontWeight: '800',
    margin: '0 0 8px 0',
    lineHeight: '1.25',
  },
  bannerSub: {
    fontSize: '13px',
    opacity: 0.9,
    margin: '0 0 16px 0',
  },
  addSpotCta: {
    background: '#ffffff',
    color: '#064e3b',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
  },
  filterSection: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  locationActionBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  gpsLocationBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  locErrorMsg: {
    fontSize: '12px',
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffffff',
    padding: '6px 6px 6px 16px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#0f172a',
  },
  gpsSearchIconBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryBar: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  catPill: {
    background: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    color: '#475569',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  catPillActive: {
    background: '#047857',
    color: '#ffffff',
    borderColor: '#047857',
    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
  },
  spotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  spotCard: {
    background: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: {
    position: 'relative',
    height: '130px',
    width: '100%',
    overflow: 'hidden',
  },
  spotImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  gemBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: 'rgba(5, 150, 105, 0.92)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    padding: '3px 7px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    backdropFilter: 'blur(4px)',
    padding: '3px 7px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '700',
  },
  heartBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    border: 'none',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
  cardBody: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '4px',
  },
  spotName: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.2',
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  ratingText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  reviewCount: {
    fontSize: '11px',
    color: '#64748b',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '11.5px',
    color: '#475569',
    fontWeight: '600',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  landmarkTag: {
    fontSize: '10.5px',
    color: '#047857',
    background: '#ecfdf5',
    padding: '2px 6px',
    borderRadius: '6px',
    display: 'inline-block',
    marginBottom: '6px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  description: {
    fontSize: '11.5px',
    color: '#64748b',
    lineHeight: '1.3',
    margin: '0 0 8px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '8px',
    marginTop: 'auto',
  },
  mapLinkBtn: {
    color: '#059669',
    background: '#ecfdf5',
    padding: '6px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    width: '100%',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px',
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
};
