// FILE PATH: src/dtos/feedback.dto.ts

// DTO for creating feedback
export interface CreateFeedbackDto {
  studentName: string;
  studentID?: string;
  rating: number;
  feedback: string;
}

// DTO for feedback response
export interface FeedbackResponseDto {
  id: string;
  studentName: string;
  studentID?: string;
  rating: number;
  feedbackText: string;
  submittedAt: string;
}

// DTO for getting feedback list
export interface GetFeedbackQueryDto {
  page?: number;
  limit?: number;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

// DTO for paginated response
export interface PaginatedFeedbackDto {
  data: FeedbackResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// DTO for feedback statistics
export interface FeedbackStatsDto {
  totalCount: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: string;
  }>;
  recentSubmissions: number;
}

// Validation DTO for creating feedback
export class CreateFeedbackRequestDto {
  studentName: string;
  studentID?: string;
  rating: number;
  feedback: string;

  constructor(data: any) {
    this.studentName = data.studentName;
    this.studentID = data.studentID;
    this.rating = data.rating;
    this.feedback = data.feedback;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.studentName || this.studentName.trim().length === 0) {
      errors.push("Student name is required");
    }

    if (!this.rating || this.rating < 1 || this.rating > 5) {
      errors.push("Rating must be between 1 and 5");
    }

    if (!this.feedback || this.feedback.trim().length < 10) {
      errors.push("Feedback must be at least 10 characters long");
    }

    return errors;
  }

  toCreateFeedbackDto(): CreateFeedbackDto {
    return {
      studentName: this.studentName.trim(),
      studentID: this.studentID?.trim(),
      rating: this.rating,
      feedback: this.feedback.trim(),
    };
  }
}

// Validation DTO for query parameters
export class GetFeedbackQueryRequestDto {
  page?: number;
  limit?: number;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;

  constructor(query: any) {
    this.page = query.page ? parseInt(query.page) : undefined;
    this.limit = query.limit ? parseInt(query.limit) : undefined;
    this.rating = query.rating ? parseInt(query.rating) : undefined;
    this.sortBy = query.sortBy;
    this.sortOrder = query.sortOrder;
    this.startDate = query.startDate;
    this.endDate = query.endDate;
  }

  toGetFeedbackQueryDto(): GetFeedbackQueryDto {
    return {
      page: this.page,
      limit: this.limit,
      rating: this.rating,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }
}
