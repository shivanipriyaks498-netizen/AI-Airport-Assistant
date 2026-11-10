
function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        ✈️ AI Airport Assistant
      </div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/flights">Flights</a>
        <a href="/navigation">Navigation</a>
        <a href="/baggage">Baggage</a>
        <a href="/admin">Admin</a>
      </div>

      <div className="nav-buttons">
        <a href="/login">Login</a>
        <a href="/register" className="register-btn">
          Register
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
