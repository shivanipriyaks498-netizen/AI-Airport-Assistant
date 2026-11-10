import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function testGemini() {
  try {
    console.log("Testing Gemini connection...");

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: "Hello! Explain AI in two simple sentences."
    });

    console.log("Gemini response:");
    console.log(response.text);

  } catch (error) {
    console.error("Gemini test failed:");
    console.error(error.message);
    console.error("Status:", error.status || error.statusCode);
  }
}

testGemini();