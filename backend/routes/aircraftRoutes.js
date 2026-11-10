
import express from "express";
import { fetchAircraft } from "../controllers/aircraftController.js";

const router = express.Router();

// Get live aircraft positions
router.get("/live", fetchAircraft);

export default router;
