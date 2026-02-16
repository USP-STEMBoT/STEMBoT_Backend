import { PrismaClient, Question } from "@prisma/client";
import { IQuestionRepository } from "./interfaces/IQuestionRepository";
import { QuestionEntity } from "../entities/question.entity";

export class QuestionRepository implements IQuestionRepository {
  constructor(private prisma: PrismaClient) {}

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

  async findAll(): Promise<QuestionEntity[]> {
    const results = await this.prisma.question.findMany();
    // ✅ Explicitly type the map callback parameter
    return results.map((r: Question) => new QuestionEntity(r));
  }

  async findById(id: string): Promise<QuestionEntity | null> {
    const result = await this.prisma.question.findUnique({
      where: { id },
    });

    return result ? new QuestionEntity(result) : null;
  }

  async findByQuestion(question: string): Promise<QuestionEntity | null> {
    const result = await this.prisma.question.findFirst({
      where: { question },
    });

    return result ? new QuestionEntity(result) : null;
  }
}
