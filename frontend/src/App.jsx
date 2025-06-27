import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer"
import TestUnits from "./pages/TestUnits"


// const TestPage = () => (
//   <div style={{ padding: '2rem', minHeight: '60vh'}}>
//     <h2>The Melissa Nyc</h2>
//     <p>Powered by Summit Leasing Services</p>
//   </div>
// );

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<TestUnits />}/>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
