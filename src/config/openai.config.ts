import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const CHAT_MODEL = "gpt-3.5-turbo";
export const SIMILARITY_THRESHOLD = 0.75;
// Confidence thresholds for response handling
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9, // Return answer directly
  MEDIUM: 0.8, // Return answer with confidence note
  LOW: 0.7, // Ask for clarification
  MIN: 0.75, // Minimum to consider a match
};
