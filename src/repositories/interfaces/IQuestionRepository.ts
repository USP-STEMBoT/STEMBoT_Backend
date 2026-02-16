// FILE PATH: src/repositories/interfaces/IQuestionRepository.ts
// FILE DESCRIPTION: Interface for Question repository

import { QuestionEntity } from "../../entities/question.entity";

export interface IQuestionRepository {
  /**
   * Creates and persists a new Question entity
   *
   * @param question - The question text
   * @param answer - The answer associated with the question
   * @param embedding - Vector representation of the question (e.g., for semantic search)
   * @returns The newly created Question entity
   */
  create(
    question: string,
    answer: string,
    embedding: number[],
  ): Promise<QuestionEntity>;

  /**
   * Retrieves all Question entities
   *
   * @returns A list of all stored questions
   */
  findAll(): Promise<QuestionEntity[]>;

  /**
   * Finds a Question entity by its unique identifier
   *
   * @param id - Unique Question ID
   * @returns The matching Question entity or null if not found
   */
  findById(id: string): Promise<QuestionEntity | null>;

  /**
   * Finds a Question entity by its question text
   *
   * Typically used to prevent duplicate questions
   * or perform exact-match lookups.
   *
   * @param question - The question text to search for
   * @returns The matching Question entity or null if not found
   */
  findByQuestion(question: string): Promise<QuestionEntity | null>;
}
