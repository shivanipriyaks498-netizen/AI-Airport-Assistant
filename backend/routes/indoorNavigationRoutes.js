
import express from "express";

import {
  getIndoorNodes,
  findIndoorRoute
} from "../controllers/indoorNavigationController.js";

const router = express.Router();

// Get indoor locations
router.get("/nodes", getIndoorNodes);

// Calculate shortest indoor route
router.post("/route", findIndoorRoute);

export default router;
