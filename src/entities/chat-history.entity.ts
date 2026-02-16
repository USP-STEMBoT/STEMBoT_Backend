// FILE PATH: src/entities/chat-history.entity.ts

/**
 * ENTITY NAME: ChatHistoryEntity
 * ENTITY DESCRIPTION:
 * Domain representation of the ChatHistory model.
 * Stores question–answer interactions along with
 * their response source (cache or openai).
 */
export class ChatHistoryEntity {
  /**
   * Unique identifier of the chat history record
   * Maps to Prisma field: id
   * DB column: ChatHistoryId
   */
  id: string;

  /**
   * Question asked by the user
   * Maps to Prisma field: question
   * DB column: Question
   */
  question: string;

  /**
   * Answer returned to the user
   * Maps to Prisma field: answer
   * DB column: Answer
   */
  answer: string;

  /**
   * Source of the response
   * Possible values: "cache" | "openai"
   * Maps to Prisma field: source
   * DB column: Source
   */
  source: string;

  /**
   * Record creation timestamp
   * Maps to Prisma field: createdAt
   * DB column: CreatedAt
   */
  createdAt: Date;

  /**
   * Constructs a ChatHistoryEntity.
   */
  constructor(data: any) {
    this.id = data.id;
    this.question = data.question;
    this.answer = data.answer;
    this.source = data.source;

    // Normalize createdAt to a Date instance
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
  }
}
