// FILE PATH: src/services/openai.service.ts
// FILE DESCRIPTION: Implementation of OpenAI service and call to OpenAI API

// import { openai, EMBEDDING_MODEL, CHAT_MODEL } from "../config/openai.config";
// import { IOpenAIService } from "./interfaces/IOpenAIService";

// export class OpenAIService implements IOpenAIService {
//   /**
//    * Generates a semantic embedding for the given text
//    *
//    * Used for similarity search, clustering, and semantic
//    * comparison of questions.
//    *
//    * @param text - Input text to generate an embedding for
//    * @returns A numerical vector representing the text
//    */
//   async generateEmbedding(text: string): Promise<number[]> {
//     try {
//       const response = await openai.embeddings.create({
//         model: EMBEDDING_MODEL,
//         input: text,
//       });

//       // Return the first embedding vector from the response
//       return response.data[0].embedding;
//     } catch (error) {
//       // Log the original error for debugging and observability
//       console.error("Error generating embedding:", error);

//       // Throw a generic error to avoid leaking provider-specific details
//       throw new Error("Failed to generate embedding");
//     }
//   }

//   /**
//    * Generates a natural language answer to a question
//    *
//    * Optionally augments the response with additional context
//    * (e.g., retrieved documents in a RAG pipeline).
//    *
//    * @param question - The question to be answered
//    * @param context - Optional contextual information
//    * @returns The generated answer as a string
//    */
//   async generateAnswer(question: string, context?: string): Promise<string> {
//     try {
//       // Build the system prompt based on whether context is provided
//       const systemMessage = context
//         ? `You are a helpful assistant. Use the following context to answer questions: ${context}`
//         : "You are a helpful assistant.";

//       const response = await openai.chat.completions.create({
//         model: CHAT_MODEL,
//         messages: [
//           { role: "system", content: systemMessage },
//           { role: "user", content: question },
//         ],
//         temperature: 0.7,
//         max_tokens: 500,
//       });

//       // Safely return the generated message content
//       return (
//         response.choices[0].message.content ||
//         "I apologize, but I could not generate a response."
//       );
//     } catch (error) {
//       // Log provider errors for troubleshooting
//       console.error("Error generating answer:", error);

//       // Throw a generic error for upstream handling
//       throw new Error("Failed to generate answer from OpenAI");
//     }
//   }
// }
// FILE PATH: src/services/openai.service.ts
// FILE DESCRIPTION: Implementation of OpenAI service and call to OpenAI API

import {
  openai,
  EMBEDDING_MODEL,
  CHAT_MODEL,
  CONFIDENCE_THRESHOLDS,
} from "../config/openai.config";
import { IOpenAIService } from "./interfaces/IOpenAIService";
import { QuestionEntity } from "../entities/question.entity";
import { findMostSimilar, SimilarityResult } from "../utils/vector.util";

