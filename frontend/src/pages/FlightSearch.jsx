
import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function FlightSearch() {
  const [formData, setFormData] = useState({
    flightNumber: "",
    from: "",
    to: ""
  });

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Update search inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.toUpperCase()
    });
  };

  // Search live flights
  const handleSearch = async (e) => {
    e.preventDefault();

    const flightNumber = formData.flightNumber.trim();
    const from = formData.from.trim();
    const to = formData.to.trim();

    if (!flightNumber && !from && !to) {
      toast.error("Enter a flight number or airport code");
      return;
    }

    if (from && !/^[A-Z]{3}$/.test(from)) {
      toast.error("Departure airport must be a 3-letter code");
      return;
    }

    if (to && !/^[A-Z]{3}$/.test(to)) {
      toast.error("Arrival airport must be a 3-letter code");
      return;
    }

    if (from && to && from === to) {
      toast.error("Departure and arrival airports must be different");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      setFlights([]);

      const response = await API.get("/flights/live/search", {
        params: {
          ...(flightNumber && { flightNumber }),
          ...(from && { departure: from }),
          ...(to && { arrival: to })
        }
      });

      const results = response.data.flights || [];

      setFlights(results);

      if (results.length === 0) {
        toast.error("No live flights found");
      } else {
        toast.success(`${results.length} live flight(s) found!`);
      }

    } catch (error) {
      console.error("Live flight search error:", error);

      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to retrieve live flights"
      );

    } finally {
      setLoading(false);
    }
  };

  // Format date and time
  const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  // Get flight status class
  const getStatusClass = (status) => {
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case "scheduled":
        return "status-scheduled";
      case "active":
        return "status-departed";
      case "landed":
        return "status-arrived";
      case "cancelled":
        return "status-cancelled";
      case "incident":
      case "diverted":
        return "status-delayed";
      default:
        return "";
    }
  };

  // Display flight status
  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flight-page">

      {/* Page heading */}
      <section className="flight-hero">
        <p>AI AIRPORT ASSISTANT</p>
        <h1>Find Your Flight</h1>
        <span>
          Search real-time flight information using a
          flight number or airport codes.
        </span>
      </section>

      {/* Search form */}
      <section className="flight-search-panel">

        <h2>Search Live Flights</h2>

        <form
          className="flight-form"
          onSubmit={handleSearch}
        >

          <div>
            <label>Flight Number</label>
            <input
              type="text"
              name="flightNumber"
              placeholder="Example: AI101"
              value={formData.flightNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>From Airport</label>
            <input
              type="text"
              name="from"
              placeholder="Example: BLR"
              value={formData.from}
              onChange={handleChange}
              maxLength={3}
            />
          </div>

          <div>
            <label>To Airport</label>
            <input
              type="text"
              name="to"
              placeholder="Example: DEL"
              value={formData.to}
              onChange={handleChange}
              maxLength={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search Live Flights"}
          </button>

        </form>

        <p className="airport-hint">
          BLR – Bengaluru | DEL – Delhi |
          BOM – Mumbai | HYD – Hyderabad
        </p>

      </section>

      {/* Search results */}
      <section className="flight-results">

        <h2>Live Flight Results</h2>

        <p className="demo-notice">
          Live flight information is retrieved from Aviationstack.
          Flight availability and details depend on provider coverage.
        </p>

        {loading && (
          <p className="flight-message">
            Connecting to live flight data...
          </p>
        )}

        {!loading && searched && flights.length === 0 && (
          <div className="no-flights">
            <h3>No Live Flights Found</h3>
            <p>
              Try another flight number or airport combination.
            </p>
          </div>
        )}

        <div className="flight-results-grid">

          {flights.map((flight, index) => {

            const flightNumber =
              flight.flight?.iata ||
              flight.flight?.number ||
              "Not available";

            const airline =
              flight.airline?.name || "Airline not available";

            const departure = flight.departure || {};
            const arrival = flight.arrival || {};

            const status = flight.flight_status;

            return (
              <div
                className="flight-card"
                key={flight.flight?.icao || flightNumber + index}
              >

                <div className="flight-card-top">

                  <div>
                    <h3>{airline}</h3>
                    <p>{flightNumber}</p>
                  </div>

                  <span
                    className={`flight-status ${getStatusClass(status)}`}
                  >
                    {getStatusLabel(status)}
                  </span>

                </div>

                <div className="flight-route">

                  <div>
                    <h2>
                      {departure.iata || "N/A"}
                    </h2>
                    <p>
                      {formatDateTime(
                        departure.estimated ||
                        departure.scheduled ||
                        departure.actual
                      )}
                    </p>
                  </div>

                  <div className="flight-line">
                    <span>✈</span>
                    <div></div>
                  </div>

                  <div>
                    <h2>
                      {arrival.iata || "N/A"}
                    </h2>
                    <p>
                      {formatDateTime(
                        arrival.estimated ||
                        arrival.scheduled ||
                        arrival.actual
                      )}
                    </p>
                  </div>

                </div>

                <div className="flight-details">

                  <p>
                    <strong>Departure Airport:</strong>{" "}
                    {departure.airport || "Not available"}
                  </p>

                  <p>
                    <strong>Arrival Airport:</strong>{" "}
                    {arrival.airport || "Not available"}
                  </p>

                  <p>
                    <strong>Departure Terminal:</strong>{" "}
                    {departure.terminal || "Not available"}
                  </p>

                  <p>
                    <strong>Departure Gate:</strong>{" "}
                    {departure.gate || "Not available"}
                  </p>

                  <p>
                    <strong>Arrival Terminal:</strong>{" "}
                    {arrival.terminal || "Not available"}
                  </p>

                  <p>
                    <strong>Arrival Gate:</strong>{" "}
                    {arrival.gate || "Not available"}
                  </p>

                </div>

                <p className="demo-label">
                  Live provider data
                </p>

              </div>
            );
          })}

        </div>

        {!searched && (
          <div className="flight-empty">
            <span>✈️</span>
            <h3>Your Journey Starts Here</h3>
            <p>
              Enter a flight number, departure airport,
              or arrival airport to find live flight information.
            </p>
          </div>
        )}

      </section>

    </div>
  );
}

export default FlightSearch;
