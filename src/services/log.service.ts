// FILE PATH: src/services/log.service.ts
// FILE DESCRIPTION: Implementation of ILogService using LogRepository

import { ILogService } from "./interfaces/ILogService";
import { ILogRepository } from "../repositories/interfaces/ILogRepository";
import { CreateLogDto, GetLogsDto, LogResponseDto } from "../dtos/log.dto";
import { LogEntity } from "../entities/log.entity";
import crypto from "crypto";

export class LogService implements ILogService {
  private logRepository: ILogRepository;

  constructor(logRepository: ILogRepository) {
    this.logRepository = logRepository;
  }

  /**
   * Create a new log entry
   */
  async createLog(logData: CreateLogDto): Promise<LogResponseDto> {
    const errors = logData.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    const logEntity = new LogEntity({
      logId: crypto.randomUUID(),
      description: logData.description,
      ipAddress: logData.ipAddress,
      deviceInfo: logData.deviceInfo,
      actionType: logData.actionType,
      timestamp: new Date(),
    });

    const createdLog = await this.logRepository.create(logEntity);

    return new LogResponseDto(createdLog);
  }

  /**
   * Get all logs with optional filters
   */
  async getAllLogs(filters?: GetLogsDto): Promise<LogResponseDto[]> {
    if (filters) {
      const errors = filters.validate();
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }
    }

    const logs = await this.logRepository.findAll(filters);
    return logs.map((log) => new LogResponseDto(log));
  }

  /**
   * Get most recent logs limited by `limit`
   */
  async getRecentLogs(limit: number): Promise<LogResponseDto[]> {
    if (limit <= 0) {
      throw new Error("Limit must be greater than 0");
    }

    const logs = await this.logRepository.findRecent(limit);
    return logs.map((log) => new LogResponseDto(log));
  }

  /**
   * Get a log by its ID
   */
  async getLogById(logId: string): Promise<LogResponseDto | null> {
    if (!logId || logId.trim().length === 0) {
      throw new Error("logId is required");
    }

    const log = await this.logRepository.findById(logId);
    return log ? new LogResponseDto(log) : null;
  }

  /**
   * Delete a log by its ID
   */
  async deleteLog(logId: string): Promise<boolean> {
    if (!logId || logId.trim().length === 0) {
      throw new Error("logId is required");
    }

    return this.logRepository.delete(logId);
  }
}
