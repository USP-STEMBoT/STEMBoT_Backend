import { PrismaClient, ChatHistory } from "@prisma/client";
import { IChatHistoryRepository } from "./interfaces/IChatHistoryRepository";
import { ChatHistoryEntity } from "../entities/chat-history.entity";

export class ChatHistoryRepository implements IChatHistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    question: string,
    answer: string,
    source: string,
  ): Promise<ChatHistoryEntity> {
    const result = await this.prisma.chatHistory.create({
      data: {
        question,
        answer,
        source,
      },
    });
    return new ChatHistoryEntity(result);
  }

  async findAll(): Promise<ChatHistoryEntity[]> {
    const results = await this.prisma.chatHistory.findMany();
    return results.map((r: ChatHistory) => new ChatHistoryEntity(r));
  }

  async findRecent(limit: number): Promise<ChatHistoryEntity[]> {
    const results = await this.prisma.chatHistory.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return results.map((r: ChatHistory) => new ChatHistoryEntity(r));
  }

  async findByDateRange(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ChatHistoryEntity[]> {
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.createdAt = {
        gte: startDate,
      };
    } else if (endDate) {
      where.createdAt = {
        lte: endDate,
      };
    }

    const results = await this.prisma.chatHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return results.map((r: ChatHistory) => new ChatHistoryEntity(r));
  }
}
