// FILE PATH: src/services/openai.service.ts
// FILE DESCRIPTION: OpenAI service using Responses API with Prompt ID and safe TypeScript handling

import {
  openai,
  EMBEDDING_MODEL,
  CHAT_MODEL,
  CONFIDENCE_THRESHOLDS,
  STEMP_PROMPT_ID,
  STEMP_PROMP_VERSION,
} from "../config/openai.config";
import { IOpenAIService } from "./interfaces/IOpenAIService";
import { QuestionEntity } from "../entities/question.entity";
import { findMostSimilar, SimilarityResult } from "../utils/vector.util";

export class OpenAIService implements IOpenAIService {
  private PROMPT_ID = STEMP_PROMPT_ID;
  private PROMPT_VERSION = STEMP_PROMP_VERSION;

  /** Generate semantic embedding for text */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /** Generate a response using the stored Prompt */
  async generateAnswer(question: string, context?: string): Promise<string> {
    try {
      const inputText = context
        ? `Use the following context to answer the question:\n${context}\n\nQuestion: ${question}`
        : question;

      const response = await openai.responses.create({
        model: CHAT_MODEL,
        prompt: {
          id: this.PROMPT_ID,
          version: this.PROMPT_VERSION,
        },
        input: inputText,
        temperature: 0.7,
        max_output_tokens: 500,
      });

      // --- SAFELY EXTRACT TEXT OUTPUT ---
      const textOutput = response.output
        .filter((item) => "content" in item) // only items with content
        .map((item: any) =>
          item.content
            .filter((c: any) => c.type === "output_text")
            .map((c: any) => c.text)
            .join("\n"),
        )
        .join("\n");

      return textOutput || "Sorry, I can't answer this right now.";
    } catch (error) {
      console.error("Error generating answer:", error);
      throw new Error("Failed to generate answer from OpenAI");
    }
  }

  /** Process user query with similarity matching */
  async processQuery(
    userQuery: string,
    questionDatabase: QuestionEntity[],
  ): Promise<string> {
    try {
      const queryEmbedding = await this.generateEmbedding(userQuery);

      console.log("=== DEBUG INFO ===");
      console.log("User Query:", userQuery);
      console.log("Database size:", questionDatabase.length);

      const result = findMostSimilar(
        queryEmbedding,
        questionDatabase,
        CONFIDENCE_THRESHOLDS.MIN,
      );

      if (result) {
        console.log("Match found!");
        console.log("Similarity score:", result.similarity);
        console.log("Confidence level:", result.confidenceLevel);
        console.log("Matched question:", result.question.question);
      } else {
        console.log("No match found - similarity below threshold");
      }
      console.log("==================");

      if (!result) {
        return await this.handleNoMatch(userQuery);
      }

      return await this.handleMatchedQuery(userQuery, result);
    } catch (error) {
      console.error("Error processing query:", error);
      throw new Error("Failed to process user query");
    }
  }

  /** Handle queries with no similar match */
  private async handleNoMatch(userQuery: string): Promise<string> {
    return this.generateAnswer(
      userQuery,
      "The question does not match our knowledge base.",
    );
  }

  /** Handle queries with a similarity match */
  private async handleMatchedQuery(
    userQuery: string,
    result: SimilarityResult,
  ): Promise<string> {
    const { question, similarity, confidenceLevel } = result;

    switch (confidenceLevel) {
      case "high":
        return question.answer;

      case "medium":
        return `${question.answer}\n\n(Confidence: ${Math.round(similarity * 100)}%)`;

      case "low":
        return await this.generateAdaptedAnswer(userQuery, result);

      default:
        return await this.handleNoMatch(userQuery);
    }
  }

  /** Generate an adapted answer using the stored Prompt with context */
  private async generateAdaptedAnswer(
    userQuery: string,
    result: SimilarityResult,
  ): Promise<string> {
    try {
      const { question } = result;
      const context = `A similar question in the database is: "${question.question}" with answer: "${question.answer}"`;

      return await this.generateAnswer(userQuery, context);
    } catch (error) {
      console.error("Error generating adapted answer:", error);
      return result.question.answer; // fallback
    }
  }

  /** Batch process multiple queries */
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
