// src/pages/PackageDetail.js — Reworked with Lucide Icons & Favorites
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Star, MapPin, Calendar, Users, 
  Clock, Coffee, Shield, Phone, ChevronRight, 
  CheckCircle, Check, Info, Info as HelpCircle 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function PackageDetail() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  // Booking State
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchDetail();
    window.scrollTo(0, 0);
  }, [packageId]);

  const fetchDetail = async () => {
    try {
      const [pkgRes, revRes] = await Promise.all([
        api.get(`/trips/packages/${packageId}/`),
        api.get(`/trips/packages/${packageId}/reviews/`)
      ]);
      setPkg(pkgRes.data);
      setReviews(revRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    try {
      const payload = {
        adults,
        children,
        start_date: startDate,
        end_date: startDate, // Simple placeholder for now
        phone,
      };
      await api.post(`/trips/packages/${packageId}/book/`, payload);
      setBookingSuccess(true);
      setStep(3);
    } catch (e) {
      const msg = e.response?.data?.detail || "Booking failed. Please check details.";
      alert(msg);
      console.error("Booking error:", e.response?.data || e);
    }
  };

  if (loading) return <div style={s.loader}>Loading...</div>;
  if (!pkg) return <div style={s.loader}>Package not found</div>;

  const totalPrice = pkg.price_per_person * adults;

  return (
    <div style={s.page}>
      <Helmet>
        <title>{pkg.title} | Tripik Travel</title>
        <meta name="description" content={pkg.description?.substring(0, 160) || `Book the ${pkg.title} experience on Tripik.`} />
        
        {/* Open Graph / social sharing */}
        <meta property="og:title" content={`${pkg.title} - ${pkg.days} Days / ${pkg.nights} Nights`} />
        <meta property="og:description" content={pkg.description?.substring(0, 160)} />
        {pkg.banner_url && <meta property="og:image" content={pkg.banner_url} />}
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── IMAGE GALLERY SLIDER ── */}
      <div style={s.hero}>
        <div style={s.gallerySlider} onScroll={e => {
            const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
            setActiveImg(index);
        }}>
          {/* Main Cover Image first */}
          <div style={s.slideItem}><img src={pkg.banner_url} alt="" style={s.heroImg} /></div>
          {/* Gallery Images follow */}
          {pkg.gallery?.map((img, i) => (
            <div key={i} style={s.slideItem}><img src={img.url} alt={img.alt_text} style={s.heroImg} /></div>
          ))}
        </div>
        
        <div style={s.heroOverlay} />
        
        <div style={s.heroNav}>
          <button style={s.circleBtn} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <button 
            style={s.circleBtn} 
            onClick={() => toggleFavorite(pkg)}
          >
            <Heart 
              size={22} 
              fill={isFavorite(pkg.id) ? "#ed4956" : "none"} 
              color={isFavorite(pkg.id) ? "#ed4956" : "#fff"} 
              style={{ 
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                transform: isFavorite(pkg.id) ? 'scale(1.15)' : 'scale(1)' 
              }}
            />
          </button>
        </div>

        {/* Slider dots */}
        <div style={s.indicators}>
           {[pkg.banner_url, ...(pkg.gallery || [])].map((_, i) => (
             <div key={i} style={{...s.dot, background: activeImg === i ? '#fff' : 'rgba(255,255,255,0.4)', width: activeImg === i ? 16 : 6}} />
           ))}
        </div>
      </div>

      <main style={s.content}>
        {step === 1 && (
          <div className="animate-fadeUp">
            <div style={s.badge}>Bestseller</div>
            <h1 style={s.title}>{pkg.title}</h1>
            <div style={s.metaRow}>
              <div style={s.loc}><MapPin size={14} /> {pkg.to_location}</div>
              <div style={s.rating}><Star size={14} fill="var(--accent)" color="var(--accent)" /> {Number(pkg.avg_rating || 5).toFixed(1)} ({pkg.total_reviews} reviews)</div>
            </div>

            <div style={s.stats}>
              <div style={s.statItem}>
                <div style={s.statIcon}><Clock size={16} /></div>
                <div><div style={s.statLabel}>Duration</div><div style={s.statVal}>{pkg.days}D / {pkg.nights}N</div></div>
              </div>
              <div style={s.statItem}>
                <div style={s.statIcon}><Users size={16} /></div>
                <div><div style={s.statLabel}>Group</div><div style={s.statVal}>Max 12 Pax</div></div>
              </div>
              <div style={s.statItem}>
                <div style={s.statIcon}><Calendar size={16} /></div>
                <div><div style={s.statLabel}>Valid</div><div style={s.statVal}>All Year</div></div>
              </div>
            </div>

            <h3 style={s.secTitle}>Description</h3>
            <p style={s.desc}>{pkg.description}</p>

            <h3 style={s.secTitle}>Itinerary</h3>
            <div style={s.itinerary}>
              {pkg.itinerary?.map((day, idx) => (
                <div key={idx} style={s.dayRow}>
                  <div style={s.dayCircle}>{day.day_number}</div>
                  <div style={s.dayContent}>
                    <h4 style={s.dayTitle}>{day.title}</h4>
                    <p style={s.dayTxt}>{day.description}</p>
                    
                    {/* Add-on Data */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8}}>
                      {day.travel_distance_km && <div style={s.dayBadge}><MapPin size={12} /> {day.travel_distance_km} km ({day.travel_time})</div>}
                      {day.places?.length > 0 && <div style={s.dayBadge}><Star size={12} /> Places: {day.places.map(p => p.place_name).join(', ')}</div>}
                      {day.stay_type && <div style={s.dayBadge}><CheckCircle size={12} /> Stay: {day.stay_type}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={s.secTitle}>Inclusions & Exclusions</h3>
            <div style={s.incBox}>
              <div style={s.incList}>
                 <h4 style={{fontSize: 14, color: '#10b981', marginBottom: 8}}>Includes</h4>
                 {pkg.includes_excludes?.filter(i => i.type === 'INCLUDE').map((inc, i) => (
                    <div key={i} style={s.incItem}><CheckCircle size={14} color="#10b981" /> {inc.text}</div>
                 ))}
              </div>
              <div style={s.incList}>
                 <h4 style={{fontSize: 14, color: '#ef4444', marginBottom: 8}}>Excludes</h4>
                 {pkg.includes_excludes?.filter(i => i.type === 'EXCLUDE').map((exc, i) => (
                    <div key={i} style={s.incItem}><Clock size={14} color="#ef4444" /> {exc.text}</div>
                 ))}
              </div>
            </div>

            {pkg.addons?.length > 0 && (
              <>
                <h3 style={s.secTitle}>Available Add-ons</h3>
                <div style={{...s.incBox, padding: '12px 16px', gap: 12}}>
                  {pkg.addons.map(addon => (
                    <div key={addon.name} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div>
                        <div style={{fontSize:14, fontWeight:700, color:'var(--text-primary)'}}><Shield size={12} color="var(--primary)"/> {addon.name}</div>
                        {addon.description && <div style={{fontSize:12, color:'var(--text-muted)'}}>{addon.description}</div>}
                      </div>
                      <div style={{fontSize:14, fontWeight:800, color:'var(--primary)'}}>+₹{Number(addon.price)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 style={s.secTitle}>Traveler Reviews</h3>
            {reviews.length === 0 ? (
              <p style={{...s.desc, fontStyle: 'italic', color: 'var(--text-muted)' }}>No reviews yet. Be the first to book and review!</p>
            ) : (
              <div style={s.reviewsList}>
                {reviews.map(r => {
                  const displayName = r.user_display_name || r.user_email || 'Traveler';
                  return (
                    <div key={r.id} style={s.reviewCard}>
                      <div style={s.reviewHeader}>
                        <div style={s.reviewAvatar}>{displayName.charAt(0).toUpperCase()}</div>
                        <div style={s.reviewMeta}>
                          <h4 style={s.reviewUser}>{displayName}</h4>
                          <div style={s.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={s.reviewRating}>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" /> {parseFloat(r.rating).toFixed(1)}
                        </div>
                      </div>
                      {r.title && <h5 style={s.reviewTitle}>{r.title}</h5>}
                      <p style={s.reviewText}>{r.review_text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeUp">
            <h2 style={s.stepTitle}>Booking Details</h2>
            <p style={s.stepSub}>Fill in the details to start your inquiry.</p>
            
            <div style={s.formGroup}>
              <label style={s.label}>Travel Start Date</label>
              <input style={s.input} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Travelers</label>
              <div style={s.countBox}>
                 <div style={s.countLabel}>Adults (12+ yrs)</div>
                 <div style={s.countActions}>
                   <button style={s.countBtn} onClick={() => setAdults(Math.max(1, adults-1))}>-</button>
                   <span style={s.countVal}>{adults}</span>
                   <button style={s.countBtn} onClick={() => setAdults(adults+1)}>+</button>
                 </div>
              </div>
              <div style={s.countBox}>
                 <div style={s.countLabel}>Children (2-12 yrs)</div>
                 <div style={s.countActions}>
                   <button style={s.countBtn} onClick={() => setChildren(Math.max(0, children-1))}>-</button>
                   <span style={s.countVal}>{children}</span>
                   <button style={s.countBtn} onClick={() => setChildren(children+1)}>+</button>
                 </div>
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>WhatsApp Number</label>
              <input style={s.input} placeholder="+91 1234567890" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            {pkg.pricing && (
               <div style={s.summary}>
                 <h4 style={{fontSize: 14, fontWeight: 800, marginBottom: 10}}>Base Pricing</h4>
                 <div style={s.summaryRow}><span>Stay Cost</span><span>₹{pkg.pricing.stay_cost_total}</span></div>
                 <div style={s.summaryRow}><span>Transport & Fuel</span><span>₹{Number(pkg.pricing.transport_cost_total) + Number(pkg.pricing.fuel_cost)}</span></div>
                 <div style={s.summaryRow}><span>Food & Activities</span><span>₹{Number(pkg.pricing.food_cost_per_person) + Number(pkg.pricing.activity_cost_per_person)} / person</span></div>
                 <div style={{...s.summaryRow, borderTop:'1px dashed var(--border)', paddingTop:10, marginTop:10, fontWeight:800}}>
                   <span>Total Base Amount</span><span style={{color:'var(--primary)'}}>₹{totalPrice}</span>
                 </div>
               </div>
            )}
            
            {pkg.addons?.length > 0 && (
              <div style={{marginTop: 25}}>
                 <h4 style={{fontSize: 14, fontWeight: 800, marginBottom: 10}}>Available Add-ons</h4>
                 {pkg.addons.map(addon => (
                   <div key={addon.name} style={s.summaryRow}>
                      <span style={{color: 'var(--text-secondary)'}}><Shield size={12}/> {addon.name}</span>
                      <span style={{fontWeight: 700}}>+₹{addon.price}</span>
                   </div>
                 ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div style={s.success} className="animate-fadeUp">
             <div style={s.successCircle}><Check size={48} color="#fff" /></div>
             <h2 style={s.successTitle}>Inquiry Sent!</h2>
             <p style={s.successMsg}>We've received your booking inquiry for <b>{pkg.title}</b>. Our team will contact you on WhatsApp shortly.</p>
             <button style={s.doneBtn} onClick={() => navigate('/bookings')}>View My Bookings</button>
          </div>
        )}
      </main>

      {/* ── STICKY FOOTER ── */}
      {step < 3 && (
        <footer style={s.footer}>
          <div style={s.footerInner}>
            <div style={s.priceArea}>
              <span style={s.priceLabel}>Price starting from</span>
              <div style={s.priceBox}>
                <span style={s.priceMain}>₹{Number(pkg.price_per_person).toLocaleString()}</span>
                <span style={s.priceSub}>/person</span>
              </div>
            </div>
            {step === 1 ? (
              <button style={s.mainBtn} onClick={() => setStep(2)}>
                Check Availability <ChevronRight size={18} />
              </button>
            ) : (
              <button style={s.mainBtn} onClick={handleBook} disabled={!startDate || !phone}>
                Request Booking
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#fff' },
  hero: { height: 420, position: 'relative', overflow: 'hidden' },
  gallerySlider: { display: 'flex', overflowX: 'scroll', scrollSnapType: 'x mandatory', width: '100%', height: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' },
  slideItem: { minWidth: '100%', height: '100%', scrollSnapAlign: 'start' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' },
  heroNav: { position: 'absolute', top: 50, left: 0, right: 0, padding: '0 20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 },
  circleBtn: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' },
  indicators: { position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 },
  dot: { height: 6, borderRadius: 3, transition: 'all 0.3s' },

  content: { padding: '30px 20px 120px', maxWidth: 500, margin: '-40px auto 0', position: 'relative', zIndex: 20, background: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  badge: { display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.2 },
  metaRow: { display: 'flex', gap: 15, marginBottom: 25 },
  loc: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' },
  rating: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 },

  stats: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: 'var(--bg-page)', padding: 15, borderRadius: 20, marginBottom: 25 },
  statItem: { display: 'flex', alignItems: 'center', gap: 8 },
  statIcon: { width: 32, height: 32, borderRadius: 10, background: '#fff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 },
  statVal: { fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' },

  secTitle: { fontSize: 18, fontWeight: 800, margin: '30px 0 15px' },
  desc: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 },

  accCard: { background: 'var(--bg-page)', borderRadius: 20, padding: 12, display: 'flex', gap: 12, border: '1px solid var(--border)' },
  accImg: { width: 80, height: 80, borderRadius: 12, objectFit: 'cover' },
  accInfo: { flex: 1 },
  accName: { fontSize: 15, fontWeight: 800, margin: '0 0 4px' },
  accDesc: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 },
  accBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 },

  itinerary: { borderLeft: '2px dashed var(--border)', marginLeft: 10, paddingLeft: 25 },
  dayRow: { position: 'relative', marginBottom: 25 },
  dayCircle: { position: 'absolute', left: -36, top: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff' },
  dayTitle: { fontSize: 15, fontWeight: 800, margin: '0 0 5px' },
  dayTxt: { fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px' },
  dayBadge: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--primary)', fontWeight: 700 },

  incBox: { display: 'flex', flexDirection: 'column', gap: 15, background: 'var(--bg-page)', padding: 15, borderRadius: 16, border: '1px solid var(--border)' },
  incList: { display: 'flex', flexDirection: 'column', gap: 6 },
  incItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },

  // Booking Form
  stepTitle: { fontSize: 24, fontWeight: 900, marginBottom: 8 },
  stepSub: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 30 },
  formGroup: { marginBottom: 25 },
  label: { display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 10 },
  input: { width: '100%', background: 'var(--bg-page)', border: '1px solid var(--border)', padding: '14px 18px', borderRadius: 16, fontSize: 15 },
  countBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' },
  countLabel: { fontSize: 14, fontWeight: 600 },
  countActions: { display: 'flex', alignItems: 'center', gap: 15 },
  countBtn: { width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-page)', border: '1px solid var(--border)', fontSize: 20, fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  countVal: { fontSize: 16, fontWeight: 800, minWidth: 20, textAlign: 'center' },
  summary: { background: 'var(--bg-page)', padding: 20, borderRadius: 20, marginTop: 30 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 },

  // Success
  success: { textAlign: 'center', padding: '40px 0' },
  successCircle: { width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 8px 24px rgba(26,158,92,0.3)' },
  successTitle: { fontSize: 28, fontWeight: 900, margin: '0 0 15px' },
  successMsg: { fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 35 },
  doneBtn: { background: 'var(--text-primary)', color: '#fff', width: '100%', padding: '16px', borderRadius: 18, fontWeight: 700 },

  // Sticky Footer
  footer: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, background: '#fff', borderTop: '1px solid var(--border)', padding: '15px 20px 30px', zIndex: 1000 },
  footerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceArea: { display: 'flex', flexDirection: 'column' },
  priceLabel: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 },
  priceBox: { display: 'flex', alignItems: 'baseline', gap: 4 },
  priceMain: { fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' },
  priceSub: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 },
  mainBtn: { background: 'var(--primary)', color: '#fff', padding: '14px 24px', borderRadius: 16, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(26,158,92,0.25)' },

  loader: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' },
  
  // Reviews 
  reviewsList: { display: 'flex', flexDirection: 'column', gap: 15 },
  reviewCard: { background: 'var(--bg-page)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold' },
  reviewMeta: { flex: 1 },
  reviewUser: { fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' },
  reviewDate: { fontSize: 11, color: 'var(--text-muted)' },
  reviewRating: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 },
  reviewTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' },
  reviewText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 },
};