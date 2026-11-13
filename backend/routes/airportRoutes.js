
import express from "express";

import {
  getAirports,
  getNearbyAirports
} from "../controllers/airportController.js";

const router = express.Router();

// Search airports by name, city or code
router.get("/search", getAirports);

// Find nearby airports using GPS coordinates
router.get("/nearby", getNearbyAirports);

export default router;
