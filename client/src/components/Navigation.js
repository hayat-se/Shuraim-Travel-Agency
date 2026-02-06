import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    Admin: true,
    Bookings: true
  });

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
      {
        type: 'group',
        label: 'Admin',
        icon: 'fa-user-shield',
        items: [
          { label: 'Review Users', icon: 'fa-user-check', path: '/admin/agencies' },
          { label: 'Add Bank', icon: 'fa-building-columns', path: '/admin/banks' },
          { label: 'Add Airline', icon: 'fa-plane', path: '/admin/flights' },
          { label: 'Add Country', icon: 'fa-flag', path: '/admin/dashboard' },
          { label: 'Discounts', icon: 'fa-tags', path: '/admin/payments' },
          { label: 'Portal Settings', icon: 'fa-gear', path: '/admin/feedback' }
        ]
      },
      {
        type: 'group',
        label: 'Bookings',
        icon: 'fa-ticket',
        items: [
          { label: 'Book Tickets', icon: 'fa-ticket-simple', path: '/admin/bookings' },
          { label: 'Add Groups', icon: 'fa-layer-group', path: '/admin/groups' },
          { label: 'My Bookings', icon: 'fa-list-check', path: '/admin/bookings' },
          { label: 'Ledger', icon: 'fa-book', path: '/admin/payments' },
          { label: 'Bank Details', icon: 'fa-university', path: '/admin/banks' }
        ]
      }
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
                  item.type === 'group' ? (
                    <div className="menu-group" key={item.label}>
                      <button
                        className="menu-group-header"
                        onClick={() => setOpenGroups((prev) => ({
                          ...prev,
                          [item.label]: !prev[item.label]
                        }))}
                      >
                        <span className="portal-menu-icon"><i className={`fa-solid ${item.icon}`}></i></span>
                        <span className="portal-menu-label">{item.label}</span>
                        <span className="group-caret">
                          <i className={`fa-solid ${openGroups[item.label] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </span>
                      </button>
                      <div className={`menu-group-items ${openGroups[item.label] ? 'open' : ''}`}>
                        {item.items.map((subItem) => (
                          <button
                            key={subItem.label}
                            className="portal-nav-link sub"
                            onClick={() => handleNavigation(subItem.path)}
                          >
                            <span className="portal-menu-icon"><i className={`fa-solid ${subItem.icon}`}></i></span>
                            <span className="portal-menu-label">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      key={item.label}
                      className="portal-nav-link"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <span className="portal-menu-icon"><i className={`fa-solid ${item.icon}`}></i></span>
                      <span className="portal-menu-label">{item.label}</span>
                    </button>
                  )
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