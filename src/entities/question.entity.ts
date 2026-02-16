// FILE PATH: src/entities/question.entity.ts

/**
 * ENTITY NAME: QuestionEntity
 * ENTITY DESCRIPTION:
 * Domain representation of the Question model.
 */
export class QuestionEntity {
  /**
   * Unique identifier of the question
   * Maps to Prisma field: id
   * DB column: QuestionId
   */
  id: string;

  /**
   * The question text
   * Maps to Prisma field: question
   * DB column: Question
   */
  question: string;

  /**
   * The answer text corresponding to the question
   * Maps to Prisma field: answer
   * DB column: Answer
   */
  answer: string;

  /**
   * Vector embedding used for semantic search
   * Stored as JSON string in DB (Embedding)
   * Exposed as number[] in the domain layer
   */
  embedding: number[];

  /**
   * Record creation timestamp
   * Maps to Prisma field: createdAt
   * DB column: CreatedAt
   */
  createdAt: Date;

  /**
   * Record last update timestamp
   * Maps to Prisma field: updatedAt
   * DB column: UpdatedAt
   */
  updatedAt: Date;

  /**
   * Constructs a QuestionEntity.
   */
  constructor(data: any) {
    this.id = data.id;
    this.question = data.question;
    this.answer = data.answer;

    // Convert embedding from JSON string to number
    this.embedding =
      typeof data.embedding === "string"
        ? JSON.parse(data.embedding)
        : data.embedding;

    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
