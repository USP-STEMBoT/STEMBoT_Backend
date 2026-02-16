// FILE PATH: src/services/report.service.ts
// FILE DESCRIPTION: Service for generating reports and analytics

import { IQuestionRepository } from "../repositories/interfaces/IQuestionRepository";
import { IChatHistoryRepository } from "../repositories/interfaces/IChatHistoryRepository";
import {
  QuestionsProcessedResponse,
  CacheHitRateResponse,
  CacheUtilizationResponse,
  NewQuestionsResponse,
  QAGrowthRateResponse,
} from "../dtos/report.dto";

export class ReportService {
  constructor(
    private questionRepository: IQuestionRepository,
    private chatHistoryRepository: IChatHistoryRepository,
  ) {}

  /**
   * Get total questions processed overall and time-based
   */
  async getQuestionsProcessed(
    startDate?: Date,
    endDate?: Date,
  ): Promise<QuestionsProcessedResponse> {
    // Get all chat history
    const allChats = await this.chatHistoryRepository.findAll();

    // Filter by date range if provided
    let filteredChats = allChats;
    if (startDate && endDate) {
      filteredChats = allChats.filter(
        (chat) => chat.createdAt >= startDate && chat.createdAt <= endDate,
      );
    }

    // Get overall totals
    const total = filteredChats.length;
    const cacheCount = filteredChats.filter(
      (chat) => chat.source === "cache",
    ).length;
    const openaiCount = filteredChats.filter(
      (chat) => chat.source === "openai",
    ).length;

    // Group by day for time-based data
    const timeBased = this.groupByPeriod(filteredChats, "day").map((group) => ({
      period: group.period,
      count: group.chats.length,
      cacheCount: group.chats.filter((chat) => chat.source === "cache").length,
      openaiCount: group.chats.filter((chat) => chat.source === "openai")
        .length,
    }));

    return {
      total,
      timeBased,
    };
  }

  /**
   * Get cache hit rate percentages
   */
  async getCacheHitRate(
    startDate?: Date,
    endDate?: Date,
  ): Promise<CacheHitRateResponse> {
    const allChats = await this.chatHistoryRepository.findAll();

    // Filter by date range if provided
    let filteredChats = allChats;
    if (startDate && endDate) {
      filteredChats = allChats.filter(
        (chat) => chat.createdAt >= startDate && chat.createdAt <= endDate,
      );
    }

    // Overall statistics
    const totalQuestions = filteredChats.length;
    const cacheCount = filteredChats.filter(
      (chat) => chat.source === "cache",
    ).length;
    const openaiCount = filteredChats.filter(
      (chat) => chat.source === "openai",
    ).length;
    const cacheHitRate =
      totalQuestions > 0 ? (cacheCount / totalQuestions) * 100 : 0;
    const openaiRate =
      totalQuestions > 0 ? (openaiCount / totalQuestions) * 100 : 0;

    // Time-based data grouped by day
    const timeBased = this.groupByPeriod(filteredChats, "day").map((group) => {
      const groupTotal = group.chats.length;
      const groupCache = group.chats.filter(
        (chat) => chat.source === "cache",
      ).length;
      const groupOpenai = group.chats.filter(
        (chat) => chat.source === "openai",
      ).length;

      return {
        period: group.period,
        cacheHitRate: groupTotal > 0 ? (groupCache / groupTotal) * 100 : 0,
        cacheCount: groupCache,
        openaiCount: groupOpenai,
        totalCount: groupTotal,
      };
    });

    return {
      overall: {
        totalQuestions,
        cacheCount,
        openaiCount,
        cacheHitRate: Number(cacheHitRate.toFixed(2)),
        openaiRate: Number(openaiRate.toFixed(2)),
      },
      timeBased,
    };
  }

