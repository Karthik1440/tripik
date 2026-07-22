// src/App.js — Tripik Main Routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { NotificationProvider } from './context/NotificationContext';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import PackageDetail from './pages/PackageDetail';
import UserBookings from './pages/UserBookings';
import Packages from './pages/Packages';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import HiddenGems from './pages/HiddenGems';
import HiddenSpotDetail from './pages/HiddenSpotDetail';

import AnnouncementBar from './components/AnnouncementBar';

export default function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <FavoritesProvider>
            <NotificationProvider>
              <AnnouncementBar />
              <Routes>
                {/* ── Public Routes ── */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/package/:packageId" element={<PackageDetail />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/hidden-gems" element={<HiddenGems />} />
                <Route path="/hidden-gems/:spotId" element={<HiddenSpotDetail />} />

                {/* ── Protected Routes ── */}
                <Route path="/bookings" element={
                  <ProtectedRoute><UserBookings /></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </NotificationProvider>
          </FavoritesProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}