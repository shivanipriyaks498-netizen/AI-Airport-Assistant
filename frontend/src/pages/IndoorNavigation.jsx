
import { useEffect, useState } from "react";
import API from "../api/axios";

const floors = [
  "Ground Floor",
  "First Floor",
  "Second Floor"
];

function IndoorNavigation() {
  const [terminal, setTerminal] = useState("T1");
  const [floor, setFloor] = useState("Ground Floor");

  const [nodes, setNodes] = useState([]);
  const [startNodeId, setStartNodeId] = useState("");
  const [destinationNodeId, setDestinationNodeId] = useState("");

  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load indoor locations whenever terminal changes
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoading(true);
        setError("");
        setRoute([]);
        setRouteInfo(null);

        const response = await API.get(
          "/indoor-navigation/nodes",
          {
            params: {
              airportCode: "BLR",
              terminal
            }
          }
        );

        const fetchedNodes = response.data.nodes || [];

        setNodes(fetchedNodes);

        const start = fetchedNodes.find(
          (node) => node.nodeId === `${terminal.toLowerCase()}_entrance`
        );

        const destination = fetchedNodes.find(
          (node) => node.nodeId === `${terminal.toLowerCase()}_gate`
        );

        setStartNodeId(start?.nodeId || "");
        setDestinationNodeId(destination?.nodeId || "");

        setFloor("Ground Floor");

      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load indoor locations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [terminal]);

  // Calculate indoor route
  const handleFindRoute = async () => {
    try {
      if (!startNodeId || !destinationNodeId) {
        setError("Please select a starting point and destination.");
        return;
      }

      if (startNodeId === destinationNodeId) {
        setError("Starting point and destination cannot be the same.");
        return;
      }

      setLoading(true);
      setError("");
      setRoute([]);
      setRouteInfo(null);

      const response = await API.post(
        "/indoor-navigation/route",
        {
          airportCode: "BLR",
          terminal,
          startNodeId,
          destinationNodeId
        }
      );

      setRoute(response.data.route || []);
      setRouteInfo(response.data);

      // Show the floor containing the starting point
      const start = nodes.find(
        (node) => node.nodeId === startNodeId
      );

      if (start) {
        setFloor(start.floor);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to calculate the indoor route."
      );
    } finally {
      setLoading(false);
    }
  };

  const floorNodes = nodes.filter(
    (node) => node.floor === floor
  );

  const floorRoute = route.filter(
    (node) => node.floor === floor
  );

  const routePoints = floorRoute
    .map((node) => `${node.x},${node.y}`)
    .join(" ");

  const isRouteNode = (nodeId) =>
    route.some((item) => item.nodeId === nodeId);

  return (
    <div style={styles.container}>
      <h2>Indoor Airport Navigation</h2>

      <p style={styles.description}>
        Find your way inside the airport with floor-wise
        directions and route guidance.
      </p>

      {/* Terminal selection */}
      <div style={styles.controls}>
        <div>
          <label style={styles.label}>Select Terminal</label>

          <select
            style={styles.select}
            value={terminal}
            onChange={(e) => setTerminal(e.target.value)}
          >
            <option value="T1">Terminal 1</option>
            <option value="T2">Terminal 2</option>
          </select>
        </div>

        {/* Starting point */}
        <div>
          <label style={styles.label}>Starting Point</label>

          <select
            style={styles.select}
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
          >
            <option value="">Select starting point</option>

            {nodes.map((node) => (
              <option key={node.nodeId} value={node.nodeId}>
                {node.name} - {node.floor}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label style={styles.label}>Destination</label>

          <select
            style={styles.select}
            value={destinationNodeId}
            onChange={(e) =>
              setDestinationNodeId(e.target.value)
            }
          >
            <option value="">Select destination</option>

            {nodes.map((node) => (
              <option key={node.nodeId} value={node.nodeId}>
                {node.name} - {node.floor}
              </option>
            ))}
          </select>
        </div>

        <button
          style={styles.button}
          onClick={handleFindRoute}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Find Indoor Route"}
        </button>
      </div>

      {error && (
        <p style={styles.error}>{error}</p>
      )}

      {/* Floor selector */}
      <h3>Select Floor</h3>

      <div style={styles.floorButtons}>
        {floors.map((item) => (
          <button
            key={item}
            onClick={() => setFloor(item)}
            style={{
              ...styles.floorButton,
              background:
                floor === item ? "#174ea6" : "#e8eef8",
              color:
                floor === item ? "#ffffff" : "#174ea6"
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && nodes.length === 0 && (
        <p>Loading airport locations...</p>
      )}

      {/* Schematic indoor map */}
      <h3>{terminal} - {floor} Map</h3>

      <div style={styles.map}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={styles.svg}
        >
          {floorRoute.length > 1 && (
            <polyline
              points={routePoints}
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 1"
            />
          )}
        </svg>

        {floorNodes.map((node) => (
          <div
            key={node.nodeId}
            title={node.name}
            style={{
              ...styles.marker,
              left: `${node.x}%`,
              top: `${node.y}%`,
              background:
                node.nodeId === startNodeId
                  ? "#16a34a"
                  : node.nodeId === destinationNodeId
                  ? "#dc2626"
                  : isRouteNode(node.nodeId)
                  ? "#2563eb"
                  : "#64748b"
            }}
          >
            <span style={styles.markerDot}></span>
            <span style={styles.markerText}>
              {node.name}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.legend}>
        <span>🟢 Starting point</span>
        <span>🔴 Destination</span>
        <span>🔵 Route location</span>
        <span>⚪ Other locations</span>
      </div>

      {/* Route details */}
      {routeInfo && (
        <div style={styles.result}>
          <h3>Indoor Route Details</h3>

          <p>
            <strong>From:</strong> {routeInfo.start}
          </p>

          <p>
            <strong>To:</strong> {routeInfo.destination}
          </p>

          <p>
            <strong>Terminal:</strong> {routeInfo.terminal}
          </p>

          <p>
            <strong>Total route distance:</strong>{" "}
            {routeInfo.totalDistance} demo units
          </p>

          <p>
            <strong>Total stops:</strong> {routeInfo.totalStops}
          </p>

          <h4>Step-by-step Directions</h4>

          {route.map((step, index) => (
            <div key={step.nodeId} style={styles.step}>
              <strong>
                {index + 1}. {step.name}
              </strong>

              <p>{step.instruction}</p>

              <small>
                {step.floor}
                {step.distanceFromPrevious > 0
                  ? ` | ${step.distanceFromPrevious} demo units from previous location`
                  : ""}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1100px",
    margin: "20px auto",
    background: "#ffffff",
    borderRadius: "12px",
    color: "#1f2937"
  },
  description: {
    color: "#64748b"
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "15px",
    marginTop: "20px",
    alignItems: "end"
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "8px"
  },
  select: {
    width: "100%",
    padding: "11px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#ffffff"
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "7px",
    background: "#174ea6",
    color: "#ffffff",
    cursor: "pointer"
  },
  error: {
    color: "#dc2626",
    marginTop: "15px"
  },
  floorButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px"
  },
  floorButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer"
  },
  map: {
    position: "relative",
    width: "100%",
    height: "400px",
    border: "2px solid #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    backgroundImage:
      "linear-gradient(#dbe3ed 1px, transparent 1px), linear-gradient(90deg, #dbe3ed 1px, transparent 1px)",
    backgroundSize: "25px 25px",
    overflow: "hidden"
  },
  svg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    inset: 0,
    pointerEvents: "none"
  },
  marker: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    padding: "5px 7px",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "105px",
    zIndex: 1
  },
  markerDot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#ffffff",
    marginRight: "4px"
  },
  markerText: {
    overflowWrap: "anywhere"
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    margin: "15px 0"
  },
  result: {
    marginTop: "25px",
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "10px"
  },
  step: {
    padding: "12px",
    marginBottom: "10px",
    borderLeft: "4px solid #2563eb",
    background: "#ffffff",
    borderRadius: "5px"
  }
};

export default IndoorNavigation;
