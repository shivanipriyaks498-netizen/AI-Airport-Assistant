
import Chatbot from "../components/Chatbot";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

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

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return <div className="dashboard-loading">Verifying your account...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <h2>✈️ AI Airport Assistant</h2>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-welcome">
        <h1>Welcome, {user.name}!</h1>

        <p>Your smart travel companion is ready.</p>

        <p className="dashboard-email">
          Logged in as: {user.email}
        </p>
      </div>

      <div className="dashboard-grid">

        <div
          className="dashboard-card"
          onClick={() => navigate("/flights")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/flights");
          }}
        >
          <h2>✈️</h2>
          <h3>Flight Search</h3>
          <p>Search and explore your flights.</p>
          <span>Open →</span>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/assistant")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/assistant");
          }}
        >
          <h2>🤖</h2>
          <h3>AI Assistant</h3>
          <p>Get instant travel assistance.</p>
          <span>Open →</span>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/navigation")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/navigation");
          }}
        >
          <h2>🗺️</h2>
          <h3>Airport Navigation</h3>
          <p>Explore airport terminals.</p>
          <span>Open →</span>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/baggage")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/baggage");
          }}
        >
          <h2>🧳</h2>
          <h3>Baggage Assistance</h3>
          <p>Get baggage-related support.</p>
          <span>Open →</span>
        </div>

      </div>

      <Chatbot />

    </div>
  );
}

export default Dashboard;
