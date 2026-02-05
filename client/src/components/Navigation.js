import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/admin/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const menuItems = user?.role === 'admin'
    ? [
      { label: 'Dashboard', icon: 'fa-chart-line', path: '/admin/dashboard' },
      { label: 'Flights', icon: 'fa-plane', path: '/admin/flights' },
      { label: 'Agencies', icon: 'fa-building', path: '/admin/agencies' },
      { label: 'Bookings', icon: 'fa-list-check', path: '/admin/bookings' },
      { label: 'Banks', icon: 'fa-university', path: '/admin/banks' },
      { label: 'Payments', icon: 'fa-credit-card', path: '/admin/payments' },
      { label: 'Feedback', icon: 'fa-comments', path: '/admin/feedback' }
    ]
    : [
      { label: 'Dashboard', icon: 'fa-chart-line', path: '/agency/dashboard' },
      { label: 'Search Flights', icon: 'fa-magnifying-glass', path: '/agency/search-flights' },
      { label: 'My Bookings', icon: 'fa-ticket', path: '/agency/my-bookings' },
      { label: 'My Ledger', icon: 'fa-book', path: '/agency/ledger' },
      { label: 'Payments', icon: 'fa-credit-card', path: '/agency/payments' },
      { label: 'Banks', icon: 'fa-university', path: '/agency/banks' },
      { label: 'Give Feedback', icon: 'fa-comments', path: '/agency/feedback' }
    ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className="mobile-brand">
          <div className="mobile-logo">SA</div>
          <div className="mobile-brand-text">
            <h1 className="mobile-title">Shuraim Air</h1>
            <p className="mobile-subtitle">{user?.role === 'admin' ? 'Admin Portal' : 'Agency Portal'}</p>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div 
          className="drawer-overlay active" 
          onClick={() => setMobileDrawerOpen(false)}
        ></div>
      )}

      {/* Navigation Drawer */}
      <nav className={`navbar ${mobileDrawerOpen ? 'drawer-open' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-header">
            <div className="portal-brand">
              <div className="portal-logo">SA</div>
              <div className="portal-brand-text">
                <h1 className="navbar-title">Shuraim Air Travels & Tours</h1>
                <p className="navbar-subtitle">Your Travel Partner</p>
              </div>
            </div>
          </div>

          <div className="drawer-header">
            <button
              className="drawer-close-btn"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close navigation menu"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="drawer-brand">
              <div className="portal-logo">SA</div>
              <div className="portal-brand-text">
                <h1 className="navbar-title">Shuraim Air Travels & Tours</h1>
                <p className="navbar-subtitle">Your Travel Partner</p>
              </div>
            </div>
          </div>

          <div className="nav-menu">
            <div className="menu-section">
              <div className="menu-items">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className="portal-nav-link"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="portal-menu-icon"><i className={`fa-solid ${item.icon}`}></i></span>
                    <span className="portal-menu-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="nav-user">
            <span className="user-info">{user?.email}</span>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
            >
              <i className="fa-solid fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;