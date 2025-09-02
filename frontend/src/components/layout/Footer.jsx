// import React from 'react'
// import { Container, Row, Col } from 'react-bootstrap'

// const Footer = () => {
//   return (
//     <footer className="bg-dark text-light py-4 mt-auto" style={{ position: 'relative' }}>
//       <Container>
//         {/* Summit Logo - Top Right Corner */}
//         <div style={{
//           position: 'absolute',
//           top: '15px',
//           right: '20px',
//           zIndex: 10
//         }}>
//           <a
//           href="https://www.summitsls.com/" 
//             target="_blank"
//             rel="noopener noreferrer"
//             style={{
//               display: 'inline-block',
//               transition: 'transform 0.3s ease'
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.transform = 'scale(1.05)'
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.transform = 'scale(1)'
//             }}
//           >
//             <img 
//             src="/summit-logo-transparent.png" 
//             alt="Summit"
//             style={{
//               height: '40px',
//               width: 'auto',
//               opacity: '0.8',
//               transition: 'opacity 0.3s ease'
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.opacity = '1'
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.opacity = '0.8'
//             }}
//             onError={(e) => {
//               // Fallback if image doesn't load
//               e.target.style.display = 'none'
//             }}
//           />
//           </a>
          
//         </div>

//         <Row>
//           <Col md={6}>
//             <h5>The Melissa NYC</h5>
//             <p className="mb-0">Summit Leasing Services</p>
//           </Col>
//           <Col md={6} className="text-md-end" style={{ paddingRight: '60px' }}>
//             {/* Added padding-right to prevent text overlap with logo */}
//             <p className="mb-0">&copy; 2025 Summit Leasing Services. All rights reserved.</p>
//           </Col>
//         </Row>
//       </Container>
//     </footer>
//   )
// }

// export default Footer


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
              alt="Summit Leasing Services"
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
            <p className="mb-2">Summit Leasing Services</p>
            
            {/* Equal Housing Information */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '15px' }}>
              <img 
                src="https://www.hud.gov/sites/documents/EQUAL_HOUSING_LOGO.png"
                alt="Equal Housing Opportunity Logo"
                style={{
                  height: '40px',
                  width: 'auto',
                  marginRight: '12px',
                  marginTop: '2px'
                }}
                onError={(e) => {
                  // Fallback to a data URI if HUD image doesn't load
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23ffffff' d='M50 10L20 35v50h20V65h20v20h20V35L50 10zm0 15l20 15v35h-10V55H40v20H30V40l20-15z'/%3E%3C/svg%3E"
                }}
              />
              <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                <strong>Equal Housing Opportunity</strong><br />
                We are committed to providing equal housing opportunities to all persons regardless of race, color, religion, sex, handicap, familial status, or national origin.
              </div>
            </div>
          </Col>
          
          <Col md={6} className="text-md-end" style={{ paddingRight: '60px' }}>
            {/* Copyright and Contact Info */}
            <div style={{ marginBottom: '15px' }}>
              <p className="mb-1">&copy; 2025 Summit Leasing Services. All rights reserved.</p>
              <p className="mb-1" style={{ fontSize: '0.875rem' }}>
                <a 
                  href="tel:+1-212-555-0123" 
                  style={{ color: '#ffffff', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  (917) 544-8626
                </a>
              </p>
              <p className="mb-1" style={{ fontSize: '0.875rem' }}>
                <a 
                  href="mailto:leasing@summitsls.com" 
                  style={{ color: '#ffffff', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  leasing@summitsls.com
                </a>
              </p>
            </div>
            
            {/* Legal Links */}
            <div style={{ fontSize: '0.75rem', opacity: '0.8' }}>
              {/* <a 
                href="/privacy-policy" 
                style={{ color: '#ffffff', textDecoration: 'none', marginRight: '15px' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Privacy Policy
              </a>
              <a 
                href="/terms-of-service" 
                style={{ color: '#ffffff', textDecoration: 'none', marginRight: '15px' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Terms of Service
              </a> */}
              <a 
                href="https://www.hud.gov/program_offices/fair_housing_equal_opp" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ffffff', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Fair Housing
              </a>
            </div>
          </Col>
        </Row>
        
        {/* Additional Equal Housing Disclaimer for Mobile */}
        <Row className="d-md-none">
          <Col xs={12} style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
            <div style={{ 
              fontSize: '0.75rem', 
              textAlign: 'center', 
              opacity: '0.9',
              lineHeight: '1.4'
            }}>
              This property is operated in compliance with federal, state, and local fair housing laws. 
              We do not discriminate against any person because of race, color, religion, sex, handicap, 
              familial status, or national origin.
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer