import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Setup Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
      '.service-card, .destination-card, .feature-item, .leadership-card, .contact-card, .section-header'
    );

    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('drawer-open');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-navbar">
        <div className="navbar-container">
          {/* Left: Logo */}
          <div className="navbar-logo">
            <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="logo-icon">
                {/* <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg> */}
                <img src="/assets/logo2.png" alt="" />

              </span>
              <div className="brand-text">
                <h1>Shuraim Air Travel & Tours</h1>
              </div>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
            <li className="navbar-close-item">
              <span className="drawer-title">Menu</span>
              <button className="navbar-close" onClick={closeMenu} aria-label="Close menu">
                ×
              </button>
            </li>
            <li><a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); closeMenu(); setTimeout(() => scrollToSection('services'), 0); }}>Services</a></li>
            <li><a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); closeMenu(); setTimeout(() => scrollToSection('about'), 0); }}>About</a></li>
            <li><a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); closeMenu(); setTimeout(() => scrollToSection('contact'), 0); }}>Contact</a></li>
            <li className="drawer-actions">
              <button className="nav-login" onClick={() => { navigate('/agency/login'); closeMenu(); }}>Agency Login</button>
              <button className="nav-cta" onClick={() => { navigate('/agency/register'); closeMenu(); }}>Register Agency</button>
            </li>
          </ul>

          {/* Right: Actions */}
          <div className="navbar-actions">
            <button className="nav-login" onClick={() => { navigate('/agency/login'); closeMenu(); }}>Agency Login</button>
            <button className="nav-cta" onClick={() => { navigate('/agency/register'); closeMenu(); }}>Register Agency</button>
          </div>

          {/* Mobile Toggle */}
          <button className="navbar-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
      <div
        className={`navbar-overlay ${menuOpen ? 'active' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      ></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>
        <div className="hero-content">
          <h2 className="hero-title">Welcome to Shuraim Air Travel & Tours</h2>
          <p className="hero-subtitle">Professional B2B Flight Booking Solutions for Travel Agencies</p>
          <div className="hero-buttons">
            <button className="cta-btn secondary" onClick={() => navigate('/admin/login')}>
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>Comprehensive solutions for your travel booking needs</p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3>Flight Bookings</h3>
            <p>Easy and reliable flight booking system for travel agencies with competitive pricing</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3>Payment Solutions</h3>
            <p>Secure and flexible payment methods with multiple bank options</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3>Booking Management</h3>
            <p>Complete booking management system with real-time status updates</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Analytics & Reports</h3>
            <p>Detailed ledger and financial reports for better business insights</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3>E-Tickets</h3>
            <p>Professional PDF e-tickets with QR codes for passenger convenience</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3>Support & Feedback</h3>
            <p>24/7 customer support and feedback system for continuous improvement</p>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="destinations-section">
        <div className="section-header">
          <h2>Featured Destinations</h2>
          <p>Explore world-class travel destinations we serve</p>
        </div>

        <div className="destinations-grid">
          <div className="destination-card">
            <img src="/images/destinations/dubai.jpg" alt="Dubai, UAE" onError={(e) => e.currentTarget.src = '/images/placeholder-destination.svg'} />
            <div className="destination-overlay">
              <h3>Dubai</h3>
              <p>United Arab Emirates</p>
            </div>
          </div>

          <div className="destination-card">
            <img src="/images/destinations/ksa.jpg" alt="Saudi Arabia" onError={(e) => e.currentTarget.src = '/images/placeholder-destination.svg'} />
            <div className="destination-overlay">
              <h3>Saudi Arabia</h3>
              <p>Kingdom of Saudi Arabia</p>
            </div>
          </div>

          <div className="destination-card">
            <img src="/images/destinations/tokyo.jpg" alt="Tokyo, Japan" onError={(e) => e.currentTarget.src = '/images/placeholder-destination.svg'} />
            <div className="destination-overlay">
              <h3>Tokyo</h3>
              <p>Japan</p>
            </div>
          </div>

          <div className="destination-card">
            <img src="/images/destinations/newyork.jpg" alt="New York, USA" onError={(e) => e.currentTarget.src = '/images/placeholder-destination.svg'} />
            <div className="destination-overlay">
              <h3>New York</h3>
              <p>United States</p>
            </div>
          </div>

          <div className="destination-card">
            <img src="/images/destinations/london.jpg" alt="London, UK" onError={(e) => e.currentTarget.src = '/images/placeholder-destination.svg'} />
            <div className="destination-overlay">
              <h3>London</h3>
              <p>United Kingdom</p>
            </div>
          </div>

          <div className="destination-card">
            <img src="/images/destinations/paris.jpg" alt="Paris, France" onError={(e) => e.currentTarget.src = '/images/placeholder-destination.svg'} />
            <div className="destination-overlay">
              <h3>Paris</h3>
              <p>France</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-content">
            <h2>About Shuraim</h2>
            <p>Shuraim Air Travel & Tours is a licensed travel agency providing professional B2B flight booking solutions. With years of experience in the travel industry, we are committed to delivering exceptional service to our partner agencies.</p>

            <div className="company-info">
              <div className="info-item">
                <span className="info-label">Company Name:</span>
                <span className="info-value">Shuraim Air Travel & Tours</span>
              </div>
              <div className="info-item">
                <span className="info-label">License No:</span>
                <span className="info-value">1224</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">Batkhela, Pakistan</span>
              </div>
            </div>
          </div>

          <div className="about-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4>Licensed & Trusted</h4>
              <p>Officially licensed travel agency with proven track record</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4>Global Network</h4>
              <p>Connected with airlines worldwide for best deals</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4>Fast Processing</h4>
              <p>Quick booking confirmations and instant e-ticket generation</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4>Partner Support</h4>
              <p>Dedicated support team for all partner agencies</p>
            </div>
          </div>
        </div>

        <div className="leadership-section">
          <div className="leadership-header">
            <p className="leadership-kicker">Leadership</p>
            <h3>Meet Our Leadership</h3>
            <p className="leadership-subtitle">Trusted professionals guiding Shuraim Air Travel & Tours</p>
          </div>

          <div className="leadership-grid">
            <div className="leadership-card">
              <div className="leadership-photo">
                <img
                  src="/images/ceo.jpg"
                  alt="Yasir Khan - CEO"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-profile.svg';
                  }}
                />
              </div>
              <div className="leadership-body">
                <p className="leadership-role">CEO</p>
                <p className="leadership-name">Yasir Khan</p>
                <p className="leadership-bio">Visionary leader with extensive experience in travel industry operations and B2B partnerships</p>
              </div>
            </div>

            <div className="leadership-card">
              <div className="leadership-photo">
                <img
                  src="/images/md.jpg"
                  alt="Sudais Ahmad - MD"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-profile.svg';
                  }}
                />
              </div>
              <div className="leadership-body">
                <p className="leadership-role">Managing Director</p>
                <p className="leadership-name">Sudais Ahmad</p>
                <p className="leadership-bio">Strategic thinker dedicated to delivering innovative solutions and exceptional customer service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="contact-wrapper">
          <div className="contact-header-main">
            <span className="contact-badge">Contact Us</span>
            <h2 className="contact-title-main">Get In Touch</h2>
            <p className="contact-subtitle-main">
              Ready to partner with us? Our team is here to assist you with all your travel booking needs.
              Reach out through any channel below.
            </p>
          </div>

          <div className="contact-cards-container">
            {/* Phone Card */}
            <div className="contact-card phone-card">
              <div className="contact-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="contact-card-title">Call Us Directly</h3>
              <p className="contact-card-subtitle">Speak with our team for immediate assistance</p>
              <div className="contact-card-content">
                <div className="contact-person">
                  <span className="person-role">CEO – Yasir Khan</span>
                  <div className="person-numbers">
                    <a href="tel:03469317338" className="contact-link">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="link-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      0346-9317338
                    </a>
                    <a href="tel:03189317342" className="contact-link">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="link-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      0318-9317342
                    </a>
                  </div>
                </div>
                <div className="contact-person">
                  <span className="person-role">MD – Sudais Ahmad</span>
                  <div className="person-numbers">
                    <a href="tel:03433173386" className="contact-link">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="link-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      0343-3173386
                    </a>
                    <a href="tel:03121673386" className="contact-link">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="link-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      0312-1673386
                    </a>
                  </div>
                </div>
                <div className="contact-divider"></div>
                <div className="contact-info-row">
                  <span className="info-label">Landline</span>
                  <a href="tel:09324115061" className="info-value">(0932) 411506</a>
                </div>
              </div>
            </div>

            {/* Email & Location Card */}
            <div className="contact-card info-card">
              <div className="contact-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="contact-card-title">Email & Location</h3>
              <p className="contact-card-subtitle">Send us a message or visit our office</p>
              <div className="contact-card-content">
                <div className="contact-info-block">
                  <div className="info-icon-wrapper">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="info-text">
                    <span className="info-label">Email Address</span>
                    <a href="mailto:shuraimintl@gmail.com" className="info-value email">shuraimintl@gmail.com</a>
                  </div>
                </div>
                <div className="contact-divider"></div>
                <div className="contact-info-block">
                  <div className="info-icon-wrapper">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="info-text">
                    <span className="info-label">Office Address</span>
                    <p className="info-value">1st Floor, Hayat Khan Plaza</p>
                    <p className="info-value">Batkhela, Pakistan</p>
                  </div>
                </div>
                <div className="contact-divider"></div>
                <div className="contact-info-block">
                  <div className="info-icon-wrapper">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="info-text">
                    <span className="info-label">Business Hours</span>
                    <p className="info-value">Mon - Sat: 9:00 AM - 6:00 PM</p>
                    <p className="info-value closed">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Bar */}
          <div className="quick-contact-bar">
            <div className="quick-contact-content">
              <div className="quick-contact-text">
                <h4>Need immediate assistance?</h4>
                <p>Our support team is available during business hours to help you</p>
              </div>
              <div className="quick-contact-actions">
                <a href="mailto:shuraimintl@gmail.com" className="quick-btn primary">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Partner With Us?</h2>
        <p>Join hundreds of agencies using Shuraim Air Travel & Tours for their flight booking needs</p>
        <div className="cta-buttons">
          <button className="cta-btn primary" onClick={() => navigate('/agency/register')}>
            Register as Agency
          </button>
          <button className="cta-btn secondary" onClick={() => scrollToSection('contact')}>
            Contact Us
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-section company">
              <div className="footer-logo">
                <div className="logo-icon-footer">
                  <img src="/assets/logo2.png" alt="" />
                </div>
                <div className="footer-brand-text">
                  <h3>Shuraim</h3>
                  <p>Air Travel & Tours</p>
                </div>
              </div>
              <p className="footer-description">
                Professional B2B flight booking solutions for travel agencies. Licensed and trusted partner for your aviation needs.
              </p>
              <div className="footer-license">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>License No: 1224</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Our Services
                </a></li>
                <li><a href="#destinations" onClick={(e) => { e.preventDefault(); scrollToSection('destinations'); }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Destinations
                </a></li>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  About Us
                </a></li>
                <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Contact
                </a></li>
              </ul>
            </div>

            {/* For Agencies */}
            <div className="footer-section">
              <h4>For Agencies</h4>
              <ul className="footer-links">
                <li><a href="/agency/register">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Agency Registration
                </a></li>
                <li><a href="/agency/login">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Agency Login
                </a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4>Get In Touch</h4>
              <ul className="footer-contact">
                <li>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <a href="tel:03469317338">0346-9317338</a>
                    <a href="tel:03189317342">0318-9317342</a>
                  </div>
                </li>
                <li>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <a href="mailto:shuraimintl@gmail.com">shuraimintl@gmail.com</a>
                  </div>
                </li>
                <li>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span>1st Floor, Hayat Khan Plaza</span>
                    <span>Batkhela, Pakistan</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; 2026 Shuraim Air Travel & Tours. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
