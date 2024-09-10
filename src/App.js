import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './screens/LandingPage';
import LoginRegisterPage from './screens/LoginRegisterPage';
import MainPage from './screens/MainPage';
import ProfilePage from './screens/ProfilePage';
import PodcastPlayer from './screens/PlayerPage';
import Navigator from './components/navigator';
import { AudioProvider } from './contexts/AudioContext';
import BottomPlayer from './components/BottomPlayer';
import { RouteProvider } from './contexts/RouteContext';
import { ThemeProvider } from './contexts/ThemeContext';
import SearchResultsPage from './screens/SearchResultsPage';
import PaymentPage from './screens/PaymentPage';
import ContactPage from './screens/ContactPage';
import { TokenProvider } from './contexts/TokenContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/authenticate" />;
  }

  return children;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <MainPage /> : <LandingPage />;
};

const AppContent = () => {
  const location = useLocation();
  const isPlayerPage = location.pathname.startsWith('/player');

  return (
    <div className="flex flex-col min-h-screen">
      <Navigator />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/authenticate" element={<LoginRegisterPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/player/:id" element={<ProtectedRoute><PodcastPlayer /></ProtectedRoute>} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/payment/signup" element={<PaymentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      {!isPlayerPage && <BottomPlayer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TokenProvider>
          <AudioProvider>
            <RouteProvider>
              <Router>
                <AppContent />
              </Router>
            </RouteProvider>
          </AudioProvider>
        </TokenProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;