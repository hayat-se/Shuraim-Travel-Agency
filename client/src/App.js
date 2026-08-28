import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import AppShell from './components/AppShell';
import { ToastProvider } from './components/ui';

// Landing + Auth
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/auth/AdminLogin';
import AgencyRegister from './pages/auth/AgencyRegister';
import AgencyLogin from './pages/auth/AgencyLogin';
import AgencyForgotPassword from './pages/auth/AgencyForgotPassword';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import FlightManagement from './pages/admin/FlightManagement';
import AgencyManagement from './pages/admin/AgencyManagement';
import AllBookings from './pages/admin/AllBookings';
import BankManagement from './pages/admin/BankManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import GroupManagement from './pages/admin/GroupManagement';
import AirlineManagement from './pages/admin/AirlineManagement';

// Agency
import AgencyDashboard from './pages/agency/AgencyDashboard';
import SearchFlights from './pages/agency/SearchFlights';
import BookingForm from './pages/agency/BookingForm';
import MyBookings from './pages/agency/MyBookings';
import Banks from './pages/agency/Banks';
import GiveFeedback from './pages/agency/GiveFeedback';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // A page that requires auth + a role, wrapped in the app shell (sidebar/topbar).
  const Protected = ({ role, children }) => (
    <PrivateRoute user={user} role={role}>
      <AppShell user={user} setUser={setUser}>
        {children}
      </AppShell>
    </PrivateRoute>
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage setUser={setUser} />} />
            <Route path="/admin/login" element={<AdminLogin setUser={setUser} />} />
            <Route path="/agency/register" element={<AgencyRegister />} />
            <Route path="/agency/login" element={<AgencyLogin setUser={setUser} />} />
            <Route path="/agency/forgot-password" element={<AgencyForgotPassword />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
            <Route path="/admin/flights" element={<Protected role="admin"><FlightManagement /></Protected>} />
            <Route path="/admin/agencies" element={<Protected role="admin"><AgencyManagement /></Protected>} />
            <Route path="/admin/bookings" element={<Protected role="admin"><AllBookings /></Protected>} />
            <Route path="/admin/banks" element={<Protected role="admin"><BankManagement /></Protected>} />
            <Route path="/admin/groups" element={<Protected role="admin"><GroupManagement /></Protected>} />
            <Route path="/admin/airlines" element={<Protected role="admin"><AirlineManagement /></Protected>} />
            <Route path="/admin/feedback" element={<Protected role="admin"><FeedbackManagement /></Protected>} />

            {/* Agency (search + booking are now protected — was a security gap) */}
            <Route path="/agency/dashboard" element={<Protected role="agency"><AgencyDashboard /></Protected>} />
            <Route path="/agency/search-flights" element={<Protected role="agency"><SearchFlights /></Protected>} />
            <Route path="/agency/book/:flightId" element={<Protected role="agency"><BookingForm /></Protected>} />
            <Route path="/agency/my-bookings" element={<Protected role="agency"><MyBookings /></Protected>} />
            <Route path="/agency/banks" element={<Protected role="agency"><Banks /></Protected>} />
            <Route path="/agency/feedback" element={<Protected role="agency"><GiveFeedback /></Protected>} />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
