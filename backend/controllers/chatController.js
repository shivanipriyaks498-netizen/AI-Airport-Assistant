import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import Chat from "../models/Chat.js";

// Initialize Gemini after environment variables are loaded
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  : null;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const GEMINI_TIMEOUT = 30000;

// Quick replies for simple greetings and identity questions
const getQuickReply = (message) => {
  const text = message
    .toLowerCase()
    .trim()
    .replace(/[?!.,]+$/g, "");

  if (["hi", "hello", "hey", "good morning", "good evening"].includes(text)) {
    return "Hello! 👋 Welcome to AI Airport Assistant. What would you like to know today?";
  }

  if (
    ["what is your name", "whats your name", "who are you"].includes(text)
  ) {
    return "I'm your AI Airport Assistant! ✈️ I can help with general questions, travel information and airport assistance.";
  }

  return null;
};

// Instructions for Gemini
const SYSTEM_INSTRUCTION = `
You are an intelligent, friendly AI Airport Assistant.

You can answer general questions as well as airport and travel questions.

Your capabilities include:
- General knowledge, science, technology and education.
- Everyday questions and casual conversations.
- Artificial intelligence and machine learning.
- Airport check-in, baggage and boarding information.
- Airport facilities, security and immigration.
- Travel planning and general travel advice.
- Explaining difficult topics in simple language.

Response rules:
1. Answer the user's actual question.
2. Use clear, friendly and beginner-friendly language.
3. Keep answers useful and reasonably concise.
4. Remember the recent conversation when answering follow-up questions.
5. Do not claim to have access to information you do not have.
6. Never invent live flight status, gate numbers, terminal assignments
   or real-time airport information.
7. If live information is unavailable, explain that clearly.
8. If you do not know an answer, be honest.
`;

// Generate a response from Gemini with a 30-second limit
const getGeminiReply = async (message, history) => {
  if (!ai) {
    throw new Error("Gemini API key is not configured.");
  }

  let timeoutId;

  const request = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      ...history,
      {
        role: "user",
        parts: [{ text: message }]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      maxOutputTokens: 500,
      temperature: 0.7
    }
  });

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("GEMINI_TIMEOUT"));
    }, GEMINI_TIMEOUT);
  });

  try {
    const response = await Promise.race([request, timeout]);
    const reply = response.text;

    if (!reply || !reply.trim()) {
      throw new Error("Gemini returned an empty response.");
    }

    return reply.trim();
  } finally {
    clearTimeout(timeoutId);
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const message = req.body.message?.trim();

    // Validate message
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message."
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters."
      });
    }

    // Find the user's conversation
    let chat = await Chat.findOne({
      user: req.user._id
    });

    // Create a conversation if one does not exist
    if (!chat) {
      chat = new Chat({
        user: req.user._id,
        messages: []
      });
    }

    // Get the latest 8 messages for conversation context
    const history = chat.messages.slice(-8).map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.text }]
    }));

    let reply = "";
    let responseMode = "gemini";

    // Check for simple quick replies
    const quickReply = getQuickReply(message);

    if (quickReply) {
      reply = quickReply;
      responseMode = "quick";
    } else {
      try {
        reply = await getGeminiReply(message, history);
      } catch (aiError) {
        console.error("Gemini API error:", {
          message: aiError.message,
          status: aiError.status || aiError.statusCode
        });

        responseMode = "fallback";

        if (aiError.message === "GEMINI_TIMEOUT") {
          reply =
            "I'm taking longer than expected to prepare your answer. Please try again.";
        } else if (!ai) {
          reply =
            "The AI service is not configured. Please contact the administrator.";
        } else {
          reply =
            "I'm temporarily unable to reach the AI service. Please try again shortly.";
        }
      }
    }

    // Save the user's message and assistant's response
    chat.messages.push(
      {
        role: "user",
        text: message
      },
      {
        role: "assistant",
        text: reply
      }
    );

    // Keep only the latest 100 messages
    chat.messages = chat.messages.slice(-100);

    await chat.save();

    return res.status(200).json({
      success: true,
      reply,
      responseMode
    });

  } catch (error) {
    console.error("Chat controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your message. Please try again."
    });
  }
};

// Get previous chat history
export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      user: req.user._id
    });

    return res.status(200).json({
      success: true,
      messages: chat ? chat.messages.slice(-50) : []
    });

  } catch (error) {
    console.error("Chat history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load chat history."
    });
  }
};