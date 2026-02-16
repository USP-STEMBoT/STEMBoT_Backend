// FILE PATH: src/dtos/report.dto.ts
// FILE DESCRIPTION: Data Transfer Objects for reporting endpoints

export class DateRangeRequestDto {
  startDate: string;
  endDate: string;

  constructor(data: any) {
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.startDate) {
      errors.push("startDate is required");
    }

    if (!this.endDate) {
      errors.push("endDate is required");
    }

    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      if (start > end) {
        errors.push("startDate must be before endDate");
      }
    }

    return errors;
  }
}

export class TimePeriodRequestDto {
  period: "day" | "week" | "month";

  constructor(data: any) {
    this.period = data.period || "day";
  }

  validate(): string[] {
    const errors: string[] = [];

    const validPeriods = ["day", "week", "month"];
    if (!validPeriods.includes(this.period)) {
      errors.push(`period must be one of: ${validPeriods.join(", ")}`);
    }

    return errors;
  }
}

// Response DTOs
export interface QuestionsProcessedResponse {
  total: number;
  timeBased: Array<{
    period: string;
    count: number;
    cacheCount: number;
    openaiCount: number;
  }>;
}

export interface CacheHitRateResponse {
  overall: {
    totalQuestions: number;
    cacheCount: number;
    openaiCount: number;
    cacheHitRate: number;
    openaiRate: number;
  };
  timeBased: Array<{
    period: string;
    cacheHitRate: number;
    cacheCount: number;
    openaiCount: number;
    totalCount: number;
  }>;
}

export interface CacheUtilizationResponse {
  trends: Array<{
    period: string;
    cacheCount: number;
    openaiCount: number;
    cachePercentage: number;
    openaiPercentage: number;
  }>;
  summary: {
    totalPeriods: number;
    averageCacheRate: number;
    averageOpenaiRate: number;
    peakCachePeriod: string;
    peakOpenaiPeriod: string;
  };
}

export interface NewQuestionsResponse {
  growth: Array<{
    period: string;
    newQuestions: number;
    cumulativeTotal: number;
    growthRate: number | null; // null for first period
  }>;
  summary: {
    totalQuestions: number;
    totalPeriods: number;
    averageGrowthPerPeriod: number;
    peakGrowthPeriod: string;
  };
}

export interface QAGrowthRateResponse {
  periods: Array<{
    period: string;
    newQuestions: number;
    newChats: number;
    growthRate: number | null;
    cacheHitRate: number;
  }>;
  summary: {
    totalQuestions: number;
    totalChats: number;
    overallGrowthRate: number;
    averageCacheHitRate: number;
    correlation: number; // Correlation between questions added and cache hits
  };
}
