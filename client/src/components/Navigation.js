import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ user, setUser, navbarOpen, toggleNavbar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/admin/login');
  };

  const menuItems = user?.role === 'admin'
    ? [
      { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
      { label: 'Flights', icon: '✈️', path: '/admin/flights' },
      { label: 'Agencies', icon: '🏢', path: '/admin/agencies' },
      { label: 'Bookings', icon: '📋', path: '/admin/bookings' },
      { label: 'Banks', icon: '🏦', path: '/admin/banks' },
      { label: 'Payments', icon: '💳', path: '/admin/payments' },
      { label: 'Feedback', icon: '💬', path: '/admin/feedback' }
    ]
    : [
      { label: 'Dashboard', icon: '📊', path: '/agency/dashboard' },
      { label: 'Search Flights', icon: '🔍', path: '/agency/search-flights' },
      { label: 'My Bookings', icon: '📋', path: '/agency/my-bookings' },
      { label: 'My Ledger', icon: '📑', path: '/agency/ledger' },
      { label: 'Payments', icon: '💳', path: '/agency/payments' },
      { label: 'Banks', icon: '🏦', path: '/agency/banks' },
      { label: 'Give Feedback', icon: '💬', path: '/agency/feedback' }
    ];

  return (
    <>
      <button className="dashboard-navbar-toggle" onClick={toggleNavbar}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`navbar ${navbarOpen ? 'navbar-open' : 'navbar-closed'}`}>
        <div className="navbar-container">
          <div className="navbar-header">
            <h1 className="navbar-title">Shuraim Air Travels & Tours</h1>
            <p className="navbar-subtitle">Your Travel Partner</p>
          </div>

          <div className="nav-menu">
            <div className="menu-section">
              <h3 className="menu-title">🧭 Main Menu</h3>
              <div className="menu-items">
                {menuItems.map((item) => (
                  <a 
                    key={item.label} 
                    href={item.path} 
                    className="nav-link"
                    onClick={(e) => {
                      if (item.path.startsWith('/')) {
                        e.preventDefault();
                        navigate(item.path);
                      }
                    }}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="nav-user">
            <span className="user-info">{user?.email}</span>
            <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;