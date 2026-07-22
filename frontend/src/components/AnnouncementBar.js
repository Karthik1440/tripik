// src/components/AnnouncementBar.js
import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AnnouncementBar() {
  const [bar, setBar] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in current session
    if (sessionStorage.getItem('tripik_announcement_dismissed') === 'true') {
      setDismissed(true);
      return;
    }

    const fetchBar = async () => {
      try {
        const res = await api.get('/trips/announcement-bar/');
        if (res.status === 200 && res.data && res.data.is_active) {
          setBar(res.data);
        }
      } catch (err) {
        console.error('Error fetching announcement bar:', err);
      }
    };

    fetchBar();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('tripik_announcement_dismissed', 'true');
  };

  if (dismissed || !bar || !bar.is_active) return null;

  const bgStyle = {
    backgroundColor: bar.bg_color || '#059669',
    color: bar.text_color || '#ffffff',
  };

  return (
    <div style={{ ...s.container, ...bgStyle }}>
      <div style={s.inner}>
        {/* Left Badge Pill */}
        <span style={s.badge}>
          {bar.badge_text || 'ANNOUNCEMENT'}
        </span>

        {/* Running Text Marquee Track */}
        <div className="announcement-marquee-wrap">
          <div className="announcement-marquee-track">
            {bar.link_url ? (
              <Link to={bar.link_url} style={s.link}>
                <span style={s.message}>{bar.message}</span>
                <ChevronRight size={14} style={{ marginLeft: 4, opacity: 0.9 }} />
              </Link>
            ) : (
              <span style={s.message}>{bar.message}</span>
            )}
          </div>
        </div>

        {/* Close Dismiss Button */}
        <button onClick={handleDismiss} style={s.closeBtn} aria-label="Close Announcement">
          <X size={16} color={bar.text_color || '#ffffff'} />
        </button>
      </div>
    </div>
  );
}

const s = {
  container: {
    width: '100%',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    position: 'relative',
    zIndex: 200,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  inner: {
    maxWidth: '1080px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    position: 'relative',
    paddingRight: '28px',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    padding: '3px 10px',
    borderRadius: '8px',
    fontSize: '10.5px',
    fontWeight: '800',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    flexShrink: 0,
    zIndex: 2,
  },
  message: {
    lineHeight: 1.4,
    display: 'inline-block',
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
    zIndex: 2,
  },
};
