// src/context/NotificationContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/trips/notifications/');
      const notifs = res.data;
      const seenIds = JSON.parse(localStorage.getItem('tripik_seen_notifs') || '[]');
      const clearedIds = JSON.parse(localStorage.getItem('tripik_cleared_notifs') || '[]');
      
      const visibleNotifs = notifs.filter(n => !clearedIds.includes(n.id));
      const unseen = visibleNotifs.filter(n => !seenIds.includes(n.id));
      
      setNotifications(visibleNotifs);
      setUnreadCount(unseen.length);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const allIds = prev.map(n => n.id);
      localStorage.setItem('tripik_seen_notifs', JSON.stringify(allIds));
      return prev;
    });
    setUnreadCount(0);
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => {
      const currentCleared = JSON.parse(localStorage.getItem('tripik_cleared_notifs') || '[]');
      const newCleared = [...new Set([...currentCleared, ...prev.map(n => n.id)])];
      localStorage.setItem('tripik_cleared_notifs', JSON.stringify(newCleared));
      return [];
    });
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAllRead, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
