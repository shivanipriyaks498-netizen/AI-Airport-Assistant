import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const Baggage = () => {
  const initialForm = {
    passengerName: "",
    bookingReference: "",
    baggageTag: "",
    issueType: "Lost",
    description: "",
    airportCode: "BLR",
    flightNumber: ""
  };

  const [formData, setFormData] = useState(initialForm);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackedReport, setTrackedReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await API.get("/baggage/my-reports");

      setReports(response.data.reports || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load baggage reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const response = await API.post("/baggage/report", formData);

      toast.success("Baggage report submitted successfully!");

      setFormData(initialForm);
      setTrackedReport(response.data.report);

      await fetchReports();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to submit baggage report"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!trackingCode.trim()) {
      toast.error("Please enter your tracking number");
      return;
    }

    try {
      setTrackedReport(null);

      const response = await API.get(
        `/baggage/track/${encodeURIComponent(trackingCode.trim())}`
      );

      setTrackedReport(response.data.report);
      toast.success("Baggage report found");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to find baggage report"
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === "Resolved" || status === "Ready for Collection") {
      return "status-success";
    }

    if (status === "Located" || status === "In Transit") {
      return "status-progress";
    }

    return "status-pending";
  };

  return (
    <main className="baggage-page">
      <section className="baggage-hero">
        <div>
          <span className="baggage-eyebrow">PASSENGER SUPPORT</span>

          <h1>Baggage Assistance</h1>

          <p>
            Report lost, delayed, or damaged baggage and check the
            progress of your complaint.
          </p>
        </div>

        <div className="baggage-hero-icon">🧳</div>
      </section>

      <section className="baggage-info-grid">
        <div className="baggage-info-card">
          <span>📝</span>
          <h3>Report an Issue</h3>
          <p>Submit details about your baggage problem.</p>
        </div>

        <div className="baggage-info-card">
          <span>🔎</span>
          <h3>Track Your Report</h3>
          <p>Use your tracking number to check progress.</p>
        </div>

        <div className="baggage-info-card">
          <span>📋</span>
          <h3>Report History</h3>
          <p>View your previously submitted complaints.</p>
        </div>
      </section>

      <div className="baggage-main-grid">
        <section className="baggage-panel">
          <h2>Report a Baggage Problem</h2>

          <p className="baggage-subtitle">
            Enter the details below to submit a new report.
          </p>

          <form onSubmit={handleSubmit} className="baggage-form">
            <label>
              Passenger Name *
              <input
                type="text"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleChange}
                placeholder="Enter passenger name"
                required
              />
            </label>

            <label>
              Booking Reference *
              <input
                type="text"
                name="bookingReference"
                value={formData.bookingReference}
                onChange={handleChange}
                placeholder="Example: ABC123"
                required
              />
            </label>

            <label>
              Baggage Tag Number *
              <input
                type="text"
                name="baggageTag"
                value={formData.baggageTag}
                onChange={handleChange}
                placeholder="Enter baggage tag number"
                required
              />
            </label>

            <label>
              Issue Type *
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
              >
                <option value="Lost">Lost Baggage</option>
                <option value="Delayed">Delayed Baggage</option>
                <option value="Damaged">Damaged Baggage</option>
                <option value="Missing Items">Missing Items</option>
              </select>
            </label>

            <label>
              Airport Code *
              <input
                type="text"
                name="airportCode"
                value={formData.airportCode}
                onChange={handleChange}
                placeholder="Example: BLR"
                maxLength={5}
                required
              />
            </label>

            <label>
              Flight Number
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                placeholder="Example: AI202"
              />
            </label>

            <label className="baggage-full-width">
              Describe the Problem *
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your baggage issue..."
                rows="4"
                maxLength={1000}
                required
              />
            </label>

            <button
              type="submit"
              className="baggage-submit-btn baggage-full-width"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Baggage Report"}
            </button>
          </form>
        </section>

        <section className="baggage-side-column">
          <div className="baggage-panel">
            <h2>Track Your Baggage</h2>

            <p className="baggage-subtitle">
              Enter the tracking number generated after submission.
            </p>

            <form onSubmit={handleTrack} className="baggage-track-form">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Example: BAG-A1B2C3D4"
              />

              <button type="submit" className="baggage-submit-btn">
                Track Report
              </button>
            </form>

            {trackedReport && (
              <div className="baggage-tracking-result">
                <h3>Report Details</h3>

                <p>
                  <strong>Tracking Number:</strong>
                  <br />
                  {trackedReport.trackingCode}
                </p>

                <p>
                  <strong>Issue:</strong> {trackedReport.issueType}
                </p>

                <p>
                  <strong>Airport:</strong> {trackedReport.airportCode}
                </p>

                <p>
                  <strong>Status:</strong>
                  <br />
                  <span className={getStatusClass(trackedReport.status)}>
                    {trackedReport.status}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="baggage-help-card">
            <h3>Need Help?</h3>
            <p>
              Keep your booking reference and baggage tag number
              available when contacting airport baggage services.
            </p>
            <span>✈️ Passenger Support</span>
          </div>
        </section>
      </div>

      <section className="baggage-panel baggage-history">
        <div className="baggage-history-heading">
          <div>
            <h2>My Baggage Reports</h2>
            <p className="baggage-subtitle">
              Your previously submitted baggage complaints.
            </p>
          </div>

          <button
            type="button"
            className="baggage-refresh-btn"
            onClick={fetchReports}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <p className="baggage-message">Loading your reports...</p>
        ) : reports.length === 0 ? (
          <p className="baggage-message">
            You have not submitted any baggage reports yet.
          </p>
        ) : (
          <div className="baggage-table-wrapper">
            <table className="baggage-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Issue Type</th>
                  <th>Airport</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.trackingCode}</td>
                    <td>{report.issueType}</td>
                    <td>{report.airportCode}</td>
                    <td>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={getStatusClass(report.status)}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="baggage-demo-note">
        Demonstration module: baggage reports and status updates are
        stored within this project and are not connected to live airline
        baggage tracking systems.
      </p>
    </main>
  );
};

export default Baggage;