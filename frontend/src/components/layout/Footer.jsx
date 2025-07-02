import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto" style={{ position: 'relative' }}>
      <Container>
        {/* Summit Logo - Top Right Corner */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '20px',
          zIndex: 10
        }}>
          <a
          href="https://www.summitsls.com/" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
            }}
          >
            <img 
            src="/summit-logo-transparent.png" 
            alt="Summit"
            style={{
              height: '40px',
              width: 'auto',
              opacity: '0.8',
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '1'
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '0.8'
            }}
            onError={(e) => {
              // Fallback if image doesn't load
              e.target.style.display = 'none'
            }}
          />
          </a>
          
        </div>

        <Row>
          <Col md={6}>
            <h5>The Melissa NYC</h5>
            <p className="mb-0">Summit Leasing Services</p>
          </Col>
          <Col md={6} className="text-md-end" style={{ paddingRight: '60px' }}>
            {/* Added padding-right to prevent text overlap with logo */}
            <p className="mb-0">&copy; 2025 Summit Leasing Services. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer