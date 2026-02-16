// FILE PATH: src/services/interfaces/IQuestionService.ts
// FILE DESCRIPTION: Interface for Question service

import { QuestionEntity } from "../../entities/question.entity";

export interface IQuestionService {
  /**
   * Adds a new question to the system
   *
   * Handles business rules such as validation, duplicate
   * detection, and embedding generation before persistence.
   *
   * @param question - The question text
   * @param answer - The answer associated with the question
   * @returns The newly created Question entity
   */
  addQuestion(question: string, answer: string): Promise<QuestionEntity>;

  /**
   * Retrieves all questions
   *
   * @returns A list of all Question entities
   */
  getAllQuestions(): Promise<QuestionEntity[]>;

  /**
   * Finds a semantically similar question based on embeddings
   *
   * Used to detect duplicates or suggest existing questions
   * based on similarity rather than exact text matching.
   *
   * @param question - Input question text to compare against stored questions
   * @returns An object containing the closest matching Question entity
   *          and its similarity score, or null if no match is found
   */
  findSimilarQuestion(
    question: string,
  ): Promise<{ question: QuestionEntity; similarity: number } | null>;
}
