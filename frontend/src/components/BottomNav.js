// src/components/BottomNav.js — Consistent Emerald Green Theme
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Sparkles, Package, Briefcase, Heart } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const brandGreen = '#059669';
  const activeBg = '#ecfdf5';
  const unselectedColor = '#64748b';

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: (active) => <HomeIcon size={20} color={active ? brandGreen : unselectedColor} fill={active ? brandGreen : 'none'} />,
    },
    {
      label: 'Hidden Gems',
      path: '/hidden-gems',
      icon: (active) => <Sparkles size={20} color={active ? brandGreen : unselectedColor} fill={active ? brandGreen : 'none'} />,
    },
    {
      label: 'Packages',
      path: '/packages',
      icon: (active) => <Package size={20} color={active ? brandGreen : unselectedColor} fill={active ? brandGreen : 'none'} />,
    },
    {
      label: 'Bookings',
      path: '/bookings',
      icon: (active) => <Briefcase size={20} color={active ? brandGreen : unselectedColor} fill={active ? brandGreen : 'none'} />,
    },
    {
      label: 'Favorites',
      path: '/favorites',
      icon: (active) => <Heart size={20} color={active ? brandGreen : unselectedColor} fill={active ? brandGreen : 'none'} />,
    },
  ];

  return (
    <nav className="bottom-nav-bar" style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={styles.navItem}
          >
            <div
              style={{
                ...styles.iconWrap,
                background: isActive ? activeBg : 'transparent',
              }}
            >
              {item.icon(isActive)}
            </div>
            <span
              style={{
                ...styles.navLabel,
                color: isActive ? brandGreen : unselectedColor,
                fontWeight: isActive ? 800 : 600,
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  ...styles.navDot,
                  background: brandGreen,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '500px',
    height: '72px',
    background: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 6px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    zIndex: 1000,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    background: 'none',
    border: 'none',
    position: 'relative',
    minWidth: '60px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  iconWrap: {
    width: '38px',
    height: '28px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  navLabel: {
    fontSize: '11px',
    letterSpacing: '-0.2px',
    transition: 'color 0.2s',
  },
  navDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    marginTop: '1px',
  },
};
