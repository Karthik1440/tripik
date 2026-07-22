// src/pages/Home.js — Redesigned matching reference UI
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Bell, MapPin, Star, Heart, SlidersHorizontal, ArrowRight,
  Compass, Mountain, Sun, Bike, Landmark, MoreHorizontal, ShieldCheck,
  Headphones, Award, Tag, Sparkles, Navigation, Users, Shield, CheckCircle, User,
  BookOpen, Clock, X, ChevronDown, ChevronUp, Menu, PhoneCall, Info, HelpCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNotifications } from '../context/NotificationContext';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { unreadCount } = useNotifications();

  const [packages, setPackages] = useState([]);
  const [banners, setBanners] = useState([]);
  const [secBanner, setSecBanner] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    if (user === undefined) return;
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (user === undefined) return;
    fetchPackages();
  }, [selectedCat, user]);

  const getCategoryIcon = (catObj) => {
    if (catObj.image_url) {
      return (
        <img
          src={catObj.image_url}
          alt={catObj.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
        />
      );
    }
    const name = (catObj.icon || catObj.name || '').toLowerCase();
    if (name.includes('mountain') || name.includes('ladakh') || name.includes('himachal') || name.includes('kashmir')) return <Mountain size={22} />;
    if (name.includes('beach') || name.includes('sun')) return <Sun size={22} />;
    if (name.includes('adventure') || name.includes('bike')) return <Bike size={22} />;
    if (name.includes('heritage') || name.includes('landmark')) return <Landmark size={22} />;
    return <Compass size={22} />;
  };

  const fetchInitialData = async () => {
    try {
      const [bRes, cRes, sRes, blogRes, faqRes] = await Promise.all([
        api.get('/trips/banners/'),
        api.get('/trips/categories/'),
        api.get('/trips/secondary-banner/'),
        api.get('/trips/blogs/'),
        api.get('/trips/faqs/'),
      ]);
      setBanners(bRes.data);
      setDbCategories(cRes.data || []);
      if (sRes.data) setSecBanner(sRes.data);
      if (blogRes.data) setBlogs(blogRes.data);
      if (faqRes.data) setFaqs(faqRes.data);
      fetchPackages();
    } catch (e) {
      console.error(e);
    }
  };

  const categories = [
    { name: 'All', icon: <Compass size={18} /> },
    ...dbCategories.map(c => ({
      name: c.name,
      slug: c.slug,
      icon: getCategoryIcon(c),
      imageUrl: c.image_url,
    })),
    { name: 'More', icon: <MoreHorizontal size={18} /> },
  ];

  const fetchPackages = async () => {
    setLoading(true);
    try {
      let url = '/trips/packages/';
      if (selectedCat && selectedCat !== 'All' && selectedCat !== 'More') {
        url += `?category=${encodeURIComponent(selectedCat)}`;
      }
      const res = await api.get(url);
      setPackages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = packages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.to_location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.page}>
      <Helmet>
        <title>Tripik | Handpicked Group Departures & Hidden Gem Travel Packages</title>
        <meta name="description" content="Discover handpicked group departures, customized private tours, and secret hidden gem destinations across India. Book Kashmir, Kerala, Ladakh & Himachal packages." />
        <meta name="keywords" content="Tripik, Kashmir group departures, Kerala tour packages, hidden gem destinations, Himachal trips, Ladakh bike tour" />
        <meta property="og:title" content="Tripik | Handpicked Group Departures & Hidden Gem Travel Packages" />
        <meta property="og:description" content="Handpicked group departures, customized private tours, and secret hidden gem destinations across India." />
        <meta property="og:image" content="https://www.tripik.in/logo512.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Tripik Travel",
            "url": "https://www.tripik.in",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.tripik.in/packages?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* ── 1. TOP NAV HEADER ── */}
      <nav style={s.topNav}>
        <div className="desktop-header-nav main-nav-container" style={s.topNavInner}>
          {/* Brand Logo */}
          <div className="nav-logo-area" style={s.logoAreaCenter} onClick={() => navigate('/')}>
            <h1 style={s.logoTextCenter}>
              Tri<span style={{ color: '#059669' }}>pik</span>
            </h1>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="desktop-nav-links">
            <Link to="/" className="desktop-nav-link active">Home</Link>
            <Link to="/packages" className="desktop-nav-link">Packages</Link>
            <Link to="/hidden-gems" className="desktop-nav-link">Hidden Gems</Link>
            <Link to="/bookings" className="desktop-nav-link">My Bookings</Link>
            <Link to="/favorites" className="desktop-nav-link">Favorites</Link>
          </nav>

          {/* Right Action Buttons: Bell + Profile User Icon + 3-Bar Menu */}
          <div style={s.topActionsRight}>
            <Link to="/notifications" style={s.iconBtn} aria-label="Notifications" title="Notifications">
              <Bell size={24} color="#0f172a" strokeWidth={2.2} />
              {unreadCount > 0 && <span style={s.notifBadge}>{unreadCount}</span>}
            </Link>
            
            {/* User Profile Avatar Icon Button */}
            <button
              onClick={() => navigate('/bookings')}
              style={s.avatarBtn}
              aria-label="My Account / Bookings"
              title="My Account"
            >
              <User size={24} color="#0f172a" strokeWidth={2.2} />
            </button>

            {/* Right Bar Menu Icon Button (Pure 3-Bar Icon) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              style={s.barMenuBtn}
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu size={24} color="#0f172a" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </nav>

      <main className="desktop-app-container" style={s.mainContainer}>
        {/* ── 2. HERO BANNER SLIDER ── */}
        <section style={s.bannerWrap}>
          <div
            style={s.bannerSlider}
            onScroll={(e) => {
              const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
              setActiveBanner(index);
            }}
          >
            {banners.length > 0 ? (
              banners.map((b) => (
                <div key={b.id} style={s.bannerItem}>
                  <img src={b.image_url} alt={b.title} style={s.bannerImg} />
                  <div style={s.bannerOverlay}>
                    <span style={s.cursiveSubtitle}>Escape to</span>
                    <h3 style={s.bannerTitle}>{b.title}</h3>
                    <p style={s.bannerSub}>{b.subtitle || 'Unexplored places. Unforgettable memories.'}</p>
                    <button onClick={() => navigate('/hidden-gems')} style={s.exploreBtn}>
                      <span>Explore Now</span> <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={s.bannerItem}>
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200"
                  alt="Hidden Paradise"
                  style={s.bannerImg}
                />
                <div style={s.bannerOverlay}>
                  <span style={s.cursiveSubtitle}>Escape to</span>
                  <h3 style={s.bannerTitle}>Hidden Paradise</h3>
                  <p style={s.bannerSub}>Unexplored places. Unforgettable memories.</p>
                  <button onClick={() => navigate('/hidden-gems')} style={s.exploreBtn}>
                    <span>Explore Now</span> <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features Bar Overlay */}
          <div style={s.featuresBar}>
            <div style={s.featureItem}>
              <Award size={14} color="#059669" />
              <span>Best Prices</span>
            </div>
            <div style={s.divider} />
            <div style={s.featureItem}>
              <ShieldCheck size={14} color="#059669" />
              <span>Secure Booking</span>
            </div>
            <div style={s.divider} />
            <div style={s.featureItem}>
              <Headphones size={14} color="#059669" />
              <span>24/7 Support</span>
            </div>
          </div>

          {/* Banner Dots */}
          <div style={s.bannerDots}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  ...s.dot,
                  background: activeBanner === i ? '#059669' : 'rgba(255,255,255,0.5)',
                  width: activeBanner === i ? '16px' : '6px',
                  borderRadius: '10px',
                }}
              />
            ))}
          </div>
        </section>

        {/* ── 3. SEARCH & DESTINATION HEADING ── */}
        <section style={s.searchSection}>
          <div style={s.searchHeader}>
            <h2 style={s.heroTitle}>
              Where do you <br />
              <span style={{ color: '#059669' }}>want to go?</span>
            </h2>
          </div>

          <div style={s.searchBar}>
            <Search size={20} color="#64748b" />
            <input
              style={s.searchInput}
              placeholder="Search destinations, places, activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button style={s.filterBtn} aria-label="Filter">
              <SlidersHorizontal size={18} color="#ffffff" />
            </button>
          </div>
        </section>

        {/* ── 4. CATEGORIES ROW ── */}
        <section style={s.catBar}>
          {categories.map((cat) => {
            const active = selectedCat === cat.name;
            const hasImg = !!cat.imageUrl;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  if (cat.name === 'More') {
                    navigate('/packages');
                  } else {
                    setSelectedCat(cat.name);
                  }
                }}
                style={{
                  ...s.catCard,
                  ...(active ? s.catCardActive : {}),
                  ...(hasImg ? {
                    backgroundImage: `url(${cat.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderColor: active ? '#059669' : '#e2e8f0',
                    borderWidth: active ? '2px' : '1px',
                    padding: 0,
                  } : {}),
                }}
              >
                {hasImg ? (
                  <div style={s.catCardImgOverlay}>
                    <span style={s.catNameOverlay}>{cat.name}</span>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        ...s.catIconWrap,
                        backgroundColor: active ? '#059669' : '#ffffff',
                        color: active ? '#ffffff' : '#059669',
                      }}
                    >
                      {cat.icon}
                    </div>
                    <span style={s.catName}>{cat.name}</span>
                  </>
                )}
              </button>
            );
          })}
        </section>

        {/* ── 5. POPULAR DESTINATIONS ── */}
        <section style={s.sectionWrap}>
          <div style={s.sectionHead}>
            <h3 style={s.sectionTitle}>Popular Destinations</h3>
            <Link to="/packages" style={s.seeAllLink}>
              See all
            </Link>
          </div>

          {loading ? (
            <div style={s.loadingBox}>
              <div style={s.spinner} />
            </div>
          ) : (
            <div className="desktop-dest-grid" style={s.destHorizontalScroll}>
              {filtered.map((pkg) => {
                const fav = isFavorite(pkg.id);
                return (
                  <article
                    key={pkg.id}
                    className="desktop-dest-card"
                    style={s.destCard}
                    onClick={() => navigate(`/package/${pkg.id}`)}
                  >
                    <div style={s.destImgWrap}>
                      <img
                        src={pkg.banner_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'}
                        alt={pkg.title}
                        style={s.destImg}
                      />

                      {/* Duration Badge */}
                      <div style={s.durationBadge}>
                        <span>
                          {pkg.days}D / {pkg.nights}N
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(pkg);
                        }}
                        style={{
                          ...s.favBtn,
                          background: fav ? '#ef4444' : 'rgba(15, 23, 42, 0.4)',
                        }}
                      >
                        <Heart size={16} color="#ffffff" fill={fav ? '#ffffff' : 'none'} />
                      </button>

                      {/* Card Overlay Text */}
                      <div style={s.destCardOverlay}>
                        <h4 style={s.destTitle}>{pkg.title}</h4>
                        <div style={s.destMetaRow}>
                          <span style={s.destCatName}>{pkg.category_name || pkg.to_location}</span>
                          <div style={s.destRating}>
                            <Star size={13} color="#f59e0b" fill="#f59e0b" />
                            <span>{pkg.avg_rating || '4.7'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 6. EXCLUSIVE DEALS BANNER ── */}
        <section style={s.dealsCard}>
          <div style={s.dealsContent}>
            <h3 style={s.dealsTitle}>Exclusive Deals</h3>
            <p style={s.dealsSub}>Upto 40% off on selected packages</p>
            <button onClick={() => navigate('/packages')} style={s.viewDealsBtn}>
              <span>View Deals</span> <ArrowRight size={14} />
            </button>
          </div>

          <div style={s.dealsGraphic}>
            <div style={s.percentBadge}>%</div>
            <Sparkles size={32} color="#a7f3d0" />
          </div>
        </section>

        {/* ── 7. WHY TRIPIK TRUST BAR ── */}
        <section style={s.trustSection}>
          <h3 style={s.trustTitle}>Why Tripik?</h3>
          <div style={s.trustGrid}>
            <div style={s.trustItem}>
              <div style={s.trustIconCircle}>
                <Compass size={18} color="#059669" />
              </div>
              <span style={s.trustLabel}>Handpicked Experiences</span>
            </div>

            <div style={s.trustItem}>
              <div style={s.trustIconCircle}>
                <Users size={18} color="#059669" />
              </div>
              <span style={s.trustLabel}>Trusted by Travelers</span>
            </div>

            <div style={s.trustItem}>
              <div style={s.trustIconCircle}>
                <ShieldCheck size={18} color="#059669" />
              </div>
              <span style={s.trustLabel}>Easy & Secure Booking</span>
            </div>

            <div style={s.trustItem}>
              <div style={s.trustIconCircle}>
                <Tag size={18} color="#059669" />
              </div>
              <span style={s.trustLabel}>Best Price Guaranteed</span>
            </div>
          </div>
        </section>

        {/* ── 8. BANNER 2 SECTION (Under Why Tripik — Edge-to-Edge, No Curve) ── */}
        <section className="desktop-banner2-wrap" style={s.banner2Wrap}>
          <div
            className="desktop-banner2-card"
            style={{
              ...s.banner2Card,
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.7) 100%), url("${secBanner?.image_url || 'https://ik.imagekit.io/lblrrddgd/banners/kashmir_cover.jpg'}")`,
            }}
          >
            <div style={s.banner2Content}>
              <h2 style={s.banner2Title}>
                {secBanner?.title || 'Solo, Couple Or Friends — We Have Trips for All'}
              </h2>
              <p style={s.banner2Subtitle}>
                {secBanner?.subtitle || "Most travellers don't just travel with us, they meet strangers who quickly turn into their people."}
              </p>
              <button
                onClick={() => navigate(secBanner?.link_to || '/packages')}
                style={s.banner2CtaBtn}
              >
                <span>{secBanner?.button_text || 'Explore Trips'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── 9. BLOGS SECTION (Under Banner 2 — Admin Managed) ── */}
        {blogs.length > 0 && (
          <section style={s.blogSection}>
            <div style={s.blogHeader}>
              <div>
                <div style={s.blogBadge}>
                  <BookOpen size={13} color="#059669" />
                  <span>TRAVEL STORIES</span>
                </div>
                <h2 style={s.blogSectionTitle}>Guides & Inspiration</h2>
              </div>
            </div>

            <div className="desktop-blog-grid" style={s.blogGrid}>
              {blogs.map((b) => (
                <div
                  key={b.id}
                  className="desktop-blog-card"
                  onClick={() => setSelectedBlog(b)}
                  style={s.blogCard}
                >
                  <div style={s.blogImgWrap}>
                    <img
                      src={b.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'}
                      alt={b.title}
                      style={s.blogImg}
                    />
                    <span style={s.blogCategoryTag}>{b.category}</span>
                  </div>
                  <div style={s.blogCardBody}>
                    <div style={s.blogMetaRow}>
                      <span style={s.blogReadTime}>
                        <Clock size={12} color="#059669" />
                        {b.read_time}
                      </span>
                      <span style={s.blogAuthor}>{b.author_name}</span>
                    </div>
                    <h3 style={s.blogTitle}>{b.title}</h3>
                    <p style={s.blogExcerpt}>{b.excerpt}</p>
                    <div style={s.blogReadMoreLink}>
                      <span>Read Full Story</span>
                      <ArrowRight size={14} color="#059669" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── BLOG MODAL POPUP ── */}
        {selectedBlog && (
          <div style={s.blogModalOverlay} onClick={() => setSelectedBlog(null)}>
            <div style={s.blogModalCard} onClick={(e) => e.stopPropagation()}>
              <button style={s.blogModalCloseBtn} onClick={() => setSelectedBlog(null)}>
                <X size={18} color="#0f172a" />
              </button>
              <div style={s.blogModalHeaderImgWrap}>
                <img
                  src={selectedBlog.image_url}
                  alt={selectedBlog.title}
                  style={s.blogModalHeaderImg}
                />
                <span style={s.blogCategoryTagModal}>{selectedBlog.category}</span>
              </div>
              <div style={s.blogModalBody}>
                <div style={s.blogMetaRowModal}>
                  <span style={s.blogReadTime}>
                    <Clock size={13} color="#059669" />
                    {selectedBlog.read_time}
                  </span>
                  <span style={s.blogAuthor}>By {selectedBlog.author_name}</span>
                </div>
                <h2 style={s.blogModalTitle}>{selectedBlog.title}</h2>
                <div style={s.blogModalContentText}>
                  {selectedBlog.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} style={s.blogParagraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 10. FAQ ACCORDION SECTION (Under Blogs — Admin Managed) ── */}
        {faqs.length > 0 && (
          <section id="faq-section" style={s.faqWrap}>
            <div style={s.faqCard}>
              <h2 style={s.faqTitle}>Frequently Asked Questions</h2>
              <div style={s.faqList}>
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqId === faq.id;
                  const isLast = idx === faqs.length - 1;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        ...s.faqItem,
                        borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
                      }}
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        style={s.faqQuestionBtn}
                      >
                        <span style={s.faqQuestionText}>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp size={18} color="#0f172a" />
                        ) : (
                          <ChevronDown size={18} color="#64748b" />
                        )}
                      </button>
                      {isOpen && (
                        <div style={s.faqAnswerBox}>
                          <p style={s.faqAnswerText}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── SIDE DRAWER MENU (Right Bar Icon Trigger) ── */}
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
              <button
                onClick={() => { setIsMenuOpen(false); setInfoModal('about'); }}
                style={s.drawerItem}
              >
                <div style={s.drawerIconWrap}>
                  <Info size={18} color="#059669" />
                </div>
                <span style={s.drawerItemText}>About Tripik</span>
              </button>

              <button
                onClick={() => { setIsMenuOpen(false); setInfoModal('contact'); }}
                style={s.drawerItem}
              >
                <div style={s.drawerIconWrap}>
                  <PhoneCall size={18} color="#059669" />
                </div>
                <span style={s.drawerItemText}>Contact Us</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  const faqElem = document.getElementById('faq-section');
                  if (faqElem) {
                    faqElem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setInfoModal('faqs');
                  }
                }}
                style={s.drawerItem}
              >
                <div style={s.drawerIconWrap}>
                  <HelpCircle size={18} color="#059669" />
                </div>
                <span style={s.drawerItemText}>FAQs</span>
              </button>

              <button
                onClick={() => { setIsMenuOpen(false); setInfoModal('safety'); }}
                style={s.drawerItem}
              >
                <div style={s.drawerIconWrap}>
                  <ShieldCheck size={18} color="#059669" />
                </div>
                <span style={s.drawerItemText}>Safety & Trust</span>
              </button>
            </div>

            <div style={s.drawerFooter}>
              <p style={s.drawerFooterTag}>Discover Your Next Unexplored Adventure</p>
              <span style={s.drawerEmail}>tripikofficial@gmail.com</span>
            </div>
          </div>
        </div>
      )}

      {/* ── INFO MODALS (About, Contact, Safety, FAQs) ── */}
      {infoModal && (
        <div style={s.modalOverlay} onClick={() => setInfoModal(null)}>
          <div style={s.infoModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalCardHeader}>
              <h3 style={s.modalCardTitle}>
                {infoModal === 'about' && 'About Tripik'}
                {infoModal === 'contact' && 'Contact Us'}
                {infoModal === 'safety' && 'Safety & Trust'}
                {infoModal === 'faqs' && 'Frequently Asked Questions'}
              </h3>
              <button onClick={() => setInfoModal(null)} style={s.closeModalBtn}>
                <X size={20} color="#0f172a" />
              </button>
            </div>

            <div style={s.modalCardBody}>
              {infoModal === 'about' && (
                <div style={s.infoTextContent}>
                  <p style={{ margin: '0 0 12px', lineHeight: 1.6, color: '#334155' }}>
                    <strong>Tripik</strong> is India's premier travel experience platform organizing handpicked group departures, customized private tours, and unexplored hidden gem destinations.
                  </p>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#059669', fontWeight: '700' }}>
                    "Most travellers don't just travel with us, they meet strangers who quickly turn into their people."
                  </p>
                </div>
              )}

              {infoModal === 'contact' && (
                <div style={s.infoTextContent}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Official Email</span>
                    <a href="mailto:tripikofficial@gmail.com" style={{ fontSize: 14, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>tripikofficial@gmail.com</a>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Official Instagram</span>
                    <a href="https://www.instagram.com/tripikofficial?igsh=d3o5a3FrYThnamd5" target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>@tripikofficial</a>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Headquarters</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Kochi, Kerala & Kashmir, India</span>
                  </div>
                </div>
              )}

              {infoModal === 'safety' && (
                <div style={s.infoTextContent}>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#059669' }}>
                    🛡️ 100% Verified Trips & Female-Friendly Protocols
                  </p>
                  <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, color: '#475569', fontSize: 13.5 }}>
                    <li>Experienced verified tour leaders on every departure.</li>
                    <li>24/7 emergency support team.</li>
                    <li>Vetted accommodations & AC transport.</li>
                    <li>Female solo traveler protection guidelines.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER (Desktop & Mobile) ── */}
      <Footer />

      {/* ── 11. SHARED BOTTOM NAVIGATION ── */}
      <BottomNav />
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    color: '#0f172a',
    paddingBottom: 0,
  },
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  navLeftArea: {
    display: 'flex',
    alignItems: 'center',
  },
  logoAreaCenter: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  logoTextCenter: {
    fontSize: '22px',
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

  // Transparent Frosted Glass Floating Compact Menu
  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'flex-end',
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
    justifyContent: 'space-between',
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
  drawerFooter: {
    paddingTop: '10px',
    marginTop: '8px',
    borderTop: '1px solid rgba(226, 232, 240, 0.7)',
  },
  drawerFooterTag: {
    fontSize: '11px',
    color: '#64748b',
    margin: '0 0 2px 0',
  },
  drawerEmail: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#059669',
  },

  // Modal Dialogs
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
    justifyContent: 'space-between',
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
  infoTextContent: {
    fontSize: '14px',
    color: '#334155',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
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
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '16px',
    height: '16px',
    background: '#059669',
    color: '#fff',
    fontSize: '10px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    border: '2px solid #fff',
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
  mainContainer: {
    maxWidth: 500,
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  // Hero Banner (Touch both sides, Edge-to-Edge)
  bannerWrap: {
    position: 'relative',
    borderRadius: '0px',
    overflow: 'hidden',
    marginLeft: '-20px',
    marginRight: '-20px',
    marginTop: '-16px',
    width: 'calc(100% + 40px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  bannerSlider: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
  },
  bannerItem: {
    flex: '0 0 100%',
    scrollSnapAlign: 'start',
    position: 'relative',
    height: '255px',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    color: '#ffffff',
  },
  cursiveSubtitle: {
    fontFamily: "'Caveat', cursive",
    fontSize: '26px',
    color: '#34d399',
    lineHeight: '1.2',
    marginBottom: '6px',
    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
  },
  bannerTitle: {
    fontSize: '22px',
    fontWeight: '800',
    lineHeight: '1.25',
    margin: '0 0 6px 0',
    textShadow: '0 2px 6px rgba(0,0,0,0.7)',
    maxWidth: '85%',
  },
  bannerSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.85)',
    margin: '0 0 14px 0',
  },
  exploreBtn: {
    alignSelf: 'flex-start',
    background: '#059669',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
  },
  featuresBar: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    right: '12px',
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
    borderRadius: '14px',
    padding: '8px 12px',
    display: 'none', // Shown on larger views
    justifyContent: 'space-around',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff',
  },
  divider: {
    width: '1px',
    height: '12px',
    background: 'rgba(255,255,255,0.2)',
  },
  bannerDots: {
    position: 'absolute',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    zIndex: 10,
  },
  dot: {
    height: '6px',
    transition: 'all 0.3s',
  },

  // Search Section
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  searchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
    lineHeight: '1.2',
  },
  nearbyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#ecfdf5',
    color: '#059669',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12.5px',
    fontWeight: '700',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff',
    padding: '8px 8px 8px 16px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
  },
  searchInput: {
    border: 'none',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    color: '#0f172a',
  },
  filterBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)',
  },

  // Categories
  catBar: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
    scrollbarWidth: 'none',
  },
  catCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: '22px',
    padding: '12px 14px',
    minWidth: '105px',
    height: '105px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  catCardActive: {
    borderColor: '#059669',
    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.25)',
  },
  catCardImgOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '10px 6px',
    borderRadius: '22px',
    width: '100%',
    height: '100%',
  },
  catNameOverlay: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#ffffff',
    textShadow: '0 1px 4px rgba(0,0,0,0.9)',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '95px',
  },
  catIconWrap: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    border: '1px solid #e2e8f0',
  },
  catName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },

  // Popular Destinations Section
  sectionWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '900',
    margin: 0,
    color: '#0f172a',
  },
  seeAllLink: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#059669',
    textDecoration: 'none',
  },
  destHorizontalScroll: {
    display: 'flex',
    gap: '14px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    paddingBottom: '8px',
    marginLeft: '-20px',
    marginRight: '-20px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  destCard: {
    flex: '0 0 240px',
    minWidth: '240px',
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    scrollSnapAlign: 'start',
  },
  destImgWrap: {
    position: 'relative',
    height: '280px',
    width: '100%',
  },
  destImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    background: '#059669',
    color: '#ffffff',
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '800',
  },
  favBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    border: 'none',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  destCardOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.88) 100%)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    color: '#ffffff',
  },
  destTitle: {
    fontSize: '17px',
    fontWeight: '800',
    margin: '0 0 6px 0',
    lineHeight: '1.25',
  },
  destMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destCatName: {
    fontSize: '12px',
    opacity: 0.85,
    fontWeight: '600',
  },
  destRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '12px',
    fontWeight: '800',
  },

  // Deals Card
  dealsCard: {
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)',
    borderRadius: '24px',
    padding: '22px',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 12px 30px -10px rgba(4, 120, 87, 0.35)',
    position: 'relative',
    overflow: 'hidden',
  },
  dealsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 2,
  },
  dealsTitle: {
    fontSize: '20px',
    fontWeight: '900',
    margin: 0,
  },
  dealsSub: {
    fontSize: '13px',
    opacity: 0.9,
    margin: '0 0 12px 0',
  },
  viewDealsBtn: {
    alignSelf: 'flex-start',
    background: '#ffffff',
    color: '#064e3b',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    border: 'none',
  },
  dealsGraphic: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  percentBadge: {
    fontSize: '48px',
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.25)',
    position: 'absolute',
    right: '-10px',
    bottom: '-10px',
  },

  // Why Tripik Trust Section
  trustSection: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  trustTitle: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 16px 0',
  },
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  trustIconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  trustLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    lineHeight: '1.3',
  },

  // Banner 2 (Under Why Tripik — Edge to Edge, No Curve)
  banner2Wrap: {
    marginTop: '10px',
    marginLeft: '-20px',
    marginRight: '-20px',
    width: 'calc(100% + 40px)',
  },
  banner2Card: {
    position: 'relative',
    borderRadius: '0px',
    padding: '36px 20px',
    backgroundColor: '#059669',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    border: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    textAlign: 'center',
  },
  banner2Visuals: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    opacity: 0.18,
  },
  hikersIllustration: {
    display: 'flex',
    alignItems: 'center',
  },
  planeIllustration: {
    display: 'flex',
    alignItems: 'center',
  },
  banner2Content: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '440px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  banner2Title: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: '1.3',
    margin: 0,
    letterSpacing: '-0.3px',
    textShadow: '0 2px 6px rgba(0,0,0,0.8)',
  },
  banner2Subtitle: {
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: '1.5',
    margin: 0,
    fontWeight: '500',
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },
  banner2CtaBtn: {
    marginTop: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#059669',
    color: '#ffffff',
    padding: '10px 22px',
    borderRadius: '24px',
    fontWeight: '700',
    fontSize: '13.5px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s',
  },

  // Blog Section (Under Banner 2 — Admin Managed)
  blogSection: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  blogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  blogBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '12px',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  blogSectionTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
  },
  blogGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '14px',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    paddingBottom: '8px',
    marginLeft: '-20px',
    marginRight: '-20px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  blogCard: {
    flex: '0 0 250px',
    minWidth: '250px',
    scrollSnapAlign: 'start',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s',
  },
  blogImgWrap: {
    position: 'relative',
    height: '125px',
    width: '100%',
    overflow: 'hidden',
  },
  blogImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  blogCategoryTag: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '8px',
    fontSize: '10.5px',
    fontWeight: '700',
  },
  blogCardBody: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
  },
  blogMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    fontSize: '11px',
    color: '#64748b',
  },
  blogReadTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#059669',
    fontWeight: '700',
  },
  blogAuthor: {
    fontWeight: '600',
    color: '#94a3b8',
  },
  blogTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.3',
    margin: '0 0 6px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  blogExcerpt: {
    fontSize: '11.5px',
    color: '#64748b',
    lineHeight: '1.4',
    margin: '0 0 10px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  blogReadMoreLink: {
    fontSize: '11.5px',
    fontWeight: '800',
    color: '#059669',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: 'auto',
  },

  // Modal Styles
  blogModalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  blogModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  blogModalCloseBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 10,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  },
  blogModalHeaderImgWrap: {
    position: 'relative',
    height: '200px',
    width: '100%',
  },
  blogModalHeaderImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  blogCategoryTagModal: {
    position: 'absolute',
    bottom: '12px',
    left: '16px',
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '800',
  },
  blogModalBody: {
    padding: '20px',
  },
  blogMetaRowModal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '12.5px',
    color: '#64748b',
  },
  blogModalTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 14px 0',
    lineHeight: '1.3',
  },
  blogModalContentText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  blogParagraph: {
    fontSize: '14px',
    color: '#334155',
    lineHeight: '1.6',
    margin: 0,
  },

  // FAQ Section (Under Blogs — Admin Managed)
  faqWrap: {
    marginTop: '6px',
  },
  faqCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '24px',
    padding: '24px 20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
  },
  faqTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 16px 0',
    letterSpacing: '-0.3px',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
  },
  faqItem: {
    padding: '14px 0',
  },
  faqQuestionBtn: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqQuestionText: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.4',
    paddingRight: '12px',
  },
  faqAnswerBox: {
    marginTop: '10px',
    paddingTop: '4px',
  },
  faqAnswerText: {
    fontSize: '13.5px',
    color: '#475569',
    lineHeight: '1.6',
    margin: 0,
  },

  loadingBox: {
    textAlign: 'center',
    padding: '30px',
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
};