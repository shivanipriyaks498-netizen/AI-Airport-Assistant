
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";

import API from "../api/axios";
import toast from "react-hot-toast";
import IndoorNavigation from "./IndoorNavigation";

const AIRPORT_CENTER = [13.1986, 77.7066];

const categories = [
  "All",
  "Check-in",
  "Security",
  "Boarding Gate",
  "Baggage Claim",
  "Restroom",
  "Restaurant",
  "ATM",
  "Information Desk",
  "Medical",
  "Parking"
];

const categoryIcons = {
  "Check-in": "🎫",
  "Security": "🛂",
  "Boarding Gate": "✈️",
  "Baggage Claim": "🧳",
  "Restroom": "🚻",
  "Restaurant": "🍽️",
  "ATM": "🏧",
  "Information Desk": "ℹ️",
  "Medical": "🏥",
  "Parking": "🅿️",
  "Other": "📍"
};

// Move the map to the latest GPS coordinates.
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (
      position &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1])
    ) {
      map.flyTo(position, 17, {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, map]);

  return null;
}

function Navigation() {
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [terminal, setTerminal] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // GPS states
  const [userPosition, setUserPosition] = useState(null);
  const [userAccuracy, setUserAccuracy] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Live aircraft tracking states
  const [aircraft, setAircraft] = useState([]);
  const [aircraftLoading, setAircraftLoading] = useState(true);
  const [aircraftError, setAircraftError] = useState("");
  const [aircraftUpdatedAt, setAircraftUpdatedAt] = useState(null);

  // Fetch live aircraft from OpenSky.
  useEffect(() => {
    let isActive = true;

    const fetchAircraft = async () => {
      try {
        const response = await API.get("/aircraft/live", {
          params: {
            lamin: 12.7,
            lomin: 77.4,
            lamax: 13.2,
            lomax: 77.9
          }
        });

        if (isActive) {
          setAircraft(response.data.aircraft || []);
          setAircraftError("");
          setAircraftUpdatedAt(new Date());
        }
      } catch (error) {
        console.error("Aircraft tracking error:", error);

        if (isActive) {
          setAircraftError(
            error.response?.data?.message ||
            "Unable to load live aircraft"
          );
        }
      } finally {
        if (isActive) {
          setAircraftLoading(false);
        }
      }
    };

    fetchAircraft();

    const interval = setInterval(fetchAircraft, 20000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  // Load airport facilities from MongoDB.
  const fetchLocations = async () => {
    try {
      setLoading(true);

      const response = await API.get("/navigation", {
        params: {
          airportCode: "BLR",
          category,
          search,
          terminal
        }
      });

      setLocations(response.data.locations || []);
    } catch (error) {
      console.error("Navigation API Error:", error);
      console.error("Error response:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to load airport locations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [category, terminal]);

  // Search airport facilities.
  const handleSearch = (e) => {
    e.preventDefault();
    fetchLocations();
  };

  // Clear filters.
  const clearFilters = async () => {
    setCategory("All");
    setTerminal("All");
    setSearch("");

    try {
      setLoading(true);

      const response = await API.get("/navigation", {
        params: {
          airportCode: "BLR",
          category: "All",
          terminal: "All",
          search: ""
        }
      });

      setLocations(response.data.locations || []);
    } catch (error) {
      toast.error("Unable to reset filters");
    } finally {
      setLoading(false);
    }
  };

  // Get the best available live GPS location.
  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    if (!window.isSecureContext) {
      toast.error("Please open the app using its HTTPS address");
      return;
    }

    setGpsLoading(true);

    let bestPosition = null;
    let watchId = null;
    let timeoutId = null;
    let finished = false;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const displayPosition = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(accuracy) ||
        accuracy <= 0
      ) {
        return;
      }

      setUserPosition([latitude, longitude]);
      setUserAccuracy(accuracy);

      console.log("GPS coordinates:", {
        latitude,
        longitude,
        accuracy: `${accuracy.toFixed(1)} metres`
      });
    };

    const finishLocation = () => {
      if (finished) return;

      finished = true;
      cleanup();

      if (bestPosition) {
        displayPosition(bestPosition);

        const accuracy = bestPosition.coords.accuracy;

        if (accuracy <= 10) {
          toast.success(
            `Excellent GPS accuracy: ${accuracy.toFixed(1)} metres`
          );
        } else if (accuracy <= 20) {
          toast.success(
            `Good GPS accuracy: ${accuracy.toFixed(1)} metres`
          );
        } else {
          toast(
            `Best available accuracy: ${Math.round(accuracy)} metres. Try outdoors for a better GPS signal.`,
            {
              icon: "📍",
              duration: 6000
            }
          );
        }
      } else {
        toast.error(
          "No GPS position received. Please try again outdoors."
        );
      }

      setGpsLoading(false);
    };

    const handlePosition = (position) => {
      if (finished) return;

      const accuracy = position.coords.accuracy;

      if (!Number.isFinite(accuracy) || accuracy <= 0) {
        return;
      }

      // Keep the most accurate reading.
      if (
        !bestPosition ||
        accuracy < bestPosition.coords.accuracy
      ) {
        bestPosition = position;
      }

      // Update the map with the latest live reading.
      displayPosition(position);

      console.log(
        "Latest GPS accuracy:",
        accuracy.toFixed(1),
        "metres"
      );

      // Stop early only if accuracy reaches 10 metres or better.
      if (bestPosition.coords.accuracy <= 10) {
        finishLocation();
      }
    };

    const handleError = (error) => {
      if (finished) return;

      console.error("GPS error:", error);

      if (bestPosition) {
        finishLocation();
        return;
      }

      finished = true;
      cleanup();
      setGpsLoading(false);

      if (error.code === error.PERMISSION_DENIED) {
        toast.error(
          "Allow location permission in Chrome settings."
        );
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        toast.error(
          "GPS signal unavailable. Try outdoors."
        );
      } else {
        toast.error(
          "GPS request timed out. Please try again."
        );
      }
    };

    watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 65000,
        maximumAge: 0
      }
    );

    // Allow up to 60 seconds to obtain a better GPS reading.
    timeoutId = setTimeout(() => {
      finishLocation();
    }, 60000);
  };

  // Open destination in Google Maps.
  const openGoogleMaps = (location) => {
    const destination =
      `${location.facilityName}, ${location.terminal}, ` +
      "Kempegowda International Airport, Bengaluru";

    const url = userPosition
      ? `https://www.google.com/maps/dir/?api=1&origin=${userPosition[0]},${userPosition[1]}&destination=${encodeURIComponent(destination)}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="navigation-page">

      {/* Hero section */}
      <section className="navigation-hero">
        <p>AI AIRPORT ASSISTANT</p>
        <h1>Airport Navigation</h1>
        <span>
          Find airport facilities and get simple directions
          for your journey.
        </span>
      </section>

      {/* Outdoor navigation */}
      <section className="navigation-content">

        <h2>🗺️ Outdoor Navigation</h2>

        <p>
          View the airport area, find your current GPS location
          and track live aircraft.
        </p>

        <button
          className="primary-btn"
          onClick={locateMe}
          disabled={gpsLoading}
        >
          {gpsLoading
            ? "Finding your location..."
            : "📍 Locate Me"}
        </button>

        {gpsLoading && (
          <p className="navigation-message">
            Acquiring GPS signal. Keep your phone outdoors
            and stationary while we look for a more accurate reading.
          </p>
        )}

        {userPosition && (
          <div className="navigation-message">
            <p>
              <strong>Latitude:</strong>{" "}
              {userPosition[0].toFixed(7)}
            </p>

            <p>
              <strong>Longitude:</strong>{" "}
              {userPosition[1].toFixed(7)}
            </p>

            <p>
              <strong>GPS accuracy:</strong>{" "}
              Approximately {userAccuracy.toFixed(1)} metres
            </p>

            {userAccuracy <= 10 ? (
              <p>
                Excellent GPS signal! Your device reports
                accuracy within 10 metres.
              </p>
            ) : userAccuracy <= 20 ? (
              <p>
                Good GPS signal. Keep the phone outdoors
                for a chance to improve accuracy.
              </p>
            ) : (
              <p>
                GPS is still approximate. Keep your phone
                outdoors and try again.
              </p>
            )}
          </div>
        )}

        {!userPosition && (
          <p className="navigation-message">
            Press Locate Me and allow location permission
            to display your current position.
          </p>
        )}

        {/* Aircraft information */}
        <div className="navigation-message">
          <h3>✈️ Live Aircraft Tracking</h3>

          {aircraftLoading ? (
            <p>Loading live aircraft positions...</p>
          ) : (
            <>
              <p>
                <strong>Aircraft detected:</strong>{" "}
                {aircraft.length}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {aircraftError || "Live data connected"}
              </p>

              {aircraftUpdatedAt && (
                <p>
                  <strong>Last updated:</strong>{" "}
                  {aircraftUpdatedAt.toLocaleTimeString()}
                </p>
              )}

              <p>
                Positions refresh automatically every 20 seconds.
              </p>
            </>
          )}
        </div>

        {/* Map */}
        <div
          style={{
            width: "100%",
            height: "380px",
            marginTop: "20px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #ddd"
          }}
        >
          <MapContainer
            center={AIRPORT_CENTER}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater position={userPosition} />

            {/* GPS accuracy circle */}
            {userPosition && userAccuracy !== null && (
              <Circle
                center={userPosition}
                radius={userAccuracy}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.12,
                  weight: 1
                }}
              />
            )}

            {/* GPS location marker */}
            {userPosition && (
              <CircleMarker
                center={userPosition}
                radius={10}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                  weight: 3
                }}
              >
                <Popup>
                  <strong>Your current location</strong>

                  <p>
                    Latitude: {userPosition[0].toFixed(7)}
                  </p>

                  <p>
                    Longitude: {userPosition[1].toFixed(7)}
                  </p>

                  <p>
                    Accuracy: {userAccuracy.toFixed(1)} metres
                  </p>
                </Popup>
              </CircleMarker>
            )}

            {/* Live aircraft markers */}
            {aircraft.map((plane) => (
              <CircleMarker
                key={plane.icao24}
                center={[plane.latitude, plane.longitude]}
                radius={7}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: plane.onGround
                    ? "#16a34a"
                    : "#f97316",
                  fillOpacity: 1,
                  weight: 2
                }}
              >
                <Popup>
                  <div>
                    <h3>
                      ✈️ {plane.callsign || "Unknown Aircraft"}
                    </h3>

                    <p>
                      <strong>ICAO24:</strong> {plane.icao24}
                    </p>

                    <p>
                      <strong>Country:</strong> {plane.originCountry}
                    </p>

                    <p>
                      <strong>Altitude:</strong>{" "}
                      {plane.altitude !== null
                        ? `${Math.round(plane.altitude)} metres`
                        : "Not available"}
                    </p>

                    <p>
                      <strong>Speed:</strong>{" "}
                      {plane.velocity !== null
                        ? `${(plane.velocity * 3.6).toFixed(1)} km/h`
                        : "Not available"}
                    </p>

                    <p>
                      <strong>Heading:</strong>{" "}
                      {plane.heading !== null
                        ? `${Math.round(plane.heading)}°`
                        : "Not available"}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {plane.onGround ? "On Ground" : "In Air"}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <p className="navigation-message">
          Blue marker: Your GPS location.
          Orange markers: Aircraft in the air.
          Green markers: Aircraft on the ground.
        </p>
      </section>

      {/* Indoor navigation */}
      <section className="navigation-content">
        <IndoorNavigation />
      </section>

      {/* Facility search */}
      <section className="navigation-search-panel">
        <h2>Where do you want to go?</h2>

        <form
          className="navigation-search-form"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search check-in, ATM, restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit">
            Search
          </button>
        </form>

        <div className="navigation-filters">
          <div>
            <label>Airport</label>
            <input value="Bengaluru (BLR)" readOnly />
          </div>

          <div>
            <label>Terminal</label>

            <select
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
            >
              <option value="All">All Terminals</option>
              <option value="T1">Terminal 1</option>
              <option value="T2">Terminal 2</option>
            </select>
          </div>
        </div>
      </section>

      {/* Facility categories */}
      <section className="navigation-content">
        <h2>Explore Airport Facilities</h2>

        <div className="navigation-categories">
          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category-btn active-category"
                  : "category-btn"
              }
              onClick={() => setCategory(item)}
            >
              {item === "All" ? "🌐" : categoryIcons[item]}{" "}
              {item}
            </button>
          ))}
        </div>

        <div className="navigation-result-heading">
          <h2>Available Locations</h2>

          <button
            className="clear-filter-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        {loading && (
          <p className="navigation-message">
            Loading airport facilities...
          </p>
        )}

        {!loading && locations.length === 0 && (
          <div className="navigation-empty">
            <h3>No Locations Found</h3>
            <p>Try a different search or category.</p>
          </div>
        )}

        <div className="navigation-grid">
          {!loading && locations.map((location) => (
            <div
              className="navigation-card"
              key={location._id}
            >
              <div className="navigation-card-icon">
                {categoryIcons[location.category] || "📍"}
              </div>

              <div className="navigation-card-info">
                <span className="navigation-category">
                  {location.category}
                </span>

                <h3>{location.facilityName}</h3>

                <p>
                  <strong>Terminal:</strong> {location.terminal}
                </p>

                <p>
                  <strong>Floor:</strong> {location.floor}
                </p>

                <p>
                  <strong>Area:</strong> {location.area}
                </p>

                <button
                  className="directions-btn"
                  onClick={() => setSelectedLocation(location)}
                >
                  View Directions →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Directions popup */}
        {selectedLocation && (
          <div
            className="navigation-modal-overlay"
            onClick={() => setSelectedLocation(null)}
          >
            <div
              className="navigation-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedLocation(null)}
              >
                ✕
              </button>

              <div className="navigation-card-icon">
                {categoryIcons[selectedLocation.category] || "📍"}
              </div>

              <h2>{selectedLocation.facilityName}</h2>

              <p>{selectedLocation.airportName}</p>

              <div className="direction-detail">
                <strong>Terminal:</strong>
                <span>{selectedLocation.terminal}</span>
              </div>

              <div className="direction-detail">
                <strong>Floor:</strong>
                <span>{selectedLocation.floor}</span>
              </div>

              <div className="direction-detail">
                <strong>Area:</strong>
                <span>{selectedLocation.area}</span>
              </div>

              <div className="direction-detail">
                <strong>Nearby landmark:</strong>
                <span>
                  {selectedLocation.landmark || "Not specified"}
                </span>
              </div>

              <div className="directions-instruction">
                <h3>How to reach</h3>
                <p>{selectedLocation.directions}</p>
              </div>

              {selectedLocation.isDemo && (
                <p className="navigation-demo-label">
                  Demonstration location – verify directions
                  with airport staff.
                </p>
              )}

              <button
                className="directions-btn"
                onClick={() => openGoogleMaps(selectedLocation)}
              >
                Open in Google Maps →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Navigation;
