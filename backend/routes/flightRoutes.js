
import express from "express";

import {
  searchFlights,
  getFlightById
} from "../controllers/flightController.js";

import {
  getLiveFlights
} from "../controllers/aviationstackController.js";

const router = express.Router();

// Search existing flights
router.get("/", searchFlights);

// Search real-time flights using Aviationstack
router.get("/live/search", getLiveFlights);

// Get one flight by ID
router.get("/:id", getFlightById);

export default router;
