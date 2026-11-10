import express from "express";

import {
  createBaggageReport,
  getMyBaggageReports,
  trackBaggageReport
} from "../controllers/baggageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/report", protect, createBaggageReport);
router.get("/my-reports", protect, getMyBaggageReports);
router.get("/track/:trackingCode", protect, trackBaggageReport);

export default router;