export class OpenAIService implements IOpenAIService {
  /**
   * Generates a semantic embedding for the given text
   *
   * Used for similarity search, clustering, and semantic
   * comparison of questions.
   *
   * @param text - Input text to generate an embedding for
   * @returns A numerical vector representing the text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });

      // Return the first embedding vector from the response
      return response.data[0].embedding;
    } catch (error) {
      // Log the original error for debugging and observability
      console.error("Error generating embedding:", error);

      // Throw a generic error to avoid leaking provider-specific details
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Generates a natural language answer to a question
   *
   * Optionally augments the response with additional context
   * (e.g., retrieved documents in a RAG pipeline).
   *
   * @param question - The question to be answered
   * @param context - Optional contextual information
   * @returns The generated answer as a string
   */
  async generateAnswer(question: string, context?: string): Promise<string> {
    try {
      // Build the system prompt based on whether context is provided
      const systemMessage = context
        ? `You are a helpful assistant. Use the following context to answer questions: ${context}`
        : "You are a helpful assistant.";

      const response = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: question },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      // Safely return the generated message content
      return (
        response.choices[0].message.content ||
        "Sorry - I can't answer this one yet. This question isn't avaliable in the STEM-BoT approved datasetor supported categories, so I'm unable to provide an official answer at this time. For accurate guidance, please contact the STEMP school directly: stempopenai@gmail.com"
      );
    } catch (error) {
      // Log provider errors for troubleshooting
      console.error("Error generating answer:", error);

      // Throw a generic error for upstream handling
      throw new Error("Failed to generate answer from OpenAI");
    }
  }

  /**
   * Process user query with intelligent matching and response generation
   *
   * This method:
   * 1. Generates embedding for user query
   * 2. Finds most similar question in database
   * 3. Returns appropriate response based on confidence level
   *
   * @param userQuery - The user's question
   * @param questionDatabase - Array of questions with embeddings
   * @returns A contextual response based on similarity match
   */
  async processQuery(
    userQuery: string,
    questionDatabase: QuestionEntity[],
  ): Promise<string> {
    try {
      // Generate embedding for the user's query
      const queryEmbedding = await this.generateEmbedding(userQuery);

      // **ADD THIS LOGGING**
      console.log("=== DEBUG INFO ===");
      console.log("User Query:", userQuery);
      console.log("Database size:", questionDatabase.length);

      // Find the most similar question
      const result = findMostSimilar(
        queryEmbedding,
        questionDatabase,
        CONFIDENCE_THRESHOLDS.MIN,
      );

      // **ADD MORE LOGGING**
      if (result) {
        console.log("Match found!");
        console.log("Similarity score:", result.similarity);
        console.log("Confidence level:", result.confidenceLevel);
        console.log("Matched question:", result.question.question);
      } else {
        console.log("No match found - similarity below threshold");
      }
      console.log("==================");

      // Handle response based on match confidence
      if (!result) {
        return await this.handleNoMatch(userQuery);
      }

      return await this.handleMatchedQuery(userQuery, result);
    } catch (error) {
      console.error("Error processing query:", error);
      throw new Error("Failed to process user query");
    }
  }

  /**
   * Handle queries with no similar match found
   *
   * @param userQuery - The original user query
   * @returns A generated response or fallback message
   */
  private async handleNoMatch(userQuery: string): Promise<string> {
    try {
      // Generate dynamic response using GPT
      const response = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. The user's question doesn't match our knowledge base. Provide a helpful response or politely ask for clarification.",
          },
          {
            role: "user",
            content: userQuery,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return (
        response.choices[0].message.content ||
        "I'm not sure how to help with that. Could you please rephrase your question?"
      );
    } catch (error) {
      console.error("Error handling no match:", error);
      return "I'm having trouble understanding your question. Could you please rephrase it?";
    }
  }

  /**
   * Handle matched queries based on confidence level
   *
   * @param userQuery - The original user query
   * @param result - The similarity match result
   * @returns Appropriate response based on confidence
   */
  private async handleMatchedQuery(
    userQuery: string,
    result: SimilarityResult,
  ): Promise<string> {
    const { question, similarity, confidenceLevel } = result;

    switch (confidenceLevel) {
      case "high":
        // High confidence - return stored answer directly
        return question.answer;

      case "medium":
        // Medium confidence - return answer with slight disclaimer
        return `${question.answer}\n\n(Confidence: ${Math.round(similarity * 100)}%)`;

      case "low":
        // Low confidence - use GPT to adapt the answer to user's specific query
        return await this.generateAdaptedAnswer(userQuery, result);

      default:
        return await this.handleNoMatch(userQuery);
    }
  }

  /**
   * Generate an adapted answer using GPT with context from similar question
   *
   * @param userQuery - The original user query
   * @param result - The similarity match result
   * @returns An adapted answer specific to the user's query
   */
  private async generateAdaptedAnswer(
    userQuery: string,
    result: SimilarityResult,
  ): Promise<string> {
    try {
      const { question } = result;

      const response = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant. A similar question in our database is: "${question.question}" with answer: "${question.answer}". Use this as context to answer the user's question, adapting it to their specific query if needed.`,
          },
          {
            role: "user",
            content: userQuery,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return (
        response.choices[0].message.content || question.answer // Fallback to stored answer
      );
    } catch (error) {
      console.error("Error generating adapted answer:", error);
      // Fallback to the stored answer if GPT fails
      return result.question.answer;
    }
  }

  /**
   * Batch process multiple queries efficiently
   *
   * @param queries - Array of user queries
   * @param questionDatabase - Array of questions with embeddings
   * @returns Array of responses
   */
  async processQueries(
    queries: string[],
    questionDatabase: QuestionEntity[],
  ): Promise<string[]> {
    try {
      const responses = await Promise.all(
        queries.map((query) => this.processQuery(query, questionDatabase)),
      );
      return responses;
    } catch (error) {
      console.error("Error processing batch queries:", error);
      throw new Error("Failed to process batch queries");
    }
  }
}
