// FILE PATH: src/services/interfaces/ILogService.ts
// FILE DESCRIPTION: Interface for Log service operations

import { LogResponseDto } from "../../dtos/log.dto";
import { CreateLogDto, GetLogsDto } from "../../dtos/log.dto";

export interface ILogService {
  /**
   * Create a new log entry
   * @param logData Data required to create a log
   * @returns Promise resolving to a LogResponseDto
   */
  createLog(logData: CreateLogDto): Promise<LogResponseDto>;

  /**
   * Fetch all logs with optional filters/search
   * @param filters Optional filtering parameters
   * @returns Promise resolving to an array of LogResponseDto
   */
  getAllLogs(filters?: GetLogsDto): Promise<LogResponseDto[]>;

  /**
   * Fetch the most recent logs limited by `limit`
   * @param limit Number of logs to retrieve
   * @returns Promise resolving to an array of LogResponseDto
   */
  getRecentLogs(limit: number): Promise<LogResponseDto[]>;

  /**
   * Fetch a log by its unique ID
   * @param logId Log ID to search for
   * @returns Promise resolving to LogResponseDto or null if not found
   */
  getLogById(logId: string): Promise<LogResponseDto | null>;

  /**
   * Delete a log by its unique ID
   * @param logId Log ID to delete
   * @returns Promise resolving to boolean indicating success
   */
  deleteLog(logId: string): Promise<boolean>;
}
