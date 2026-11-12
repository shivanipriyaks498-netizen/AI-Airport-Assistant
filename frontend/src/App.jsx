
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import FlightSearch from "./pages/FlightSearch";
import Chatbot from "./components/Chatbot";
import BaggageAssistance from "./pages/BaggageAssistance";
import AdminDashboard from "./pages/AdminDashboard";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navigation from "./pages/Navigation";
import Assistant from "./pages/Assistant";

import "./index.css";
import "./App.css";

function Home() {
  const flights = [
    { code: "AI 202", from: "BLR", to: "DEL", time: "08:30 AM", status: "On Time" },
    { code: "6E 451", from: "BLR", to: "BOM", time: "09:15 AM", status: "Boarding" },
    { code: "UK 815", from: "DEL", to: "BLR", time: "10:45 AM", status: "Scheduled" },
    { code: "AI 505", from: "BLR", to: "HYD", time: "11:30 AM", status: "On Time" },
    { code: "6E 230", from: "BLR", to: "MAA", time: "12:15 PM", status: "Scheduled" }
  ];

  const services = [
    {
      icon: "✈️",
      title: "Flight Information",
      description: "Explore flight schedules and travel information.",
      link: "/flights"
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description: "Get smart and personalized airport assistance.",
      link: "/assistant"
    },
    {
      icon: "🗺️",
      title: "Navigation",
      description: "Find terminals, gates and airport facilities.",
      link: "/navigation"
    },
    {
      icon: "🧳",
      title: "Baggage",
      description: "Get support for lost, delayed and damaged baggage.",
      link: "/baggage"
    }
  ];

  return (
    <main className="home-page">

      {/* HERO SECTION */}
      <section className="hero">

        <div className="hero-overlay"></div>

        <div className="hero-top-label">
          <span className="live-dot"></span>
          YOUR SMART AIRPORT EXPERIENCE STARTS HERE
        </div>

        <div className="hero-bottom-content">

          <p className="welcome">WELCOME TO</p>

          <h1>
            AI AIRPORT
            <span> ASSISTANT</span>
          </h1>

          <p className="hero-description">
            Your intelligent travel companion.
            Explore flights, navigate airport terminals,
            manage baggage and experience smarter travel
            with AI-powered assistance.
          </p>

          <div className="hero-buttons">

            <Link to="/flights" className="primary-btn">
              Explore Flights →
            </Link>

            <Link to="/assistant" className="secondary-btn">
              Meet AI Assistant
            </Link>

          </div>

        </div>

        <div className="hero-scroll">
          SCROLL TO EXPLORE
          <span>↓</span>
        </div>

      </section>

      {/* MOVING FLIGHT SECTION */}
      <section className="moving-flights">

        <div className="flight-heading">

          <div>
            <span className="section-label">FLIGHT UPDATES</span>
            <h2>Your Journey Takes Off Here</h2>
            <p>Explore sample flight information and airport updates.</p>
          </div>

          <Link to="/flights" className="view-flights">
            View Flights →
          </Link>

        </div>

        <div className="flight-marquee">

          <div className="flight-track">

            {[...flights, ...flights].map((flight, index) => (

              <div className="moving-flight-card" key={index}>

                <div className="moving-flight-top">
                  <span>✈ {flight.code}</span>

                  <span className="flight-live-status">
                    {flight.status}
                  </span>
                </div>

                <div className="moving-flight-route">

                  <div>
                    <h3>{flight.from}</h3>
                    <p>Departure</p>
                  </div>

                  <div className="moving-plane">
                    <span>✈</span>
                    <div></div>
                  </div>

                  <div>
                    <h3>{flight.to}</h3>
                    <p>Destination</p>
                  </div>

                </div>

                <div className="moving-flight-time">
                  <span>Departure Time</span>
                  <strong>{flight.time}</strong>
                </div>

              </div>

            ))}

          </div>

        </div>

        <p className="flight-disclaimer">
          * These are sample flight details for demonstration.
          Check the Flight Information page for available project data.
        </p>

      </section>

      {/* AIRPORT SERVICES */}
      <section className="services-section">

        <span className="section-label">DISCOVER OUR FEATURES</span>

        <h2>Everything You Need for a Smarter Journey</h2>

        <p className="services-description">
          Experience convenient and intelligent airport services
          through one smart platform.
        </p>

        <div className="service-grid">

          {services.map((service, index) => (

            <Link
              to={service.link}
              className="service-card"
              key={index}
            >

              <span>{service.icon}</span>

              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <div className="service-arrow">
                Explore Service →
              </div>

            </Link>

          ))}

        </div>

      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="home-cta">

        <span>TRAVEL SMARTER WITH AI</span>

        <h2>Ready for a Better Airport Experience?</h2>

        <p>
          Let your smart travel companion make your journey
          easier, faster and more comfortable.
        </p>

        <Link to="/register" className="cta-button">
          Get Started Today →
        </Link>

      </section>

    </main>
  );
}

function App() {
  return (
    <BrowserRouter>

      {/* ONE GLOBAL NAVBAR */}
      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/flights" element={<FlightSearch />} />

        <Route path="/navigation" element={<Navigation />} />

        {/* NORMAL USER PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/assistant" element={<Assistant />} />

          <Route path="/baggage" element={<BaggageAssistance />} />

        </Route>

        {/* ADMIN ONLY PROTECTED ROUTE */}
        <Route element={<ProtectedRoute adminOnly={true} />}>

          <Route path="/admin" element={<AdminDashboard />} />

        </Route>

      </Routes>

      {/* ONE GLOBAL FOOTER */}
      <Footer />

      {/* ONE GLOBAL CHATBOT */}
      <Chatbot />

    </BrowserRouter>
  );
}

export default App;
