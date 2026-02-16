// FILE PATH: src/services/question.service.ts
// FILE DESCRIPTION: Implementation of the Question service

import { IQuestionService } from "./interfaces/IQuestionService";
import { IQuestionRepository } from "../repositories/interfaces/IQuestionRepository";
import { IOpenAIService } from "./interfaces/IOpenAIService";
import { QuestionEntity } from "../entities/question.entity";
import { findMostSimilar } from "../utils/vector.util";
import { SIMILARITY_THRESHOLD } from "../config/openai.config";

export class QuestionService implements IQuestionService {
  /**
   * @param questionRepo - Repository abstraction for Question persistence
   * @param openaiService - Service used for generating text embeddings
   */
  constructor(
    private questionRepo: IQuestionRepository,
    private openaiService: IOpenAIService,
  ) {}

  /**
   * Adds a new question to the system
   *
   * Generates an embedding for the question text and
   * persists the question along with its answer.
   *
   * @param question - The question text
   * @param answer - The answer associated with the question
   * @returns The newly created Question entity
   */
  async addQuestion(question: string, answer: string): Promise<QuestionEntity> {
    // Generate semantic embedding for the question
    const embedding = await this.openaiService.generateEmbedding(question);

    // Persist the question and its embedding
    return await this.questionRepo.create(question, answer, embedding);
  }

  /**
   * Retrieves all questions
   *
   * @returns A list of all Question entities
   */
  async getAllQuestions(): Promise<QuestionEntity[]> {
    return await this.questionRepo.findAll();
  }

  /**
   * Finds a semantically similar question using vector similarity
   *
   * This method is typically used to prevent duplicate questions
   * or suggest existing questions based on semantic meaning
   * rather than exact text matching.
   *
   * @param question - Input question text
   * @returns The most similar Question entity with its similarity score,
   *          or null if no match exceeds the similarity threshold
   */
  async findSimilarQuestion(
    question: string,
  ): Promise<{ question: QuestionEntity; similarity: number } | null> {
    // Generate embedding for the input question
    const questionEmbedding =
      await this.openaiService.generateEmbedding(question);

    // Retrieve all stored questions for comparison
    const allQuestions = await this.questionRepo.findAll();

    // Find the most semantically similar question
    const result = findMostSimilar(questionEmbedding, allQuestions);

    // Return the result only if it meets the configured similarity threshold
    if (result && result.similarity >= SIMILARITY_THRESHOLD) {
      return result;
    }

    return null;
  }
}
