// FILE PATH: src/repositories/feedback.repository.ts
import { PrismaClient } from "@prisma/client";
import { IFeedbackRepository } from "../repositories/interfaces/IFeedbackRepository";
import {
  CreateFeedbackDto,
  FeedbackResponseDto,
  GetFeedbackQueryDto,
  PaginatedFeedbackDto,
  FeedbackStatsDto,
} from "../dtos/feedback.dto";
import { StudentFeedbackEntity } from "../entities/feedback.entity";

export class FeedbackRepository implements IFeedbackRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(feedbackData: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    const feedback = await this.prisma.studentFeedback.create({
      data: {
        studentName: feedbackData.studentName,
        studentID: feedbackData.studentID || null,
        rating: feedbackData.rating,
        feedbackText: feedbackData.feedback,
      },
    });

    const response =
      StudentFeedbackEntity.fromDatabaseModel(feedback).toResponseDto();
    return {
      ...response,
      studentID: response.studentID ?? undefined,
    };
  }

  async findAll(query: GetFeedbackQueryDto): Promise<PaginatedFeedbackDto> {
    const {
      page = 1,
      limit = 20,
      rating,
      sortBy = "submittedAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = query;

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: any = {};

    if (rating) {
      where.rating = rating;
    }

    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) {
        where.submittedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.submittedAt.lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await this.prisma.studentFeedback.count({ where });

    // Get feedback with pagination
    const feedbackList = await this.prisma.studentFeedback.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
      skip,
      take: limitNum,
    });

    const data = feedbackList.map((feedback) => {
      const responseDto =
        StudentFeedbackEntity.fromDatabaseModel(feedback).toResponseDto();
      return {
        ...responseDto,
        studentID: responseDto.studentID ?? undefined,
      };
    });

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findById(id: string): Promise<FeedbackResponseDto | null> {
    const feedback = await this.prisma.studentFeedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return null;
    }

    const response =
      StudentFeedbackEntity.fromDatabaseModel(feedback).toResponseDto();
    return {
      ...response,
      studentID: response.studentID ?? undefined,
    };
  }

  async getStatistics(): Promise<FeedbackStatsDto> {
    // Get total count
    const totalCount = await this.prisma.studentFeedback.count();

    // Get average rating
    const avgRating = await this.prisma.studentFeedback.aggregate({
      _avg: {
        rating: true,
      },
    });

    // Get rating distribution
    const ratingDistribution = await this.prisma.studentFeedback.groupBy({
      by: ["rating"],
      _count: {
        rating: true,
      },
      orderBy: {
        rating: "asc",
      },
    });

    // Get recent submissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSubmissions = await this.prisma.studentFeedback.count({
      where: {
        submittedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Format rating distribution
    const distribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const found = ratingDistribution.find((r) => r.rating === rating);
      const count = found ? found._count.rating : 0;
      const percentage =
        totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0.0";

      return {
        rating,
        count,
        percentage,
      };
    });

    return {
      totalCount,
      averageRating: avgRating._avg.rating
        ? parseFloat(avgRating._avg.rating.toFixed(1))
        : 0,
      ratingDistribution: distribution,
      recentSubmissions,
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.studentFeedback.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting feedback:", error);
      return false;
    }
  }
}
