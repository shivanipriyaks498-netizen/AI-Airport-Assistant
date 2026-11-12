import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const baggageStatuses = [
  "Submitted",
  "Under Review",
  "Located",
  "In Transit",
  "Ready for Collection",
  "Resolved"
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPassengers: 0,
    totalFlights: 0,
    totalBaggageReports: 0,
    pendingBaggageReports: 0,
    resolvedBaggageReports: 0
  });

  const [passengers, setPassengers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("baggage");

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [statsResponse, passengersResponse, baggageResponse] =
        await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/passengers"),
          API.get("/admin/baggage")
        ]);

      setStats(statsResponse.data.stats);
      setPassengers(passengersResponse.data.passengers || []);
      setReports(baggageResponse.data.reports || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await API.patch(`/admin/baggage/${reportId}/status`, {
        status: newStatus
      });

      toast.success("Baggage status updated successfully");

      await loadDashboard();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to update baggage status"
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="admin-eyebrow">AIRPORT MANAGEMENT</span>
          <h1>Admin Dashboard</h1>
          <p>
            Manage passengers, monitor flights, and review baggage
            assistance reports.
          </p>
        </div>

        <div className="admin-hero-icon">🛫</div>
      </section>

      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>👥</span>
          <p>Total Passengers</p>
          <h2>{stats.totalPassengers}</h2>
        </div>

        <div className="admin-stat-card">
          <span>✈️</span>
          <p>Total Flights</p>
          <h2>{stats.totalFlights}</h2>
        </div>

        <div className="admin-stat-card">
          <span>🧳</span>
          <p>Baggage Reports</p>
          <h2>{stats.totalBaggageReports}</h2>
        </div>

        <div className="admin-stat-card">
          <span>⏳</span>
          <p>Pending Reports</p>
          <h2>{stats.pendingBaggageReports}</h2>
        </div>

        <div className="admin-stat-card">
          <span>✅</span>
          <p>Resolved Reports</p>
          <h2>{stats.resolvedBaggageReports}</h2>
        </div>
      </section>

      <section className="admin-content-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Management Center</h2>
            <p>Review application records and baggage complaints.</p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={loadDashboard}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === "baggage" ? "active" : ""}
            onClick={() => setActiveTab("baggage")}
          >
            Baggage Reports ({reports.length})
          </button>

          <button
            className={activeTab === "passengers" ? "active" : ""}
            onClick={() => setActiveTab("passengers")}
          >
            Passengers ({passengers.length})
          </button>
        </div>

        {activeTab === "baggage" && (
          <div className="admin-table-wrapper">
            {reports.length === 0 ? (
              <p className="admin-empty">
                No baggage reports have been submitted.
              </p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tracking Code</th>
                    <th>Passenger</th>
                    <th>Issue</th>
                    <th>Airport</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td>{report.trackingCode}</td>

                      <td>
                        {report.user?.name || report.passengerName}
                        <small>
                          {report.user?.email || "Account details unavailable"}
                        </small>
                      </td>

                      <td>{report.issueType}</td>

                      <td>{report.airportCode}</td>

                      <td>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <span className="admin-status-label">
                          {report.status}
                        </span>
                      </td>

                      <td>
                        <select
                          value={report.status}
                          onChange={(e) =>
                            handleStatusChange(report._id, e.target.value)
                          }
                          aria-label={`Update status for ${report.trackingCode}`}
                        >
                          {baggageStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "passengers" && (
          <div className="admin-table-wrapper">
            {passengers.length === 0 ? (
              <p className="admin-empty">
                No passenger accounts found.
              </p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Account Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {passengers.map((passenger) => (
                    <tr key={passenger._id}>
                      <td>{passenger.name || "Passenger"}</td>
                      <td>{passenger.email}</td>
                      <td>
                        <span className="admin-status-label">
                          {passenger.role}
                        </span>
                      </td>
                      <td>
                        {passenger.createdAt
                          ? new Date(passenger.createdAt).toLocaleDateString()
                          : "Not available"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      <p className="admin-demo-note">
        Admin dashboard demonstration: flight totals and passenger
        records reflect the data stored in your project's MongoDB
        database. This dashboard is not connected to an airport's
        official operations system.
      </p>
    </main>
  );
};

export default AdminDashboard;