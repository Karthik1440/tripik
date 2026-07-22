// src/pages/HiddenSpotDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Bookmark, Heart, MapPin, Star, Sparkles,
  Navigation, Share2, Compass, ShieldCheck, Info, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function HiddenSpotDetail() {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSpotDetail();
  }, [spotId]);

  const fetchSpotDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/trips/hidden-spots/${spotId}/`);
      setSpot(res.data);
    } catch (err) {
      console.error('Failed to load spot detail:', err);
      setError('Could not load hidden spot details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: spot?.name || 'Hidden Spot',
        text: `Check out this unexplored hidden gem: ${spot?.name}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '14px' }}>
          Discovering secret location details...
        </p>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div style={styles.errorContainer}>
        <Compass size={48} color="#ef4444" />
        <h2 style={{ fontSize: '20px', color: '#0f172a', margin: '12px 0 6px' }}>Spot Not Found</h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => navigate('/hidden-gems')} style={styles.backBtnCta}>
          Back to Hidden Gems
        </button>
      </div>
    );
  }

  const photos = spot.photos && spot.photos.length > 0
    ? spot.photos
    : ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000'];

  const mapUrl = spot.latitude && spot.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.address)}`;

  return (
    <div style={styles.page}>
      <Helmet>
        <title>{`${spot.name} | Unexplored Hidden Gem — Tripik`}</title>
        <meta name="description" content={spot.description?.substring(0, 160) || `Discover the secret hidden gem ${spot.name} on Tripik.`} />
        <meta property="og:title" content={`${spot.name} | Secret Location — Tripik`} />
        <meta property="og:description" content={spot.description?.substring(0, 160)} />
        {photos[0] && <meta property="og:image" content={photos[0]} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            "name": spot.name,
            "description": spot.description,
            "address": spot.address,
            "image": photos[0],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": spot.avg_rating || 4.7,
              "reviewCount": spot.reviews_count || 15
            }
          })}
        </script>
      </Helmet>

      {/* ── Sticky Top Nav ── */}
      <header style={styles.navHeader}>
        <button onClick={() => navigate('/hidden-gems')} style={styles.iconBtn} aria-label="Back">
          <ArrowLeft size={20} color="#0f172a" />
        </button>
        <h1 style={styles.headerTitle}>{spot.name}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleShare} style={styles.iconBtn} aria-label="Share">
            <Share2 size={18} color="#0f172a" />
          </button>
          <button
            onClick={() => setIsFav(!isFav)}
            style={{
              ...styles.iconBtn,
              background: isFav ? '#fef2f2' : '#f1f5f9',
            }}
            aria-label="Save"
          >
            <Heart size={18} color={isFav ? '#ef4444' : '#0f172a'} fill={isFav ? '#ef4444' : 'none'} />
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {copied && (
        <div style={styles.toast}>
          <CheckCircle2 size={16} /> Spot link copied to clipboard!
        </div>
      )}

      <main style={styles.main}>
        {/* 📸 Photo Display & Gallery Carousel */}
        <section style={styles.gallerySection}>
          <div style={styles.mainImageWrap}>
            <img src={photos[activePhotoIdx]} alt={spot.name} style={styles.mainImage} />
            
            {/* Badges */}
            <div style={styles.gemBadge}>
              <Sparkles size={13} color="#ffffff" />
              <span>Hidden Gem</span>
            </div>

            <div style={styles.distBadge}>
              <span>{spot.distance_km} km away</span>
            </div>
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 1 && (
            <div style={styles.thumbRow}>
              {photos.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  style={{
                    ...styles.thumbBtn,
                    ...(activePhotoIdx === idx ? styles.thumbBtnActive : {}),
                  }}
                >
                  <img src={src} alt="Thumb" style={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 🏷️ Spot Information Header */}
        <section style={styles.infoSection}>
          <div style={styles.categoryPill}>
            <span>{spot.category}</span>
          </div>

          <h1 style={styles.spotTitle}>{spot.name}</h1>

          <div style={styles.locationRow}>
            <MapPin size={16} color="#059669" />
            <span>{spot.address}</span>
          </div>

          <div style={styles.ratingRow}>
            <div style={styles.ratingBadge}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <span style={styles.ratingValue}>{spot.avg_rating || '4.7'}</span>
            </div>
            <span style={styles.reviewText}>
              based on {spot.reviews_count || 12} community reviews
            </span>
          </div>

          {spot.nearby_landmark && (
            <div style={styles.landmarkBox}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#047857' }}>
                🏛️ Nearby Landmark:
              </span>
              <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                {spot.nearby_landmark}
              </span>
            </div>
          )}
        </section>

        {/* 🗺️ Quick Specs Grid */}
        <section style={styles.specsGrid}>
          <div style={styles.specCard}>
            <span style={styles.specIcon}>📍</span>
            <span style={styles.specLabel}>Distance</span>
            <span style={styles.specVal}>{spot.distance_km} km away</span>
          </div>

          <div style={styles.specCard}>
            <span style={styles.specIcon}>🏛️</span>
            <span style={styles.specLabel}>Landmark</span>
            <span style={styles.specVal}>{spot.nearby_landmark || 'Local Area'}</span>
          </div>

          <div style={styles.specCard}>
            <span style={styles.specIcon}>🗺️</span>
            <span style={styles.specLabel}>GPS Location</span>
            <span style={styles.specVal}>
              {spot.latitude ? `${spot.latitude}° N` : 'Coordinates Set'}
            </span>
          </div>
        </section>

        {/* 📝 About & Description */}
        <section style={styles.cardSection}>
          <h2 style={styles.sectionHeading}>About this Hidden Spot</h2>
          <p style={styles.descriptionText}>{spot.description}</p>

          <div style={styles.tipBox}>
            <Info size={18} color="#047857" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#047857', display: 'block' }}>
                Explorer Tip
              </span>
              <span style={{ fontSize: '13px', color: '#065f46', lineHeight: '1.4' }}>
                Visit during early morning hours for misty views and clear photography lighting. Carry water and wear comfortable footwear.
              </span>
            </div>
          </div>
        </section>

        {/* 🧭 Location & Map Navigation Box */}
        <section style={styles.cardSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={styles.sectionHeading}>Location & Directions</h2>
            <ShieldCheck size={18} color="#059669" />
          </div>

          <div style={styles.mapCardInner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.mapIconCircle}>
                <Navigation size={20} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                  {spot.name}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                  {spot.address}
                </p>
              </div>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navigateBtn}
            >
              <span>Get Directions via Google Maps</span>
              <ChevronRight size={16} />
            </a>
          </div>
        </section>

        {/* Community Verified Footer */}
        <section style={styles.verifiedFooter}>
          <Sparkles size={16} color="#047857" />
          <span>Handpicked & Verified by the Tripik Explorer Community</span>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '50px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #cbd5e1',
    borderTopColor: '#059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
  },
  backBtnCta: {
    background: '#047857',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
  },
  navHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.92)',
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
    transition: 'all 0.2s',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    color: '#0f172a',
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toast: {
    position: 'fixed',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0f172a',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
  },
  main: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  gallerySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  mainImageWrap: {
    position: 'relative',
    height: '280px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  gemBadge: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    background: 'rgba(5, 150, 105, 0.95)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  distBadge: {
    position: 'absolute',
    bottom: '14px',
    left: '14px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(4px)',
    color: '#0f172a',
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
  },
  thumbRow: {
    display: 'flex',
    gap: '10px',
  },
  thumbBtn: {
    width: '64px',
    height: '64px',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '2px solid transparent',
    padding: 0,
    background: 'none',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'all 0.2s',
  },
  thumbBtnActive: {
    borderColor: '#059669',
    opacity: 1,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoSection: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categoryPill: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#047857',
    background: '#ecfdf5',
    padding: '3px 10px',
    borderRadius: '6px',
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  spotTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#475569',
    fontWeight: '600',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  ratingBadge: {
    background: '#fef3c7',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  ratingValue: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#92400e',
  },
  reviewText: {
    fontSize: '13px',
    color: '#64748b',
  },
  landmarkBox: {
    marginTop: '6px',
    padding: '10px 12px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  specCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '14px 10px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  specIcon: {
    fontSize: '18px',
  },
  specLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: '12.5px',
    color: '#0f172a',
    fontWeight: '700',
  },
  cardSection: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  sectionHeading: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 12px 0',
  },
  descriptionText: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 14px 0',
  },
  tipBox: {
    background: '#ecfdf5',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid #a7f3d0',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  mapCardInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  mapIconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateBtn: {
    background: '#047857',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '12px 18px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
  },
  verifiedFooter: {
    background: '#f0fdf4',
    border: '1px dashed #bbf7d0',
    borderRadius: '16px',
    padding: '12px',
    textAlign: 'center',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#047857',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
};
