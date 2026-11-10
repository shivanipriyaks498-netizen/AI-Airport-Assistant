
import "dotenv/config";
import mongoose from "mongoose";
import IndoorNode from "./models/IndoorNode.js";

const createTerminalNodes = (terminal) => {
  const prefix = terminal.toLowerCase();

  const nodes = [
    // GROUND FLOOR
    {
      nodeId: `${prefix}_entrance`,
      airportCode: "BLR",
      terminal,
      floor: "Ground Floor",
      name: "Main Entrance",
      category: "Entrance",
      x: 10,
      y: 50
    },
    {
      nodeId: `${prefix}_checkin`,
      airportCode: "BLR",
      terminal,
      floor: "Ground Floor",
      name: "Check-in Counter",
      category: "Check-in",
      x: 35,
      y: 50
    },
    {
      nodeId: `${prefix}_information`,
      airportCode: "BLR",
      terminal,
      floor: "Ground Floor",
      name: "Information Desk",
      category: "Information Desk",
      x: 35,
      y: 20
    },
    {
      nodeId: `${prefix}_restroom_g`,
      airportCode: "BLR",
      terminal,
      floor: "Ground Floor",
      name: "Passenger Restroom",
      category: "Restroom",
      x: 65,
      y: 20
    },
    {
      nodeId: `${prefix}_elevator_g`,
      airportCode: "BLR",
      terminal,
      floor: "Ground Floor",
      name: "Elevator",
      category: "Elevator",
      x: 80,
      y: 50
    },

    // FIRST FLOOR
    {
      nodeId: `${prefix}_elevator_f`,
      airportCode: "BLR",
      terminal,
      floor: "First Floor",
      name: "Elevator",
      category: "Elevator",
      x: 80,
      y: 50
    },
    {
      nodeId: `${prefix}_security`,
      airportCode: "BLR",
      terminal,
      floor: "First Floor",
      name: "Security Check",
      category: "Security",
      x: 55,
      y: 50
    },
    {
      nodeId: `${prefix}_gate`,
      airportCode: "BLR",
      terminal,
      floor: "First Floor",
      name: "Boarding Gate",
      category: "Boarding Gate",
      x: 30,
      y: 50
    },
    {
      nodeId: `${prefix}_food`,
      airportCode: "BLR",
      terminal,
      floor: "First Floor",
      name: "Food Court",
      category: "Restaurant",
      x: 55,
      y: 20
    },

    // SECOND FLOOR
    {
      nodeId: `${prefix}_elevator_s`,
      airportCode: "BLR",
      terminal,
      floor: "Second Floor",
      name: "Elevator",
      category: "Elevator",
      x: 80,
      y: 50
    },
    {
      nodeId: `${prefix}_restaurant`,
      airportCode: "BLR",
      terminal,
      floor: "Second Floor",
      name: "Restaurant",
      category: "Restaurant",
      x: 50,
      y: 50
    },
    {
      nodeId: `${prefix}_atm`,
      airportCode: "BLR",
      terminal,
      floor: "Second Floor",
      name: "ATM",
      category: "ATM",
      x: 25,
      y: 50
    }
  ];

  // Connect two locations in both directions.
  const connect = (from, to, distance, instruction) => {
    const first = nodes.find((node) => node.nodeId === `${prefix}_${from}`);
    const second = nodes.find((node) => node.nodeId === `${prefix}_${to}`);

    first.connections = first.connections || [];
    second.connections = second.connections || [];

    first.connections.push({
      nodeId: second.nodeId,
      distance,
      instruction
    });

    second.connections.push({
      nodeId: first.nodeId,
      distance,
      instruction: `Walk back towards ${first.name}.`
    });
  };

  // Ground-floor paths
  connect("entrance", "checkin", 20, "Walk straight towards the check-in counter.");
  connect("checkin", "information", 12, "Turn towards the information desk.");
  connect("information", "restroom_g", 10, "Continue along the ground-floor corridor.");
  connect("restroom_g", "elevator_g", 15, "Follow the corridor towards the elevator.");
  connect("checkin", "elevator_g", 18, "Walk towards the elevator.");

  // First-floor paths
  connect("elevator_f", "security", 15, "Exit the elevator and follow the corridor.");
  connect("security", "gate", 20, "Continue towards the boarding gate.");
  connect("security", "food", 12, "Turn towards the food court.");

  // Second-floor paths
  connect("elevator_s", "restaurant", 15, "Walk towards the restaurant.");
  connect("restaurant", "atm", 12, "Continue towards the ATM.");

  // Vertical paths between floors
  connect("elevator_g", "elevator_f", 5, "Use the elevator to reach the first floor.");
  connect("elevator_f", "elevator_s", 5, "Use the elevator to reach the second floor.");

  return nodes.map((node) => ({
    ...node,
    connections: node.connections || [],
    isDemo: true
  }));
};

const seedIndoorNavigation = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB for indoor navigation");

    const locations = [
      ...createTerminalNodes("T1"),
      ...createTerminalNodes("T2")
    ];

    for (const location of locations) {
      await IndoorNode.updateOne(
        { nodeId: location.nodeId },
        { $set: location },
        { upsert: true }
      );
    }

    console.log(
      `${locations.length} indoor navigation nodes added or updated successfully!`
    );

  } catch (error) {
    console.error("Indoor navigation seeding failed:", error.message);

  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
};

seedIndoorNavigation();
