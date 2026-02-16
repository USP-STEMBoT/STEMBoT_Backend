// FILE PATH: src/services/feedback.service.ts
import { IFeedbackService } from "../services/interfaces/IFeedbackService";
import { IFeedbackRepository } from "../repositories/interfaces/IFeedbackRepository";
import {
  CreateFeedbackDto,
  FeedbackResponseDto,
  GetFeedbackQueryDto,
  PaginatedFeedbackDto,
  FeedbackStatsDto,
} from "../dtos/feedback.dto";

export class FeedbackService implements IFeedbackService {
  constructor(private feedbackRepository: IFeedbackRepository) {}

  async submitFeedback(
    feedbackData: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return await this.feedbackRepository.create(feedbackData);
  }

  async getAllFeedback(
    query: GetFeedbackQueryDto,
  ): Promise<PaginatedFeedbackDto> {
    const validatedQuery: GetFeedbackQueryDto = {
      page: Math.max(1, query.page || 1),
      limit: Math.min(Math.max(1, query.limit || 20), 100),
      rating: query.rating,
      sortBy: ["submittedAt", "rating"].includes(query.sortBy || "")
        ? query.sortBy
        : "submittedAt",
      sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
      startDate: query.startDate,
      endDate: query.endDate,
    };

    return await this.feedbackRepository.findAll(validatedQuery);
  }

  async getFeedbackById(id: string): Promise<FeedbackResponseDto | null> {
    return await this.feedbackRepository.findById(id);
  }

  async getFeedbackStatistics(): Promise<FeedbackStatsDto> {
    return await this.feedbackRepository.getStatistics();
  }

  async deleteFeedback(id: string): Promise<boolean> {
    return await this.feedbackRepository.delete(id);
  }
}
