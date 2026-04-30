// src/pages/BrowsePackages.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BrowsePackages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [days, setDays] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        let url = 'http://localhost:8000/api/trips/packages/';
        if (location) url += `?location=${location}`;
        if (days) url += location ? `&days=${days}` : `?days=${days}`;

        const res = await fetch(url);
        const data = await res.json();
        setPackages(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [location, days]);

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <h2 style={s.logo} onClick={() => navigate('/')}>✈️ TripAI</h2>
        <div style={s.navRight}>
          {user ? (
            <button style={s.navBtn} onClick={() => navigate('/bookings')}>
              📋 My Bookings
            </button>
          ) : (
            <button style={s.navBtn} onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </nav>

      <div style={s.container}>
        <h1 style={s.title}>✈️ Travel Packages</h1>

        {/* Filters */}
        <div style={s.filterBar}>
          <input
            style={s.filterInput}
            placeholder="Search by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            style={s.filterSelect}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="">All Durations</option>
            <option value="2">2 Days</option>
            <option value="3">3 Days</option>
            <option value="4">4 Days</option>
            <option value="5">5 Days</option>
            <option value="7">7 Days</option>
          </select>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div style={s.loading}><div style={s.spinner} /></div>
        ) : packages.length === 0 ? (
          <p style={s.empty}>No packages found</p>
        ) : (
          <div style={s.grid}>
            {packages.map(pkg => (
              <div key={pkg.id} style={s.card}>
                {/* Banner */}
                {pkg.banner_url && (
                  <img src={pkg.banner_url} style={s.banner} alt={pkg.title} />
                )}

                <div style={s.body}>
                  <h3 style={s.pkgTitle}>{pkg.title}</h3>
                  <p style={s.route}>
                    {pkg.from_location} → {pkg.to_location}
                  </p>

                  <div style={s.meta}>
                    <span>📅 {pkg.days} days / {pkg.nights} nights</span>
                    <span>🏨 {pkg.accommodation_type}</span>
                  </div>

                  {/* Rating */}
                  <div style={s.rating}>
                    <span style={s.stars}>{'★'.repeat(Math.floor(pkg.avg_rating))}</span>
                    <span>{pkg.avg_rating.toFixed(1)}</span>
                    <span>({pkg.total_reviews} reviews)</span>
                  </div>

                  {/* Price */}
                  <div style={s.price}>
                    <span style={s.label}>From</span>
                    <span style={s.amount}>
                      ₹{Number(pkg.price_per_person).toLocaleString('en-IN')}/person
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    style={s.viewBtn}
                    onClick={() => navigate(`/package/${pkg.id}`)}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f7f8fc', fontFamily: 'sans-serif' },
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { margin: 0, fontSize: 22, fontWeight: 700, color: '#4f46e5', cursor: 'pointer' },
  navRight: { display: 'flex', gap: 12 },
  navBtn: { padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' },
  title: { fontSize: 32, fontWeight: 700, color: '#1a1a2e', margin: '0 0 32px' },
  filterBar: { display: 'flex', gap: 12, marginBottom: 32 },
  filterInput: { flex: 1, padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' },
  filterSelect: { padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' },
  loading: { textAlign: 'center', padding: '60px' },
  spinner: { width: 40, height: 40, border: '4px solid #e0e7ff', borderTop: '4px solid #4f46e5', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' },
  empty: { textAlign: 'center', color: '#888', fontSize: 16, padding: '60px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 },
  card: { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' },
  banner: { width: '100%', height: 180, objectFit: 'cover' },
  body: { padding: '16px' },
  pkgTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' },
  route: { fontSize: 13, color: '#6b7280', margin: '0 0 12px' },
  meta: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#6b7280', marginBottom: 10 },
  rating: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 12 },
  stars: { color: '#f59e0b' },
  price: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  label: { fontSize: 12, color: '#9ca3af' },
  amount: { fontSize: 16, fontWeight: 700, color: '#4f46e5' },
  viewBtn: { width: '100%', padding: '11px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }
};