import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import UnitCard from '../components/units/UnitCard'
import GalleryDisplay from '../components/admin/GalleryDisplay'
import { unitAPI } from '../services/api'

const Home = () => {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching public units from:', `http://localhost:5000/api/units/public`)
      
      const response = await unitAPI.getPublic()
      console.log('API Response:', response.data)
      setUnits(response.data)
    } catch (err) {
      console.error('Error fetching units:', err)
      setError(`Failed to connect to backend: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div style={{ 
          width: '50px',
          height: '50px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Connection Error</h2>
        <p style={{ color: '#e74c3c', marginBottom: '2rem' }}>{error}</p>
        <button 
          onClick={fetchUnits}
          style={{
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  const availableUnits = units.filter(unit => unit.available)
  const startingPrice = units.length > 0 ? Math.min(...units.map(unit => unit.price || 0)) : 0

  return (
    <div className="home-page">
      {/* Hero Section with Full Building Height and Dark Gradient */}
      <section style={{
        background: `
          linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), 
          url('/melissa-front.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center', // Show full height of building
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: '200px 0 100px 0',
        textAlign: 'center',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }}>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          width: '100%',
          position: 'relative'
        }}>

          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            fontWeight: '300',
            letterSpacing: '-2px',
            margin: '0 0 20px 0',
            lineHeight: '1',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            The Melissa
          </h1>
          
          {/* Neighborhood Information directly below logo */}
          <h1 style={{ 
            fontSize: '20px',
            fontWeight: '300',
            margin: '0 0 50px 0',
            opacity: '0.95',
            textShadow: '1px 1px 4px rgba(0,0,0,0.7)'
          }}>
            308 East 78th Street <br />
            New York, NY 10075
          </h1>

          <button
            onClick={() => document.getElementById('availability').scrollIntoView({ behavior: 'smooth' })}
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: 'white',
              border: '2px solid white',
              padding: '18px 35px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
              fontWeight: '500',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white'
              e.target.style.color = 'black'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'
              e.target.style.color = 'white'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            View Availability
          </button>
        </div>
      </section>

      {/* Building Info Section */}
      <section style={{
        padding: '100px 0',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '300',
                marginBottom: '30px',
                color: '#333',
                lineHeight: '1.2'
              }}>
                Welcome to The Melissa
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#666',
                marginBottom: '25px'
              }}>
                A beautifully reimagined pre-war building blending classic Upper East Side charm with sophisticated, contemporary design. All 39 residences have been thoughtfully and meticulously renovated, featuring modern condo-quality finishes and only the finest materials. Italian-made cabinetry, wide-plank oak flooring, and Carrara marble-inspired bathrooms create an elegant and timeless aesthetic.
                Residents at The Melissa will enjoy a carefully curated collection of amenities to enrich everyday living. These include complimentary high-speed Wi-Fi, a monthly apartment cleaning service, in-unit washer/dryer, and Smart TVs in every residence.
                While 308 E 78th does not have an elevator, its six-story scale and boutique nature offer an intimate residential feel within a highly desirable Manhattan neighborhood.
              </p>

              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '300',
                marginBottom: '30px',
                color: '#333',
                lineHeight: '1.2'
              }}>
                Neighborhood
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#666',
                marginBottom: '25px'
              }}>
                The Melissa is located in the heart of the Upper East Side, one of Manhattans most refined and sought-after neighborhoods. Known for its tree-lined blocks, classic architecture, and proximity to world-renowned cultural institutions, the area offers a quintessential New York lifestyle. Moments away lie Museum Mile, Central Park, and some of the citys finest dining and shopping options along Madison and Lexington Avenues.
                Nearby you willll find acclaimed restaurants, cozy cafes, vibrant wine bars, and gourmet markets. The neighborhood is also home to prestigious schools, top-tier fitness studios, and beautiful green spaces including John Jay Park and the East River Esplanade. For cultural outings, The Metropolitan Museum of Art, The Frick Collection, and countless galleries are within easy reach.
                Public transportation options abound with nearby Q and 6 subway lines, multiple bus routes, and Citi Bike stations, making commutes and exploring the city effortless.

              </p>
              



              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#666',
                marginBottom: '30px'
              }}>
                Experience the perfect blend of comfort, style, and convenience in the Upper East Side.
              </p>
              <div style={{
                display: 'flex',
                gap: '30px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#000',
                    margin: '0 0 5px 0'
                  }}>
                    Prime Location
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: '0'
                  }}>
                    Upper East Side
                  </p>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#000',
                    margin: '0 0 5px 0'
                  }}>
                    Starting From
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: '0'
                  }}>
                    ${startingPrice.toLocaleString()}/month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '60px',
            textAlign: 'center'
          }}>
            <div>
              <h3 style={{
                fontSize: '3.5rem',
                fontWeight: '300',
                color: '#000',
                margin: '0 0 15px 0',
                lineHeight: '1'
              }}>
                {units.length}
              </h3>
              <p style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                margin: '0',
                fontWeight: '400'
              }}>
                Total Residences
              </p>
            </div>
            <div>
              <h3 style={{
                fontSize: '3.5rem',
                fontWeight: '300',
                color: '#000',
                margin: '0 0 15px 0',
                lineHeight: '1'
              }}>
                {availableUnits.length}
              </h3>
              <p style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                margin: '0',
                fontWeight: '400'
              }}>
                Available Now
              </p>
            </div>
            <div>
              <h3 style={{
                fontSize: '3.5rem',
                fontWeight: '300',
                color: '#000',
                margin: '0 0 15px 0',
                lineHeight: '1'
              }}>
                UES
              </h3>
              <p style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                margin: '0',
                fontWeight: '400'
              }}>
                Prime Location
              </p>
            </div>
            {/* <div>
              <h3 style={{
                fontSize: '3.5rem',
                fontWeight: '300',
                color: '#000',
                margin: '0 0 15px 0',
                lineHeight: '1'
              }}>
                24/7
              </h3>
              <p style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                margin: '0',
                fontWeight: '400'
              }}>
                Concierge Service
              </p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Availability Section - ONLY AVAILABLE UNITS */}
      <section id="availability" style={{
        padding: '100px 0',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '300',
              marginBottom: '20px',
              color: '#333',
              lineHeight: '1.2'
            }}>
              Available Residences
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Discover your perfect home from our collection of available residences ready for immediate occupancy.
            </p>
          </div>
          
          {availableUnits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <h3 style={{ 
                color: '#666', 
                fontWeight: '300',
                fontSize: '1.5rem',
                marginBottom: '15px'
              }}>
                No units available at this time
              </h3>
              <p style={{ 
                color: '#999',
                fontSize: '16px'
              }}>
                Please check back soon for new listings.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '40px'
            }}>
              {availableUnits.map((unit) => (
                <UnitCard key={unit._id} unit={unit} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section style={{
        padding: '100px 0',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '300',
              marginBottom: '20px',
              color: '#333'
            }}>
              Building Amenities
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Enjoy world-class amenities designed for modern living.
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f8f8f8',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📶
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '500',
                marginBottom: '10px',
                color: '#333'
              }}>
                Complimentary Wi-Fi
              </h4>
              {/* <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                State-of-the-art equipment and personal training available
              </p> */}
            </div>
            
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f8f8f8',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🧹
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '500',
                marginBottom: '10px',
                color: '#333'
              }}>
                Apartment Cleaning Service
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                {/* 24/7 concierge and doorman service for your convenience */}
              </p>
            </div>
            
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f8f8f8',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🧺
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '500',
                marginBottom: '10px',
                color: '#333'
              }}>
                In-unit Washer/Dryer
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                {/* Private outdoor space with stunning city views */}
              </p>
            </div>
            
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f8f8f8',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🖥
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '500',
                marginBottom: '10px',
                color: '#333'
              }}>
                Smart TV
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                {/* Secure underground parking spaces available */}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section style={{
        padding: '100px 0',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '300',
              marginBottom: '20px',
              color: '#333'
            }}>
              Gallery
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Take a visual tour of The Melissa and discover the luxury that awaits.
            </p>
          </div>
          
          <GalleryDisplay />
        </div>
      </section>


      {/* Contact Section */}
      <section style={{
        padding: '100px 0',
        backgroundColor: '#000',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '300',
            marginBottom: '30px',
            lineHeight: '1.2'
          }}>
            Schedule Your Private Tour
          </h2>
          <p style={{
            fontSize: '16px',
            marginBottom: '50px',
            opacity: '0.9',
            lineHeight: '1.6',
            maxWidth: '500px',
            margin: '0 auto 50px'
          }}>
            Experience The Melissa in person. Contact our leasing team to arrange a personalized viewing.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/contact"
              style={{
                textDecoration: 'none',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '0',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                fontWeight: '400'
              }}
            >
              Schedule Tour
            </Link>
            <Link
              to="/contact"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '15px 30px',
                borderRadius: '0',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                fontWeight: '400'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white'
                e.target.style.color = 'black'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = 'white'
              }}
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home