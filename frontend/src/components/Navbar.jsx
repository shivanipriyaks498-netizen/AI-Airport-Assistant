
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Navbar() {
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isLoggedIn = Boolean(token && user);
  const isAdmin = isLoggedIn && user.role === "admin";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* LEFT SIDE - LOGO */}
      <div className="logo">
        <Link to="/">
          ✈️ AI Airport Assistant
        </Link>
      </div>

      {/* CENTER - NAVIGATION LINKS */}
      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/flights">Flights</Link>

        <Link to="/assistant">AI Assistant</Link>

        <Link to="/navigation">Navigation</Link>

        <Link to="/baggage">Baggage</Link>

      </div>

      {/* RIGHT SIDE - LOGIN / REGISTER / LOGOUT */}
      <div className="nav-buttons">

        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        ) : (
          <>
            {isAdmin && (
              <Link to="/admin" className="admin-nav-link">
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="register-btn"
            >
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;
