import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer"
import Home from "./pages/Home"
import UnitDetails from "./pages/UnitDetails";


function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/unit/:id" element={<UnitDetails />}/>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
