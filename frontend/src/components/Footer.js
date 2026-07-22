// src/components/Footer.js — Startup Level Professional Desktop & Mobile Footer
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function Footer() {
  return (
    <footer className="site-footer" style={s.footer}>
      <div className="desktop-header-nav" style={s.container}>
        {/* Main Grid Columns */}
        <div style={s.grid}>
          {/* Column 1: Brand & Tagline */}
          <div style={s.colBrand}>
            <div style={s.logoWrap}>
              <span style={s.logoText}>
                TRIPIK<span style={{ color: '#059669' }}>.</span>
              </span>
            </div>
            <p style={s.brandDesc}>
              India's premier travel platform for curated group departures, handpicked package tours, and secret hidden gem destinations.
            </p>

            <div style={s.trustBadgeWrap}>
              <ShieldCheck size={18} color="#059669" />
              <span>100% Verified & Secure Bookings</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Quick Links</h4>
            <ul style={s.linkList}>
              <li><Link to="/" style={s.link}>Home</Link></li>
              <li><Link to="/packages" style={s.link}>Tour Packages</Link></li>
              <li><Link to="/hidden-gems" style={s.link}>Hidden Gems</Link></li>
              <li><Link to="/bookings" style={s.link}>My Bookings</Link></li>
              <li><Link to="/favorites" style={s.link}>Favorite Places</Link></li>
            </ul>
          </div>

          {/* Column 3: Popular Trips */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Top Destinations</h4>
            <ul style={s.linkList}>
              <li><Link to="/packages" style={s.link}>Kashmir Summer Special</Link></li>
              <li><Link to="/packages" style={s.link}>Manali & Solang Valley</Link></li>
              <li><Link to="/packages" style={s.link}>Ladakh Expedition</Link></li>
              <li><Link to="/packages" style={s.link}>Kerala Backwaters</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Official Support */}
          <div style={s.col}>
            <h4 style={s.colTitle}>Contact Us</h4>
            <div style={s.contactList}>
              <a href="mailto:tripikofficial@gmail.com" style={s.contactItem}>
                <div style={s.contactIconWrap}>
                  <Mail size={16} color="#059669" />
                </div>
                <div>
                  <span style={s.contactLabel}>Official Contact Email</span>
                  <span style={s.contactValue}>tripikofficial@gmail.com</span>
                </div>
              </a>

              <div style={s.contactItem}>
                <div style={s.contactIconWrap}>
                  <Phone size={16} color="#059669" />
                </div>
                <div>
                  <span style={s.contactLabel}>24/7 Traveler Support</span>
                </div>
              </div>

              <div style={s.contactItem}>
                <div style={s.contactIconWrap}>
                  <MapPin size={16} color="#059669" />
                </div>
                <div>
                  <span style={s.contactLabel}>Headquarters</span>
                  <span style={s.contactValue}>kerala,kochi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Bottom Copyright Bar */}
        <div style={s.bottomBar}>
          <p style={s.copyrightText}>
            © {new Date().getFullYear()} <strong>Tripik Travel Technologies</strong>. All rights reserved.
          </p>

          <div style={s.socialLinks}>
            <a href="https://www.instagram.com/tripikofficial?igsh=d3o5a3FrYThnamd5" target="_blank" rel="noreferrer" style={s.socialIcon} aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={s.socialIcon} aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={s.socialIcon} aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={s.socialIcon} aria-label="YouTube">
              <YoutubeIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    paddingTop: '50px',
    paddingBottom: '90px',
    borderTop: '1px solid #1e293b',
    marginTop: '40px',
  },
  container: {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '0 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '36px',
    marginBottom: '36px',
  },
  colBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  logoWrap: {
    display: 'inline-block',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  brandDesc: {
    fontSize: '13.5px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0,
  },
  trustBadgeWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e293b',
    padding: '8px 14px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#34d399',
    marginTop: '4px',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  colTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.2px',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'inherit',
  },
  contactIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
  },
  contactValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  divider: {
    height: '1px',
    backgroundColor: '#1e293b',
    marginBottom: '24px',
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  copyrightText: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  socialLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  socialIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
};