  /**
   * Get cache utilization trends
   */
  async getCacheUtilizationTrends(
    period: "day" | "week" | "month" = "day",
  ): Promise<CacheUtilizationResponse> {
    const allChats = await this.chatHistoryRepository.findAll();

    // Group by specified period
    const grouped = this.groupByPeriod(allChats, period);

    const trends = grouped.map((group) => {
      const total = group.chats.length;
      const cacheCount = group.chats.filter(
        (chat) => chat.source === "cache",
      ).length;
      const openaiCount = group.chats.filter(
        (chat) => chat.source === "openai",
      ).length;

      return {
        period: group.period,
        cacheCount,
        openaiCount,
        cachePercentage:
          total > 0 ? Number(((cacheCount / total) * 100).toFixed(2)) : 0,
        openaiPercentage:
          total > 0 ? Number(((openaiCount / total) * 100).toFixed(2)) : 0,
      };
    });

    // Calculate summary statistics
    const cacheRates = trends
      .map((t) => t.cachePercentage)
      .filter((rate) => rate > 0);
    const openaiRates = trends
      .map((t) => t.openaiPercentage)
      .filter((rate) => rate > 0);

    const averageCacheRate =
      cacheRates.length > 0
        ? Number(
            (cacheRates.reduce((a, b) => a + b, 0) / cacheRates.length).toFixed(
              2,
            ),
          )
        : 0;

    const averageOpenaiRate =
      openaiRates.length > 0
        ? Number(
            (
              openaiRates.reduce((a, b) => a + b, 0) / openaiRates.length
            ).toFixed(2),
          )
        : 0;

    // Find peak periods
    const peakCachePeriod = trends.reduce(
      (max, current) => (current.cacheCount > max.cacheCount ? current : max),
      trends[0] || { period: "", cacheCount: 0 },
    );

    const peakOpenaiPeriod = trends.reduce(
      (max, current) => (current.openaiCount > max.openaiCount ? current : max),
      trends[0] || { period: "", openaiCount: 0 },
    );

    return {
      trends,
      summary: {
        totalPeriods: trends.length,
        averageCacheRate,
        averageOpenaiRate,
        peakCachePeriod: peakCachePeriod.period,
        peakOpenaiPeriod: peakOpenaiPeriod.period,
      },
    };
  }

  /**
   * Get new questions added over time
   */
  async getNewQuestionsOverTime(
    period: "day" | "week" | "month" = "day",
  ): Promise<NewQuestionsResponse> {
    const allQuestions = await this.questionRepository.findAll();

    // Sort by creation date
    const sortedQuestions = [...allQuestions].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    // Group by specified period
    const grouped = this.groupQuestionsByPeriod(sortedQuestions, period);

    let cumulativeTotal = 0;
    let previousPeriodCount = 0;

    const growth = grouped.map((group, index) => {
      const newQuestions = group.questions.length;
      cumulativeTotal += newQuestions;

      // Calculate growth rate (except for first period)
      let growthRate = null;
      if (index > 0 && previousPeriodCount > 0) {
        growthRate = Number(
          (
            ((newQuestions - previousPeriodCount) / previousPeriodCount) *
            100
          ).toFixed(2),
        );
      }

      previousPeriodCount = newQuestions;

      return {
        period: group.period,
        newQuestions,
        cumulativeTotal,
        growthRate,
      };
    });

    // Calculate summary statistics
    const growthRates = growth
      .map((g) => g.growthRate)
      .filter((rate): rate is number => rate !== null);
    const averageGrowth =
      growthRates.length > 0
        ? Number(
            (
              growthRates.reduce((a, b) => a + b, 0) / growthRates.length
            ).toFixed(2),
          )
        : 0;

    const peakGrowthPeriod = growth.reduce(
      (max, current) =>
        (current.growthRate || 0) > (max.growthRate || 0) ? current : max,
      growth[0] || { period: "", growthRate: 0 },
    );

    return {
      growth,
      summary: {
        totalQuestions: cumulativeTotal,
        totalPeriods: growth.length,
        averageGrowthPerPeriod: averageGrowth,
        peakGrowthPeriod: peakGrowthPeriod.period,
      },
    };
  }

