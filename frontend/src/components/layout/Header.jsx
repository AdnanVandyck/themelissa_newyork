import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <Navbar className="bg-slate-200 shadow-md rounded-lg">
      <Container fluid>
        <Link to="/" className="navbar-brand fw-bold text-decoration-none">
        The Melissa Nyc
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Link to="/" className="nav-link">Units</Link>
            <Link to="/admin/login" className="nav-link">Admin</Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header