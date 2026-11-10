import flightRoutes from "./routes/flightRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import navigationRoutes from "./routes/navigationRoutes.js";
import indoorNavigationRoutes from "./routes/indoorNavigationRoutes.js";
import baggageRoutes from "./routes/baggageRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aircraftRoutes from "./routes/aircraftRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/indoor-navigation", indoorNavigationRoutes);
app.use("/api/baggage", baggageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/aircraft", aircraftRoutes);

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

// Connect MongoDB and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
