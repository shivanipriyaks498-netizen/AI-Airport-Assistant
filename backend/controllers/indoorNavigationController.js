
import IndoorNode from "../models/IndoorNode.js";

// ======================================
// GET INDOOR AIRPORT LOCATIONS
// ======================================

export const getIndoorNodes = async (req, res) => {
  try {
    const { airportCode, terminal, floor, category } = req.query;

    const query = {};

    if (airportCode) {
      query.airportCode = airportCode.trim().toUpperCase();
    }

    if (terminal) {
      query.terminal = terminal;
    }

    if (floor) {
      query.floor = floor;
    }

    if (category) {
      query.category = category;
    }

    const nodes = await IndoorNode.find(query).sort({
      terminal: 1,
      floor: 1,
      name: 1
    });

    return res.status(200).json({
      success: true,
      count: nodes.length,
      nodes
    });
  } catch (error) {
    console.error("Get indoor nodes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve indoor locations"
    });
  }
};

// ======================================
// FIND SHORTEST INDOOR ROUTE
// ======================================

export const findIndoorRoute = async (req, res) => {
  try {
    const {
      airportCode,
      terminal,
      startNodeId,
      endNodeId,
      fromNodeId,
      toNodeId,
      sourceNodeId,
      destinationNodeId
    } = req.body;

    const startId = startNodeId || fromNodeId || sourceNodeId;
    const endId = endNodeId || toNodeId || destinationNodeId;

    if (!startId || !endId) {
      return res.status(400).json({
        success: false,
        message: "Please provide startNodeId and endNodeId."
      });
    }

    if (startId === endId) {
      return res.status(400).json({
        success: false,
        message: "Starting point and destination must be different."
      });
    }

    const query = {};

    if (airportCode) {
      query.airportCode = airportCode.trim().toUpperCase();
    }

    if (terminal) {
      query.terminal = terminal;
    }

    const nodes = await IndoorNode.find(query).lean();

    const startNode = nodes.find(node => node.nodeId === startId);
    const endNode = nodes.find(node => node.nodeId === endId);

    if (!startNode || !endNode) {
      return res.status(404).json({
        success: false,
        message: "Starting point or destination was not found."
      });
    }

    if (
      startNode.airportCode !== endNode.airportCode ||
      startNode.terminal !== endNode.terminal ||
      startNode.floor !== endNode.floor
    ) {
      return res.status(400).json({
        success: false,
        message: "Both locations must be in the same airport, terminal and floor."
      });
    }

    // Dijkstra shortest-path algorithm
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set(nodes.map(node => node.nodeId));

    nodes.forEach(node => {
      distances.set(node.nodeId, Infinity);
    });

    distances.set(startId, 0);

    while (unvisited.size > 0) {
      let currentId = null;
      let shortestDistance = Infinity;

      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId);

        if (distance < shortestDistance) {
          shortestDistance = distance;
          currentId = nodeId;
        }
      }

      if (currentId === null || shortestDistance === Infinity) {
        break;
      }

      if (currentId === endId) {
        break;
      }

      unvisited.delete(currentId);

      const currentNode = nodes.find(
        node => node.nodeId === currentId
      );

      for (const connection of currentNode.connections || []) {
        const neighborId = connection.nodeId;

        if (!unvisited.has(neighborId)) {
          continue;
        }

        const weight = Number(connection.distance);

        if (!Number.isFinite(weight) || weight < 0) {
          continue;
        }

        const newDistance = shortestDistance + weight;

        if (newDistance < distances.get(neighborId)) {
          distances.set(neighborId, newDistance);

          previous.set(neighborId, {
            nodeId: currentId,
            instruction: connection.instruction || ""
          });
        }
      }
    }

    if (distances.get(endId) === Infinity) {
      return res.status(404).json({
        success: false,
        message: "No indoor route found between these locations."
      });
    }

    // Reconstruct route
    const path = [];
    let currentId = endId;

    while (currentId) {
      const node = nodes.find(
        item => item.nodeId === currentId
      );

      path.unshift({
        nodeId: node.nodeId,
        name: node.name,
        category: node.category,
        floor: node.floor,
        x: node.x,
        y: node.y,
        instruction:
          previous.get(currentId)?.instruction || ""
      });

      if (currentId === startId) {
        break;
      }

      currentId = previous.get(currentId)?.nodeId;
    }

    return res.status(200).json({
      success: true,
      message: "Indoor route calculated successfully",
      airportCode: startNode.airportCode,
      terminal: startNode.terminal,
      totalDistance: distances.get(endId),
      route: path
    });

  } catch (error) {
    console.error("Indoor route error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate indoor route"
    });
  }
};
