
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { loadAirports } from "./services/airportService.js";

import authRoutes from "./routes/authRoutes.js";
import flightRoutes from "./routes/flightRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import baggageRoutes from "./routes/baggageRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aircraftRoutes from "./routes/aircraftRoutes.js";
import airportRoutes from "./routes/airportRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/baggage", baggageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/aircraft", aircraftRoutes);
app.use("/api/airports", airportRoutes);

// Homepage route
app.get("/", (req, res) => {
  res.send("Welcome to AI Airport Assistant Backend!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Airport Assistant server is running!"
  });
});

const PORT = process.env.PORT || 5000;

// Connect database, load airports and start server
const startServer = async () => {
  try {
    await connectDB();

    await loadAirports();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
