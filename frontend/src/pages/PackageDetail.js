// src/pages/PackageDetail.js — Reworked with Desktop View, Lucide Icons & Favorites
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Star, MapPin, Calendar, Users, 
  Clock, Shield, ChevronRight, 
  CheckCircle, Check, Info, Bell, User, Menu, X, PhoneCall, HelpCircle as HelpIcon
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
  
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
    if (!startDate) {
      alert("Please select a travel start date.");
      return;
    }
    if (!phone) {
      alert("Please enter your WhatsApp phone number.");
      return;
    }
    try {
      const payload = {
        adults,
        children,
        start_date: startDate,
        end_date: startDate,
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

  const totalPrice = (pkg?.price_per_person || 0) * adults;

  return (
    <div style={s.page}>
      <Helmet>
        <title>{`${pkg.title} (${pkg.days}D/${pkg.nights}N) | Tripik Travel`}</title>
        <meta name="description" content={pkg.description?.substring(0, 160) || `Book the ${pkg.title} tour package experience on Tripik.`} />
        <meta property="og:title" content={`${pkg.title} - ${pkg.days} Days / ${pkg.nights} Nights | Tripik`} />
        <meta property="og:description" content={pkg.description?.substring(0, 160)} />
        {pkg.banner_url && <meta property="og:image" content={pkg.banner_url} />}
        <meta property="og:type" content="product" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": pkg.title,
            "image": pkg.banner_url || "https://www.tripik.in/logo512.png",
            "description": pkg.description,
            "sku": `TRIPIK-PKG-${pkg.id}`,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": pkg.price_per_person,
              "availability": "https://schema.org/InStock",
              "url": window.location.href
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": pkg.avg_rating || 4.8,
              "reviewCount": pkg.total_reviews || 12
            }
          })}
        </script>
      </Helmet>

      {/* ── 1. TOP NAV HEADER ── */}
      <nav style={s.topNav}>
        <div className="desktop-header-nav main-nav-container" style={s.topNavInner}>
          <div className="mobile-only-left" style={s.navLeftArea}>
            <button style={s.circleBtnNav} onClick={() => navigate(-1)}>
              <ArrowLeft size={20} color="#0f172a" />
            </button>
          </div>

          <div className="nav-logo-area" style={s.logoAreaCenter} onClick={() => navigate('/')}>
            <h1 style={s.logoTextCenter}>
              Tri<span style={{ color: '#059669' }}>pik</span>
            </h1>
          </div>

          <nav className="desktop-nav-links">
            <Link to="/" className="desktop-nav-link">Home</Link>
            <Link to="/packages" className="desktop-nav-link active">Packages</Link>
            <Link to="/hidden-gems" className="desktop-nav-link">Hidden Gems</Link>
            <Link to="/bookings" className="desktop-nav-link">My Bookings</Link>
            <Link to="/favorites" className="desktop-nav-link">Favorites</Link>
          </nav>

          <div style={s.topActionsRight}>
            <Link to="/notifications" style={s.iconBtn} aria-label="Notifications" title="Notifications">
              <Bell size={24} color="#0f172a" strokeWidth={2.2} />
            </Link>
            <button onClick={() => navigate('/bookings')} style={s.avatarBtn} aria-label="My Account" title="My Account">
              <User size={24} color="#0f172a" strokeWidth={2.2} />
            </button>
            <button onClick={() => setIsMenuOpen(true)} style={s.barMenuBtn} aria-label="Menu" title="Menu">
              <Menu size={24} color="#0f172a" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO IMAGE GALLERY SLIDER ── */}
      <div className="package-detail-hero" style={s.hero}>
        <div style={s.gallerySlider} onScroll={e => {
            const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
            setActiveImg(index);
        }}>
          {/* Main Cover Image first */}
          <div style={s.slideItem}><img src={pkg.banner_url} alt={pkg.title} style={s.heroImg} /></div>
          {/* Gallery Images follow */}
          {pkg.gallery?.map((img, i) => (
            <div key={i} style={s.slideItem}><img src={img.url} alt={img.alt_text || pkg.title} style={s.heroImg} /></div>
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

        {/* Slider indicators */}
        <div style={s.indicators}>
           {[pkg.banner_url, ...(pkg.gallery || [])].map((_, i) => (
             <div key={i} style={{...s.dot, background: activeImg === i ? '#fff' : 'rgba(255,255,255,0.4)', width: activeImg === i ? 16 : 6}} />
           ))}
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER (2-Column Grid on Desktop) ── */}
      <main className="package-detail-container" style={s.content}>
        <div className="package-detail-grid">
          {/* Left Column: Details, Itinerary, Reviews */}
          <div className="package-detail-left">
            {step === 1 && (
              <div className="animate-fadeUp">
                <div style={s.badge}>Bestseller</div>
                <h1 style={s.title}>{pkg.title}</h1>
                <div style={s.metaRow}>
                  <div style={s.loc}><MapPin size={14} /> {pkg.to_location}</div>
                  <div style={s.rating}><Star size={14} fill="#f59e0b" color="#f59e0b" /> {Number(pkg.avg_rating || 5).toFixed(1)} ({pkg.total_reviews} reviews)</div>
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
                            <div style={{fontSize:14, fontWeight:700, color:'#0f172a'}}><Shield size={12} color="#059669"/> {addon.name}</div>
                            {addon.description && <div style={{fontSize:12, color:'#64748b'}}>{addon.description}</div>}
                          </div>
                          <div style={{fontSize:14, fontWeight:800, color:'#059669'}}>+₹{Number(addon.price)}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h3 style={s.secTitle}>Traveler Reviews</h3>
                {reviews.length === 0 ? (
                  <p style={{...s.desc, fontStyle: 'italic', color: '#64748b' }}>No reviews yet. Be the first to book and review!</p>
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
                     <div style={{...s.summaryRow, borderTop:'1px dashed #cbd5e1', paddingTop:10, marginTop:10, fontWeight:800}}>
                       <span>Total Base Amount</span><span style={{color:'#059669'}}>₹{totalPrice}</span>
                     </div>
                   </div>
                )}
                
                {pkg.addons?.length > 0 && (
                  <div style={{marginTop: 25}}>
                     <h4 style={{fontSize: 14, fontWeight: 800, marginBottom: 10}}>Available Add-ons</h4>
                     {pkg.addons.map(addon => (
                       <div key={addon.name} style={s.summaryRow}>
                          <span style={{color: '#64748b'}}><Shield size={12}/> {addon.name}</span>
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
          </div>

          {/* Right Column: Sticky Desktop Booking Card */}
          <div className="package-detail-sidebar">
            <div style={s.sidebarPriceHeader}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Starting from</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '4px 0 16px' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>₹{Number(pkg.price_per_person).toLocaleString()}</span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>/ person</span>
              </div>
            </div>

            {step < 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Travel Date</label>
                  <input style={s.input} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Number of Adults</label>
                  <div style={s.countBox}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Adults (12+ yrs)</span>
                    <div style={s.countActions}>
                      <button style={s.countBtn} onClick={() => setAdults(Math.max(1, adults-1))}>-</button>
                      <span style={s.countVal}>{adults}</span>
                      <button style={s.countBtn} onClick={() => setAdults(adults+1)}>+</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>WhatsApp Phone</label>
                  <input style={s.input} placeholder="+91 1234567890" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 6 }}>
                    <span>₹{pkg.price_per_person} × {adults} Adults</span>
                    <span style={{ fontWeight: 700 }}>₹{totalPrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: '#0f172a', paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                    <span>Estimated Total</span>
                    <span style={{ color: '#059669' }}>₹{totalPrice}</span>
                  </div>
                </div>

                <button 
                  style={{ 
                    ...s.mainBtn, 
                    width: '100%', 
                    justifyContent: 'center',
                    opacity: (!startDate || !phone) ? 0.6 : 1,
                    cursor: (!startDate || !phone) ? 'not-allowed' : 'pointer',
                  }} 
                  onClick={handleBook}
                  disabled={!startDate || !phone}
                >
                  Request Booking <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Need Help? Contact Tripik Support</span>
              <a href="mailto:tripikofficial@gmail.com" style={{ fontSize: 13, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>tripikofficial@gmail.com</a>
            </div>
          </div>
        </div>
      </main>

      {/* ── STICKY FOOTER (Mobile Only) ── */}
      {step < 3 && (
        <footer className="package-sticky-footer" style={s.footer}>
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

      {/* ── SIDE DRAWER MENU ── */}
      {isMenuOpen && (
        <div style={s.drawerOverlay} onClick={() => setIsMenuOpen(false)}>
          <div style={s.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div style={s.drawerHeader}>
              <div style={s.drawerLogo}>
                Tri<span style={{ color: '#059669' }}>pik</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} style={s.closeDrawerBtn}>
                <X size={20} color="#0f172a" />
              </button>
            </div>

            <div style={s.drawerList}>
              <button onClick={() => { setIsMenuOpen(false); setInfoModal('about'); }} style={s.drawerItem}>
                <div style={s.drawerIconWrap}><Info size={18} color="#059669" /></div>
                <span style={s.drawerItemText}>About Tripik</span>
              </button>
              <button onClick={() => { setIsMenuOpen(false); setInfoModal('contact'); }} style={s.drawerItem}>
                <div style={s.drawerIconWrap}><PhoneCall size={18} color="#059669" /></div>
                <span style={s.drawerItemText}>Contact Us</span>
              </button>
              <button onClick={() => { setIsMenuOpen(false); navigate('/#faq-section'); }} style={s.drawerItem}>
                <div style={s.drawerIconWrap}><HelpIcon size={18} color="#059669" /></div>
                <span style={s.drawerItemText}>FAQs</span>
              </button>
              <button onClick={() => { setIsMenuOpen(false); setInfoModal('safety'); }} style={s.drawerItem}>
                <div style={s.drawerIconWrap}><Shield size={18} color="#059669" /></div>
                <span style={s.drawerItemText}>Safety & Trust</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INFO MODALS ── */}
      {infoModal && (
        <div style={s.modalOverlay} onClick={() => setInfoModal(null)}>
          <div style={s.infoModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalCardHeader}>
              <h3 style={s.modalCardTitle}>
                {infoModal === 'about' && 'About Tripik'}
                {infoModal === 'contact' && 'Contact Us'}
                {infoModal === 'safety' && 'Safety & Trust'}
              </h3>
              <button onClick={() => setInfoModal(null)} style={s.closeModalBtn}>
                <X size={20} color="#0f172a" />
              </button>
            </div>
            <div style={s.modalCardBody}>
              {infoModal === 'about' && (
                <p style={{ margin: 0, lineHeight: 1.6, color: '#334155' }}>
                  <strong>Tripik</strong> is India's premier travel experience platform organizing handpicked group departures, customized private tours, and unexplored hidden gem destinations.
                </p>
              )}
              {infoModal === 'contact' && (
                <div>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Official Email</span>
                  <a href="mailto:tripikofficial@gmail.com" style={{ fontSize: 14, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>tripikofficial@gmail.com</a>
                </div>
              )}
              {infoModal === 'safety' && (
                <p style={{ margin: 0, lineHeight: 1.6, color: '#334155' }}>
                  🛡️ Verified tour leaders, 24/7 support & female-friendly solo travel safety guidelines.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SHARED BOTTOM NAVIGATION ── */}
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', paddingBottom: 0 },
  topNav: {
    position: 'sticky',
    top: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 100,
    borderBottom: '1px solid #e2e8f0',
  },
  topNavInner: {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  navLeftArea: {
    display: 'flex',
    alignItems: 'center',
  },
  circleBtnNav: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  logoAreaCenter: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  logoTextCenter: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  topActionsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginLeft: 'auto',
  },
  iconBtn: {
    position: 'relative',
    width: '36px',
    height: '36px',
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  avatarBtn: {
    width: '36px',
    height: '36px',
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  barMenuBtn: {
    width: '36px',
    height: '36px',
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Frosted Glass Floating Compact Menu
  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 2000,
    display: 'flex',
    justify: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: '65px',
    paddingRight: '16px',
  },
  drawerPanel: {
    width: '280px',
    height: 'auto',
    maxHeight: '420px',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 18px',
  },
  drawerHeader: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    marginBottom: '10px',
    borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
  },
  drawerLogo: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a',
  },
  closeDrawerBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  drawerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  drawerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '9px 12px',
    borderRadius: '14px',
    backgroundColor: 'rgba(248, 250, 252, 0.75)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  drawerIconWrap: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: 'rgba(236, 253, 245, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemText: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0f172a',
  },

  // Info Modals
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 2100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  infoModalCard: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  modalCardHeader: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modalCardTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  modalCardBody: {
    padding: '20px 24px',
  },

  hero: { height: 420, position: 'relative', overflow: 'hidden' },
  gallerySlider: { display: 'flex', overflowX: 'scroll', scrollSnapType: 'x mandatory', width: '100%', height: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' },
  slideItem: { minWidth: '100%', height: '100%', scrollSnapAlign: 'start' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' },
  heroNav: { position: 'absolute', top: 20, left: 0, right: 0, padding: '0 20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 },
  circleBtn: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' },
  indicators: { position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 },
  dot: { height: 6, borderRadius: 3, transition: 'all 0.3s' },

  content: { padding: '30px 20px 60px', maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 20, background: '#fff' },
  badge: { display: 'inline-block', background: '#ecfdf5', color: '#059669', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.2 },
  metaRow: { display: 'flex', gap: 15, marginBottom: 25 },
  loc: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' },
  rating: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#0f172a', fontWeight: 600 },

  stats: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: '#f8fafc', padding: 15, borderRadius: 20, marginBottom: 25 },
  statItem: { display: 'flex', alignItems: 'center', gap: 8 },
  statIcon: { width: 32, height: 32, borderRadius: 10, background: '#fff', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, color: '#64748b', fontWeight: 600 },
  statVal: { fontSize: 12, fontWeight: 800, color: '#0f172a' },

  secTitle: { fontSize: 18, fontWeight: 800, margin: '30px 0 15px', color: '#0f172a' },
  desc: { fontSize: 14, color: '#334155', lineHeight: 1.6 },

  itinerary: { borderLeft: '2px dashed #cbd5e1', marginLeft: 10, paddingLeft: 25 },
  dayRow: { position: 'relative', marginBottom: 25 },
  dayCircle: { position: 'absolute', left: -36, top: 0, width: 22, height: 22, borderRadius: '50%', background: '#059669', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff' },
  dayTitle: { fontSize: 15, fontWeight: 800, margin: '0 0 5px', color: '#0f172a' },
  dayTxt: { fontSize: 13, color: '#475569', margin: '0 0 8px' },
  dayBadge: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#059669', fontWeight: 700 },

  incBox: { display: 'flex', flexDirection: 'column', gap: 15, background: '#f8fafc', padding: 15, borderRadius: 16, border: '1px solid #e2e8f0' },
  incList: { display: 'flex', flexDirection: 'column', gap: 6 },
  incItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: '#475569' },

  // Booking Form
  stepTitle: { fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#0f172a' },
  stepSub: { fontSize: 14, color: '#64748b', marginBottom: 30 },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#0f172a' },
  input: { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: 14, fontSize: 14, color: '#0f172a', outline: 'none' },
  countBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' },
  countLabel: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  countActions: { display: 'flex', alignItems: 'center', gap: 12 },
  countBtn: { width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  countVal: { fontSize: 15, fontWeight: 800, minWidth: 20, textAlign: 'center', color: '#0f172a' },
  summary: { background: '#f8fafc', padding: 16, borderRadius: 16, marginTop: 20 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: '#475569' },

  // Success
  success: { textAlign: 'center', padding: '40px 0' },
  successCircle: { width: 80, height: 80, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 8px 24px rgba(5,150,105,0.3)' },
  successTitle: { fontSize: 28, fontWeight: 900, margin: '0 0 15px', color: '#0f172a' },
  successMsg: { fontSize: 15, color: '#64748b', lineHeight: 1.6, marginBottom: 35 },
  doneBtn: { background: '#0f172a', color: '#fff', width: '100%', padding: '16px', borderRadius: 18, fontWeight: 700, border: 'none', cursor: 'pointer' },

  // Sticky Footer
  footer: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, background: '#fff', borderTop: '1px solid #e2e8f0', padding: '12px 20px 20px', zIndex: 1000 },
  footerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceArea: { display: 'flex', flexDirection: 'column' },
  priceLabel: { fontSize: 11, color: '#64748b', fontWeight: 600 },
  priceBox: { display: 'flex', alignItems: 'baseline', gap: 4 },
  priceMain: { fontSize: 22, fontWeight: 900, color: '#0f172a' },
  priceSub: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  mainBtn: { background: '#059669', color: '#fff', padding: '12px 22px', borderRadius: 14, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(5,150,105,0.25)' },

  loader: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#64748b' },
  
  // Reviews 
  reviewsList: { display: 'flex', flexDirection: 'column', gap: 15 },
  reviewCard: { background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid #e2e8f0' },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold' },
  reviewMeta: { flex: 1 },
  reviewUser: { fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' },
  reviewDate: { fontSize: 11, color: '#64748b' },
  reviewRating: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 },
  reviewTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' },
  reviewText: { fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 },
};