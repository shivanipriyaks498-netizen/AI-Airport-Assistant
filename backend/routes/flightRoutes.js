
import express from "express";

import {
  searchFlights,
  getFlightById,
  addFlight,
  updateFlight,
  deleteFlight
} from "../controllers/flightController.js";

import {
  getLiveFlights
} from "../controllers/aviationstackController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public flight routes
router.get("/", searchFlights);
router.get("/live/search", getLiveFlights);
router.get("/:id", getFlightById);

// Admin-only flight management routes
router.post("/", protect, adminOnly, addFlight);
router.put("/:id", protect, adminOnly, updateFlight);
router.delete("/:id", protect, adminOnly, deleteFlight);

export default router;
