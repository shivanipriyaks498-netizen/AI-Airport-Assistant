import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import FlightSearch from "./pages/FlightSearch";
import Chatbot from "./components/Chatbot";
import BaggageAssistance from "./pages/BaggageAssistance";
import Baggage from "./pages/Baggage";
import AdminDashboard from "./pages/AdminDashboard";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navigation from "./pages/Navigation";
import Assistant from "./pages/Assistant";

import "./index.css";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-content">

            <p className="welcome">
              YOUR JOURNEY STARTS HERE
            </p>

            <h1>
              Welcome to the
              <span> Future of Travel</span>
            </h1>

            <p className="hero-description">
              Your smart airport companion.
              Search flights, explore terminals,
              track baggage and get instant AI assistance.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() =>
                  window.location.href = "/login"
                }
              >
                Explore Flights
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  window.location.href = "/login"
                }
              >
                Meet AI Assistant
              </button>
            </div>

          </div>
        </section>

        <section className="flight-section">
          <h2>Find Your Flight</h2>
          <p>Search your next journey with ease.</p>

          <div className="search-box">
            <input placeholder="From airport" />
            <input placeholder="To airport" />
            <input type="date" />

            <button className="primary-btn">
              Search Flights
            </button>
          </div>
        </section>

        <section className="services-section">
          <h2>Explore Airport Services</h2>

          <div className="service-grid">

            <div className="service-card">
              <span>✈️</span>
              <h3>Flight Status</h3>
              <p>Check flight information.</p>
            </div>

            <div className="service-card">
              <span>🤖</span>
              <h3>AI Assistant</h3>
              <p>Get instant travel support.</p>
            </div>

            <div className="service-card">
              <span>🗺️</span>
              <h3>Airport Navigation</h3>
              <p>Explore airport locations.</p>
            </div>

            <div className="service-card">
              <span>🧳</span>
              <h3>Baggage Assistance</h3>
              <p>Get help with your luggage.</p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/flights" element={<FlightSearch />} />

        <Route path="/navigation" element={<Navigation />} />
                
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/baggage" element={<BaggageAssistance />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
