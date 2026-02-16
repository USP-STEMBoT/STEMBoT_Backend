// FILE PATH: src/interfaces/IFeedbackRepository.ts
import {
  CreateFeedbackDto,
  FeedbackResponseDto,
  GetFeedbackQueryDto,
  PaginatedFeedbackDto,
  FeedbackStatsDto,
} from "../../dtos/feedback.dto";

export interface IFeedbackRepository {
  // Create new feedback
  create(feedbackData: CreateFeedbackDto): Promise<FeedbackResponseDto>;

  // Get all feedback with pagination and filtering
  findAll(query: GetFeedbackQueryDto): Promise<PaginatedFeedbackDto>;

  // Get feedback by ID
  findById(id: string): Promise<FeedbackResponseDto | null>;

  // Get feedback statistics
  getStatistics(): Promise<FeedbackStatsDto>;

  // Delete feedback
  delete(id: string): Promise<boolean>;
}
