// FILE PATH: src/repositories/question.repository.ts
// FILE DESCRIPTION: Prisma-based implementation of the Question repository

import { PrismaClient } from "@prisma/client";
import { IQuestionRepository } from "./interfaces/IQuestionRepository";
import { QuestionEntity } from "../entities/question.entity";

export class QuestionRepository implements IQuestionRepository {
  /**
   * @param prisma - Injected Prisma client instance
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Creates a new Question record in the database
   *
   * Embeddings are stored as a JSON string to maintain
   * database compatibility while preserving vector data.
   *
   * @param question - The question text
   * @param answer - The answer associated with the question
   * @param embedding - Vector representation of the question
   * @returns The persisted Question entity
   */
  async create(
    question: string,
    answer: string,
    embedding: number[],
  ): Promise<QuestionEntity> {
    const result = await this.prisma.question.create({
      data: {
        question,
        answer,
        embedding: JSON.stringify(embedding),
      },
    });

    return new QuestionEntity(result);
  }

  /**
   * Retrieves all Question records from the database
   *
   * @returns An array of Question entities
   */
  async findAll(): Promise<QuestionEntity[]> {
    const results = await this.prisma.question.findMany();

    // Map raw database records to domain entities
    return results.map((r) => new QuestionEntity(r));
  }

  /**
   * Retrieves a Question by its unique identifier
   *
   * @param id - Unique Question ID
   * @returns The Question entity or null if not found
   */
  async findById(id: string): Promise<QuestionEntity | null> {
    const result = await this.prisma.question.findUnique({
      where: { id },
    });

    return result ? new QuestionEntity(result) : null;
  }

  /**
   * Retrieves a Question by its exact question text
   *
   * Useful for duplicate detection and exact-match queries.
   *
   * @param question - The question text to search for
   * @returns The Question entity or null if not found
   */
  async findByQuestion(question: string): Promise<QuestionEntity | null> {
    const result = await this.prisma.question.findFirst({
      where: { question },
    });

    return result ? new QuestionEntity(result) : null;
  }
}
