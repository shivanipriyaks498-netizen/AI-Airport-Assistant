import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import {
  getAdminStats,
  getAllPassengers,
  getAllBaggageReports,
  updateBaggageStatus
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require login and admin permission
router.use(protect, adminOnly);

router.get("/stats", getAdminStats);

router.get("/passengers", getAllPassengers);

router.get("/baggage", getAllBaggageReports);

router.patch("/baggage/:id/status", updateBaggageStatus);

export default router;