  /**
   * Get question-answer pairs growth rate
   */
  async getQAGrowthRate(
    period: "day" | "week" | "month" = "day",
  ): Promise<QAGrowthRateResponse> {
    // Get questions grouped by period
    const allQuestions = await this.questionRepository.findAll();
    const questionGroups = this.groupQuestionsByPeriod(allQuestions, period);

    // Get chats grouped by same period
    const allChats = await this.chatHistoryRepository.findAll();
    const chatGroups = this.groupByPeriod(allChats, period);

    // Combine data from both sources
    const periods = questionGroups.map((qGroup, index) => {
      const cGroup = chatGroups.find((cg) => cg.period === qGroup.period);

      const newQuestions = qGroup.questions.length;
      const newChats = cGroup ? cGroup.chats.length : 0;

      // Calculate cache hit rate for this period
      let cacheHitRate = 0;
      if (cGroup && cGroup.chats.length > 0) {
        const cacheCount = cGroup.chats.filter(
          (chat) => chat.source === "cache",
        ).length;
        cacheHitRate = Number(
          ((cacheCount / cGroup.chats.length) * 100).toFixed(2),
        );
      }

      // Calculate growth rate (except for first period)
      let growthRate = null;
      if (index > 0) {
        const prevGroup = questionGroups[index - 1];
        const prevCount = prevGroup.questions.length;
        if (prevCount > 0) {
          growthRate = Number(
            (((newQuestions - prevCount) / prevCount) * 100).toFixed(2),
          );
        }
      }

      return {
        period: qGroup.period,
        newQuestions,
        newChats,
        growthRate,
        cacheHitRate,
      };
    });

    // Calculate summary statistics
    const totalQuestions = allQuestions.length;
    const totalChats = allChats.length;

    const growthRates = periods
      .map((p) => p.growthRate)
      .filter((rate): rate is number => rate !== null);
    const overallGrowthRate =
      growthRates.length > 0
        ? Number(
            (
              growthRates.reduce((a, b) => a + b, 0) / growthRates.length
            ).toFixed(2),
          )
        : 0;

    const cacheHitRates = periods
      .map((p) => p.cacheHitRate)
      .filter((rate) => rate > 0);
    const averageCacheHitRate =
      cacheHitRates.length > 0
        ? Number(
            (
              cacheHitRates.reduce((a, b) => a + b, 0) / cacheHitRates.length
            ).toFixed(2),
          )
        : 0;

    // Calculate correlation between questions added and cache hits
    const correlation = this.calculateCorrelation(
      periods.map((p) => p.newQuestions),
      periods.map((p) => p.cacheHitRate),
    );

    return {
      periods,
      summary: {
        totalQuestions,
        totalChats,
        overallGrowthRate,
        averageCacheHitRate,
        correlation: Number(correlation.toFixed(3)),
      },
    };
  }

  /**
   * Helper method to group chats by time period
   */
  private groupByPeriod(
    chats: any[],
    period: "day" | "week" | "month",
  ): Array<{ period: string; chats: any[] }> {
    const groups: { [key: string]: any[] } = {};

    chats.forEach((chat) => {
      const date = new Date(chat.createdAt);
      let periodKey = "";

      switch (period) {
        case "day":
          periodKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
          break;
        case "week":
          const weekNumber = this.getWeekNumber(date);
          periodKey = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case "month":
          periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          break;
      }

      if (!groups[periodKey]) {
        groups[periodKey] = [];
      }
      groups[periodKey].push(chat);
    });

    // Convert to array and sort by period
    return Object.entries(groups)
      .map(([period, chats]) => ({ period, chats }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Helper method to group questions by time period
   */
  private groupQuestionsByPeriod(
    questions: any[],
    period: "day" | "week" | "month",
  ): Array<{ period: string; questions: any[] }> {
    const groups: { [key: string]: any[] } = {};

    questions.forEach((question) => {
      const date = new Date(question.createdAt);
      let periodKey = "";

      switch (period) {
        case "day":
          periodKey = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekNumber = this.getWeekNumber(date);
          periodKey = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case "month":
          periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          break;
      }

      if (!groups[periodKey]) {
        groups[periodKey] = [];
      }
      groups[periodKey].push(question);
    });

    // Convert to array and sort by period
    return Object.entries(groups)
      .map(([period, questions]) => ({ period, questions }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Helper method to get week number
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Helper method to calculate correlation coefficient
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );

    return denominator !== 0 ? numerator / denominator : 0;
  }
}
