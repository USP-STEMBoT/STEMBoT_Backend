import { ChatHistoryEntity } from "../../entities/chat-history.entity";

export interface IChatHistoryRepository {
  create(
    question: string,
    answer: string,
    source: string,
  ): Promise<ChatHistoryEntity>;
  findAll(): Promise<ChatHistoryEntity[]>;
  findRecent(limit: number): Promise<ChatHistoryEntity[]>;
  findByDateRange(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ChatHistoryEntity[]>;
}
