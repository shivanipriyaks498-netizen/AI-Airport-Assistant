import express from "express";

import {
  sendMessage,
  getChatHistory
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a chatbot message
router.post("/message", protect, sendMessage);

// Get conversation history
router.get("/history", protect, getChatHistory);

export default router;