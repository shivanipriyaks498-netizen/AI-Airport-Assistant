
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

const flightData = [
  {
    number: "AI 202",
    airline: "Air India",
    route: "DEL → BLR",
    status: "On Time",
    time: "10:30 AM"
  },
  {
    number: "6E 451",
    airline: "IndiGo",
    route: "BLR → BOM",
    status: "Boarding",
    time: "11:15 AM"
  },
  {
    number: "UK 820",
    airline: "Vistara",
    route: "BLR → DEL",
    status: "Scheduled",
    time: "12:00 PM"
  },
  {
    number: "SG 415",
    airline: "SpiceJet",
    route: "HYD → BLR",
    status: "On Time",
    time: "12:45 PM"
  }
];

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setUser(response.data.user);

      } catch (error) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        toast.error("Please log in to continue.");
        navigate("/login", { replace: true });

      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const services = [
    {
      icon: "✈️",
      title: "Flight Search",
      description: "Search flights and explore flight information.",
      path: "/flights"
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description: "Get smart answers to your travel questions.",
      path: "/assistant"
    },
    {
      icon: "🗺️",
      title: "Airport Navigation",
      description: "Find gates and important airport locations.",
      path: "/navigation"
    },
    {
      icon: "🧳",
      title: "Baggage Assistance",
      description: "Get help with baggage-related problems.",
      path: "/baggage"
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        Verifying your account...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">

      {/* DASHBOARD HERO SECTION */}
      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <span className="dashboard-tag">
            YOUR SMART TRAVEL COMPANION
          </span>

          <h1>
            Welcome, <span>{user.name}</span>
          </h1>

          <p>
            Experience smarter travel with AI-powered flight
            assistance, airport navigation and baggage support.
          </p>

          <div className="dashboard-hero-buttons">

            <button onClick={() => navigate("/flights")}>
              Explore Flights →
            </button>

            <button
              className="dashboard-secondary-button"
              onClick={() => navigate("/assistant")}
            >
              Meet AI Assistant
            </button>

          </div>

          <div className="dashboard-user-info">
            Logged in as: {user.email}
          </div>

        </div>

      </section>

      {/* FLIGHT INFORMATION SECTION */}
      <section className="dashboard-flights-section">

        <div className="dashboard-section-heading">
          <span>FLIGHT INFORMATION</span>
          <h2>Flights at a Glance</h2>
          <p>
            Explore sample flight information from our dashboard.
          </p>
        </div>

        <div className="flight-ticker">

          <div className="flight-ticker-track">

            {[...flightData, ...flightData].map((flight, index) => (

              <div className="dashboard-flight-card" key={index}>

                <div className="dashboard-flight-top">

                  <strong>{flight.number}</strong>

                  <span
                    className={`dashboard-flight-status ${flight.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {flight.status}
                  </span>

                </div>

                <p>{flight.airline}</p>

                <h3>{flight.route}</h3>

                <small>Departure: {flight.time}</small>

              </div>

            ))}

          </div>

        </div>

        <p className="dashboard-demo-note">
          * Sample flight information for demonstration only.
          Check Flight Search for available live flight information.
        </p>

      </section>

      {/* AIRPORT SERVICES SECTION */}
      <section className="dashboard-services">

        <div className="dashboard-section-heading">

          <span>EXPLORE OUR SERVICES</span>

          <h2>Everything You Need for Your Journey</h2>

          <p>
            Choose a service to make your airport experience easier.
          </p>

        </div>

        <div className="dashboard-grid">

          {services.map((service) => (

            <div
              className="dashboard-card"
              key={service.title}
              onClick={() => navigate(service.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(service.path);
                }
              }}
            >

              <div className="dashboard-card-icon">
                {service.icon}
              </div>

              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <span>Explore Service →</span>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;
