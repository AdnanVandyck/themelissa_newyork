import React, { useState, useEffect } from 'react'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the home page (has hero section)
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) { // Adjust this value based on when you want the transition
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Function to handle availability link click
  const handleAvailabilityClick = (e) => {
    e.preventDefault();
    
    // If we're already on the homepage, just scroll to the section
    if (location.pathname === '/') {
      scrollToAvailability();
    } else {
      // If we're on a different page, navigate to home first, then scroll
      navigate('/');
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        scrollToAvailability();
      }, 100);
    }
  };

  // Function to smoothly scroll to availability section
  const scrollToAvailability = () => {
    const availabilitySection = document.getElementById('availability');
    if (availabilitySection) {
      availabilitySection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <Navbar 
      expand="md" 
      style={{
        backgroundColor: isHomePage 
          ? (scrolled ? 'rgba(0,0,0,0.95)' : 'transparent') 
          : 'rgba(0,0,0,0.95)',
        borderBottom: scrolled || !isHomePage ? '1px solid rgba(255,255,255,0.1)' : 'none',
        padding: '15px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: scrolled || !isHomePage ? '0 2px 20px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.5s ease',
        backdropFilter: scrolled || !isHomePage ? 'blur(10px)' : 'none'
      }}
    >
      <Container>
        {/* Logo */}
        <Link 
          to="/" 
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <img 
            src="/melissa-logo.png"
            alt="Melissa"
            style={{
              height: '100px',
              width: 'auto',
              transition: 'all 0.3s ease',
              filter: isHomePage && !scrolled 
                ? 'brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' 
                : 'brightness(0) invert(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Link>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav"
          style={{
            borderColor: 'rgba(255,255,255,0.3)',
            backgroundColor: 'transparent'
          }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto" style={{ alignItems: 'center' }}>
            {/* Updated Availability Link with Smooth Scroll */}
            <a
              href="#availability"
              onClick={handleAvailabilityClick}
              style={{
                textDecoration: 'none',
                color: 'white',
                fontSize: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '0 25px',
                fontWeight: '500',
                transition: 'all 0.5s ease',
                textShadow: isHomePage && !scrolled ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ccc'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Availability
            </a>
            
            <Link 
              to="/contact" 
              style={{
                textDecoration: 'none',
                color: 'white',
                fontSize: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '0 25px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                textShadow: isHomePage && !scrolled ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ccc'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Contact
            </Link>
            
            {isAuthenticated() ? (
              <>
                <Link 
                  to="/admin/dashboard"
                  style={{
                    textDecoration: 'none',
                    color: 'white',
                    fontSize: '15px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    margin: '0 25px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    textShadow: isHomePage && !scrolled ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ccc'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'white'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  Dashboard
                </Link>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginLeft: '10px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: '400',
                    textShadow: isHomePage && !scrolled ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}>
                    Welcome, {user.username}
                  </span>
                  <Button 
                    onClick={handleLogout}
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px solid rgba(255,255,255,0.8)',
                      borderRadius: '0',
                      padding: '8px 16px',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.color = 'black'
                      e.target.style.borderColor = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'white'
                      e.target.style.borderColor = 'rgba(255,255,255,0.8)'
                    }}
                    size="sm"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Link 
                to="/admin/login"
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '15px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 25px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  textShadow: isHomePage && !scrolled ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ccc'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'white'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                Admin
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header