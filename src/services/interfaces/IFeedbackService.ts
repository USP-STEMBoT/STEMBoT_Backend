// FILE PATH: src/interfaces/IFeedbackService.ts
import {
  CreateFeedbackDto,
  FeedbackResponseDto,
  GetFeedbackQueryDto,
  PaginatedFeedbackDto,
  FeedbackStatsDto,
} from "../../dtos/feedback.dto";

export interface IFeedbackService {
  // Submit feedback
  submitFeedback(feedbackData: CreateFeedbackDto): Promise<FeedbackResponseDto>;

  // Get all feedback
  getAllFeedback(query: GetFeedbackQueryDto): Promise<PaginatedFeedbackDto>;

  // Get feedback by ID
  getFeedbackById(id: string): Promise<FeedbackResponseDto | null>;

  // Get feedback statistics
  getFeedbackStatistics(): Promise<FeedbackStatsDto>;

  // Delete feedback
  deleteFeedback(id: string): Promise<boolean>;
}
