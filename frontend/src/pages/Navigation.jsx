
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

const DEFAULT_MAP_CENTER = [20, 0];

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

// Adjust map view when airport or GPS position changes.
function MapUpdater({ airportCenter, userPosition }) {
  const map = useMap();

  useEffect(() => {
    if (airportCenter && userPosition) {
      map.fitBounds(
        [airportCenter, userPosition],
        {
          padding: [40, 40],
          maxZoom: 13,
          animate: true
        }
      );
    } else if (airportCenter) {
      map.flyTo(airportCenter, 13, {
        animate: true,
        duration: 1.5
      });
    } else if (userPosition) {
      map.flyTo(userPosition, 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [airportCenter, userPosition, map]);

  return null;
}

function Navigation() {
  // Airport facility states
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [terminal, setTerminal] = useState("All");
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Selected airport states
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [nearbyAirports, setNearbyAirports] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // Worldwide airport search states
  const [airportSearch, setAirportSearch] = useState("");
  const [airportSearchResults, setAirportSearchResults] = useState([]);
  const [airportSearchLoading, setAirportSearchLoading] = useState(false);

  // GPS states
  const [userPosition, setUserPosition] = useState(null);
  const [userAccuracy, setUserAccuracy] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Aircraft states
  const [aircraft, setAircraft] = useState([]);
  const [aircraftLoading, setAircraftLoading] = useState(false);
  const [aircraftError, setAircraftError] = useState("");
  const [aircraftUpdatedAt, setAircraftUpdatedAt] = useState(null);

  // Convert selected airport coordinates to numbers.
  const airportCenter =
    selectedAirport &&
    Number.isFinite(Number(selectedAirport.latitude)) &&
    Number.isFinite(Number(selectedAirport.longitude))
      ? [
          Number(selectedAirport.latitude),
          Number(selectedAirport.longitude)
        ]
      : null;

  // Select an airport.
  const handleAirportSelect = (airport) => {
    setSelectedAirport(airport);
    setAirportSearchResults([]);
    setAirportSearch("");
    setSelectedLocation(null);

    setCategory("All");
    setTerminal("All");
    setSearch("");

    toast.success(
      `${airport.name} (${airport.iataCode}) selected`
    );
  };

  // Find airports near the user's GPS coordinates.
  const findNearbyAirports = async (latitude, longitude) => {
    try {
      setNearbyLoading(true);

      const response = await API.get("/airports/nearby", {
        params: {
          latitude,
          longitude,
          radiusKm: 150
        }
      });

      const airports = response.data.airports || [];

      setNearbyAirports(airports);

      if (airports.length > 0) {
        handleAirportSelect(airports[0]);

        toast.success(
          `${airports.length} nearby airport(s) found`
        );
      } else {
        setSelectedAirport(null);

        toast(
          "No airports found within 150 km. Search for an airport manually.",
          {
            icon: "✈️",
            duration: 6000
          }
        );
      }
    } catch (error) {
      console.error("Nearby airport error:", error);

      toast.error(
        error.response?.data?.message ||
        "Unable to find nearby airports"
      );
    } finally {
      setNearbyLoading(false);
    }
  };

  // Search airports worldwide by name, city or IATA code.
  const handleAirportSearch = async (e) => {
    e.preventDefault();

    if (!airportSearch.trim()) {
      toast.error("Enter an airport name, city or code");
      return;
    }

    try {
      setAirportSearchLoading(true);

      const response = await API.get("/airports/search", {
        params: {
          search: airportSearch.trim()
        }
      });

      const results = response.data.airports || [];

      setAirportSearchResults(results);

      if (results.length === 0) {
        toast.error("No matching airports found");
      }
    } catch (error) {
      console.error("Airport search error:", error);

      toast.error(
        error.response?.data?.message ||
        "Unable to search airports"
      );
    } finally {
      setAirportSearchLoading(false);
    }
  };

  // Fetch live aircraft around the selected airport.
  useEffect(() => {
    let isActive = true;

    if (!airportCenter || !selectedAirport) {
      setAircraft([]);
      setAircraftLoading(false);
      setAircraftError("");
      setAircraftUpdatedAt(null);

      return () => {
        isActive = false;
      };
    }

    const fetchAircraft = async () => {
      try {
        if (isActive) {
          setAircraftLoading(true);
        }

        const latitude = airportCenter[0];
        const longitude = airportCenter[1];

        // Search approximately 55 km around the airport.
        const response = await API.get("/aircraft/live", {
          params: {
            lamin: Math.max(-90, latitude - 0.5),
            lomin: Math.max(-180, longitude - 0.5),
            lamax: Math.min(90, latitude + 0.5),
            lomax: Math.min(180, longitude + 0.5)
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
  }, [selectedAirport?.iataCode]);

  // Load facilities belonging to the selected airport.
  useEffect(() => {
    let isActive = true;

    const fetchLocations = async () => {
      if (!selectedAirport) {
        setLocations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await API.get("/navigation", {
          params: {
            airportCode: selectedAirport.iataCode,
            category,
            search,
            terminal
          }
        });

        if (isActive) {
          setLocations(response.data.locations || []);
        }
      } catch (error) {
        console.error("Navigation API Error:", error);
        console.error("Error response:", error.response?.data);

        if (isActive) {
          setLocations([]);

          toast.error(
            error.response?.data?.message ||
            error.message ||
            "Unable to load airport locations"
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchLocations();

    return () => {
      isActive = false;
    };
  }, [selectedAirport?.iataCode, category, terminal]);

  // Search airport facilities.
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!selectedAirport) {
      toast.error("Please select an airport first");
      return;
    }

    try {
      setLoading(true);

      const response = await API.get("/navigation", {
        params: {
          airportCode: selectedAirport.iataCode,
          category,
          search,
          terminal
        }
      });

      setLocations(response.data.locations || []);
    } catch (error) {
      console.error("Facility search error:", error);

      toast.error(
        error.response?.data?.message ||
        "Unable to search facilities"
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear facility filters.
  const clearFilters = () => {
    setCategory("All");
    setTerminal("All");
    setSearch("");
    setSelectedLocation(null);
  };

  // Get GPS location and immediately search nearby airports.
  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    if (!window.isSecureContext) {
      toast.error("Please open the app using localhost or HTTPS");
      return;
    }

    setGpsLoading(true);

    toast.loading("Detecting your location...", {
      id: "gps-status"
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setUserPosition([latitude, longitude]);
        setUserAccuracy(accuracy);

        toast.success(
          "Location detected! Finding nearby airports...",
          {
            id: "gps-status",
            duration: 3000
          }
        );

        try {
          await findNearbyAirports(latitude, longitude);
        } finally {
          setGpsLoading(false);
        }
      },

      (error) => {
        console.error("GPS error:", error);

        setGpsLoading(false);
        toast.dismiss("gps-status");

        if (error.code === error.PERMISSION_DENIED) {
          toast.error(
            "Please allow location permission in browser settings."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error(
            "GPS location unavailable. Please try outdoors."
          );
        } else {
          toast.error(
            "Location request timed out. Please try again."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  // Open the selected facility in Google Maps.
  const openGoogleMaps = (location) => {
    if (!selectedAirport) {
      toast.error("Please select an airport first");
      return;
    }

    const airportDescription = [
      selectedAirport.name,
      selectedAirport.city,
      selectedAirport.country
    ].filter(Boolean).join(", ");

    const destination =
      `${location.facilityName}, ${location.terminal}, ` +
      airportDescription;

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
          for your journey anywhere in the world.
        </span>
      </section>

      {/* Outdoor navigation */}
      <section className="navigation-content">

        <h2>🗺️ Outdoor Navigation</h2>

        <p>
          Detect your current location, find nearby airports
          and explore airport areas around the world.
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
            Detecting GPS coordinates and searching for nearby airports...
          </p>
        )}

        {/* GPS information */}
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
              Approximately {userAccuracy?.toFixed(1)} metres
            </p>

            {userAccuracy <= 10 ? (
              <p>Excellent GPS signal!</p>
            ) : userAccuracy <= 20 ? (
              <p>Good GPS signal.</p>
            ) : (
              <p>
                GPS is approximate. Try again outdoors
                for a better signal.
              </p>
            )}
          </div>
        )}

        {!userPosition && (
          <p className="navigation-message">
            Press Locate Me and allow location permission
            to detect nearby airports.
          </p>
        )}

        {/* Nearby airports */}
        <div className="navigation-message">
          <h3>✈️ Nearby Airports</h3>

          {nearbyLoading ? (
            <p>Searching for nearby airports...</p>
          ) : nearbyAirports.length > 0 ? (
            <>
              <p>
                Select an airport to explore its map and facilities.
              </p>

              <select
                value={selectedAirport?.iataCode || ""}
                onChange={(e) => {
                  const airport = nearbyAirports.find(
                    (item) => item.iataCode === e.target.value
                  );

                  if (airport) {
                    handleAirportSelect(airport);
                  }
                }}
              >
                <option value="">
                  Choose a nearby airport
                </option>

                {nearbyAirports.map((airport) => (
                  <option
                    key={airport.iataCode}
                    value={airport.iataCode}
                  >
                    {airport.name} ({airport.iataCode}) —{" "}
                    {airport.distanceKm} km
                  </option>
                ))}
              </select>
            </>
          ) : (
            <p>
              No nearby airports detected yet. Use Locate Me
              or search for an airport below.
            </p>
          )}
        </div>

        {/* Worldwide airport search */}
        <div className="navigation-message">
          <h3>🌍 Search Airports Worldwide</h3>

          <form
            onSubmit={handleAirportSearch}
            className="navigation-search-form"
          >
            <input
              type="text"
              placeholder="Airport name, city or code (e.g. Heathrow, London, DXB)"
              value={airportSearch}
              onChange={(e) => setAirportSearch(e.target.value)}
            />

            <button
              type="submit"
              disabled={airportSearchLoading}
            >
              {airportSearchLoading
                ? "Searching..."
                : "Find Airport"}
            </button>
          </form>

          {airportSearchResults.length > 0 && (
            <div className="navigation-grid">
              {airportSearchResults.map((airport, index) => (
                <div
                  className="navigation-card"
                  key={`${airport.iataCode}-${index}`}
                >
                  <div className="navigation-card-info">
                    <h3>{airport.name}</h3>

                    <p>
                      <strong>Code:</strong> {airport.iataCode}
                    </p>

                    <p>
                      <strong>City:</strong>{" "}
                      {airport.city || "Not available"}
                    </p>

                    <p>
                      <strong>Country:</strong>{" "}
                      {airport.country || "Not available"}
                    </p>

                    <button
                      className="directions-btn"
                      onClick={() => handleAirportSelect(airport)}
                    >
                      Select Airport →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected airport */}
        {selectedAirport && (
          <div className="navigation-message">
            <h3>📍 Selected Airport</h3>

            <p>
              <strong>Name:</strong> {selectedAirport.name}
            </p>

            <p>
              <strong>Airport Code:</strong> {selectedAirport.iataCode}
            </p>

            <p>
              <strong>City:</strong>{" "}
              {selectedAirport.city || "Not available"}
            </p>

            <p>
              <strong>Country:</strong>{" "}
              {selectedAirport.country || "Not available"}
            </p>
          </div>
        )}

        {/* Aircraft information */}
        <div className="navigation-message">
          <h3>✈️ Live Aircraft Tracking</h3>

          {!selectedAirport ? (
            <p>Select an airport to load aircraft around it.</p>
          ) : aircraftLoading ? (
            <p>
              Loading aircraft near {selectedAirport.iataCode}...
            </p>
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
                Aircraft positions refresh automatically every 20 seconds.
              </p>
            </>
          )}
        </div>

        {/* Outdoor map */}
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
            key={selectedAirport?.iataCode || "world-map"}
            center={
              airportCenter ||
              userPosition ||
              DEFAULT_MAP_CENTER
            }
            zoom={
              airportCenter
                ? 13
                : userPosition
                ? 15
                : 3
            }
            style={{
              height: "100%",
              width: "100%"
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater
              airportCenter={airportCenter}
              userPosition={userPosition}
            />

            {/* Selected airport marker */}
            {airportCenter && (
              <CircleMarker
                center={airportCenter}
                radius={12}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#16a34a",
                  fillOpacity: 1,
                  weight: 3
                }}
              >
                <Popup>
                  <strong>{selectedAirport.name}</strong>
                  <p>
                    Airport Code: {selectedAirport.iataCode}
                  </p>
                  <p>{selectedAirport.city}</p>
                </Popup>
              </CircleMarker>
            )}

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

            {/* User GPS marker */}
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
                    Accuracy: {userAccuracy?.toFixed(1)} metres
                  </p>
                </Popup>
              </CircleMarker>
            )}

            {/* Aircraft markers */}
            {aircraft.map((plane) => {
              if (
                !Number.isFinite(Number(plane.latitude)) ||
                !Number.isFinite(Number(plane.longitude))
              ) {
                return null;
              }

              return (
                <CircleMarker
                  key={plane.icao24}
                  center={[
                    Number(plane.latitude),
                    Number(plane.longitude)
                  ]}
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
                        {plane.onGround
                          ? "On Ground"
                          : "In Air"}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <p className="navigation-message">
          Green marker: Selected airport.
          Blue marker: Your GPS location.
          Orange markers: Aircraft in the air.
          Green aircraft markers: Aircraft on the ground.
        </p>
      </section>

      {/* Indoor airport facilities */}
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

          <button
            type="submit"
            disabled={!selectedAirport}
          >
            Search
          </button>
        </form>

        <div className="navigation-filters">
          <div>
            <label>Airport</label>

            <input
              value={
                selectedAirport
                  ? `${selectedAirport.name} (${selectedAirport.iataCode})`
                  : "Select an airport first"
              }
              readOnly
            />
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

      {/* Indoor facility categories */}
      <section className="navigation-content">
        <h2>Explore Indoor Airport Facilities</h2>

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

        {!selectedAirport && (
          <div className="navigation-empty">
            <h3>Select an Airport</h3>
            <p>
              Use Locate Me or search worldwide to select
              an airport and view its facilities.
            </p>
          </div>
        )}

        {selectedAirport && loading && (
          <p className="navigation-message">
            Loading facilities for {selectedAirport.iataCode}...
          </p>
        )}

        {selectedAirport && !loading && locations.length === 0 && (
          <div className="navigation-empty">
            <h3>No Facility Data Available</h3>
            <p>
              Facility information has not yet been added
              for {selectedAirport.name}. Indoor facility
              information will appear when data is available
              for this airport.
            </p>
          </div>
        )}

        <div className="navigation-grid">
          {selectedAirport && !loading && locations.map((location) => (
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

        {/* Facility details popup */}
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
