
import IndoorNode from "../models/IndoorNode.js";

// Get all indoor locations for a terminal
export const getIndoorNodes = async (req, res) => {
  try {
    const { airportCode = "BLR", terminal, floor } = req.query;

    if (!terminal) {
      return res.status(400).json({
        success: false,
        message: "Please provide a terminal (T1 or T2)"
      });
    }

    const filter = {
      airportCode: airportCode.toUpperCase(),
      terminal: terminal.toUpperCase()
    };

    if (floor) {
      filter.floor = floor;
    }

    const nodes = await IndoorNode.find(filter)
      .select("-connections")
      .sort({ floor: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: nodes.length,
      nodes
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Find shortest route using Dijkstra's algorithm
export const findIndoorRoute = async (req, res) => {
  try {
    const {
      airportCode = "BLR",
      terminal,
      startNodeId,
      destinationNodeId
    } = req.body;

    if (!terminal || !startNodeId || !destinationNodeId) {
      return res.status(400).json({
        success: false,
        message: "Terminal, starting point and destination are required"
      });
    }

    const nodes = await IndoorNode.find({
      airportCode: airportCode.toUpperCase(),
      terminal: terminal.toUpperCase()
    });

    const nodeMap = new Map(
      nodes.map((node) => [node.nodeId, node])
    );

    const startNode = nodeMap.get(startNodeId);
    const destinationNode = nodeMap.get(destinationNodeId);

    if (!startNode || !destinationNode) {
      return res.status(404).json({
        success: false,
        message: "Starting point or destination was not found"
      });
    }

    // Initialize distances
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    for (const node of nodes) {
      distances[node.nodeId] = Infinity;
      previous[node.nodeId] = null;
      unvisited.add(node.nodeId);
    }

    distances[startNodeId] = 0;

    // Dijkstra algorithm
    while (unvisited.size > 0) {
      let currentNodeId = null;
      let shortestDistance = Infinity;

      for (const nodeId of unvisited) {
        if (distances[nodeId] < shortestDistance) {
          shortestDistance = distances[nodeId];
          currentNodeId = nodeId;
        }
      }

      if (
        currentNodeId === null ||
        shortestDistance === Infinity
      ) {
        break;
      }

      if (currentNodeId === destinationNodeId) {
        break;
      }

      unvisited.delete(currentNodeId);

      const currentNode = nodeMap.get(currentNodeId);

      for (const connection of currentNode.connections) {
        const neighborId = connection.nodeId;

        if (!unvisited.has(neighborId)) {
          continue;
        }

        const newDistance =
          distances[currentNodeId] + connection.distance;

        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = {
            nodeId: currentNodeId,
            instruction: connection.instruction,
            distance: connection.distance
          };
        }
      }
    }

    // Check whether a route exists
    if (distances[destinationNodeId] === Infinity) {
      return res.status(404).json({
        success: false,
        message: "No indoor route found between these locations"
      });
    }

    // Reconstruct route
    const routeIds = [];
    let currentId = destinationNodeId;

    while (currentId !== null) {
      routeIds.unshift(currentId);

      const previousStep = previous[currentId];
      currentId = previousStep
        ? previousStep.nodeId
        : null;
    }

    const route = routeIds.map((nodeId, index) => {
      const node = nodeMap.get(nodeId);
      const previousStep = previous[nodeId];

      return {
        nodeId: node.nodeId,
        name: node.name,
        category: node.category,
        floor: node.floor,
        x: node.x,
        y: node.y,
        instruction:
          index === 0
            ? "Start your journey here."
            : previousStep.instruction,
        distanceFromPrevious:
          index === 0 ? 0 : previousStep.distance
      };
    });

    return res.status(200).json({
      success: true,
      message: "Indoor route calculated successfully",
      terminal: terminal.toUpperCase(),
      start: startNode.name,
      destination: destinationNode.name,
      totalDistance: distances[destinationNodeId],
      totalStops: route.length,
      route
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
