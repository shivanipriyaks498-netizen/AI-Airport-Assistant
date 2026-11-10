
import express from "express";

import {
  getAirportLocations,
  getAirportLocationById
} from "../controllers/navigationController.js";

const router = express.Router();

// Get and search airport facilities
router.get("/", getAirportLocations);

// Get one facility by ID
router.get("/:id", getAirportLocationById);

export default router;
