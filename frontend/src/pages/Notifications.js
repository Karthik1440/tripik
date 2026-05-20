// src/pages/Notifications.js — Admin Announcements Page
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Info, Tag, Zap, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, markAllRead, clearAllNotifications, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications(); // Force fresh fetch the instant the page opens
    markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'promo': return <Tag size={18} color="#10b981" />;
      case 'alert': return <AlertCircle size={18} color="#ef4444" />;
      case 'update': return <Zap size={18} color="#f59e0b" />;
      default: return <Info size={18} color="#3b82f6" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'promo': return '#e8f8ef';
      case 'alert': return '#fef2f2';
      case 'update': return '#fffbeb';
      default: return '#eff6ff';
    }
  };

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <button style={s.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={s.headerTitle}>Notifications</h2>
          {notifications.length > 0 ? (
            <button style={s.clearBtn} onClick={() => {
              if (window.confirm('Are you sure you want to clear all your notifications?')) clearAllNotifications();
            }}>
              <Trash2 size={18} color="var(--text-muted)" />
            </button>
          ) : (
            <div style={{ width: 18 }} />
          )}
        </div>
      </header>

      <main style={s.main}>
        {notifications.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyCircle}>
              <Bell size={40} color="var(--text-muted)" />
            </div>
            <h3 style={s.emptyTitle}>All caught up!</h3>
            <p style={s.emptySub}>When we have news or special offers for you, they'll show up here.</p>
          </div>
        ) : (
          <div style={s.list}>
            {notifications.map(n => (
              <div key={n.id} style={s.card}>
                <div style={{ ...s.iconBox, background: getBg(n.notification_type) }}>
                  {getIcon(n.notification_type)}
                </div>
                <div style={s.content}>
                  <div style={s.top}>
                    <h3 style={s.title}>{n.title}</h3>
                    <span style={s.time}>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={s.msg}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 40 },
  header: { background: '#fff', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)' },
  headerInner: { maxWidth: 500, margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { background: 'none', color: 'var(--text-primary)' },
  headerTitle: { fontSize: 18, fontWeight: 800, margin: 0 },
  clearBtn: { background: 'none' },

  main: { maxWidth: 500, margin: '0 auto', padding: '15px' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', padding: 15, borderRadius: 18, display: 'flex', gap: 15, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' },
  iconBox: { width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' },
  time: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 },
  msg: { fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 },

  empty: { textAlign: 'center', padding: '100px 20px' },
  emptyCircle: { width: 80, height: 80, borderRadius: '24px', background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'var(--shadow-sm)' },
  emptyTitle: { fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 },
  emptySub: { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }
};
