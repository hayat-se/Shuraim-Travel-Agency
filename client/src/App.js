import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Common Components
import ErrorBoundary from './components/ErrorBoundary';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import AdminLogin from './pages/auth/AdminLogin';
import AgencyRegister from './pages/auth/AgencyRegister';
import AgencyLogin from './pages/auth/AgencyLogin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FlightManagement from './pages/admin/FlightManagement';
import AgencyManagement from './pages/admin/AgencyManagement';
import AllBookings from './pages/admin/AllBookings';
import BankManagement from './pages/admin/BankManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';

// Agency Pages
import AgencyDashboard from './pages/agency/AgencyDashboard';
import SearchFlights from './pages/agency/SearchFlights';
import BookingForm from './pages/agency/BookingForm';
import MyBookings from './pages/agency/MyBookings';
import MyLedger from './pages/agency/MyLedger';
import Payments from './pages/agency/Payments';
import Banks from './pages/agency/Banks';
import GiveFeedback from './pages/agency/GiveFeedback';

// Common Components
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';

function AppContent({ user, setUser }) {
  const location = useLocation();
  const showNavigation = (user && location.pathname !== '/') || location.pathname === '/agency/search-flights' || location.pathname.startsWith('/agency/book/');

  return (
    <>
      {showNavigation && <Navigation user={user} setUser={setUser} />}
      <div className="main-content">
        <Routes>
          {/* Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin setUser={setUser} />} />
          <Route path="/agency/register" element={<AgencyRegister />} />
          <Route path="/agency/login" element={<AgencyLogin setUser={setUser} />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute user={user} role="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/flights" element={
              <PrivateRoute user={user} role="admin">
                <FlightManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/agencies" element={
              <PrivateRoute user={user} role="admin">
                <AgencyManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/bookings" element={
              <PrivateRoute user={user} role="admin">
                <AllBookings />
              </PrivateRoute>
            } />
            <Route path="/admin/banks" element={
              <PrivateRoute user={user} role="admin">
                <BankManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/payments" element={
              <PrivateRoute user={user} role="admin">
                <PaymentManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/feedback" element={
              <PrivateRoute user={user} role="admin">
                <FeedbackManagement />
              </PrivateRoute>
            } />

            {/* Agency Routes */}
            <Route path="/agency/dashboard" element={
              <PrivateRoute user={user} role="agency">
                <AgencyDashboard />
              </PrivateRoute>
            } />
            <Route path="/agency/search-flights" element={
              <SearchFlights />
            } />
            <Route path="/agency/book/:flightId" element={
              <BookingForm />
            } />
            <Route path="/agency/my-bookings" element={
              <PrivateRoute user={user} role="agency">
                <MyBookings />
              </PrivateRoute>
            } />
            <Route path="/agency/ledger" element={
              <PrivateRoute user={user} role="agency">
                <MyLedger />
              </PrivateRoute>
            } />
            <Route path="/agency/payments" element={
              <PrivateRoute user={user} role="agency">
                <Payments />
              </PrivateRoute>
            } />
            <Route path="/agency/banks" element={
              <PrivateRoute user={user} role="agency">
                <Banks />
              </PrivateRoute>
            } />
            <Route path="/agency/feedback" element={
              <PrivateRoute user={user} role="agency">
                <GiveFeedback />
              </PrivateRoute>
            } />

            {/* Landing Page - Always show landing page at root */}
            <Route path="/" element={<LandingPage setUser={setUser} />} />
          </Routes>
        </div>
      </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (restore auth state on page reload)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <Router>
        <AppContent user={user} setUser={setUser} />
      </Router>
    </ErrorBoundary>
  );
}

export default App;