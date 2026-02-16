// FILE PATH: src/repositories/interfaces/ILogRepository.ts
// FILE DESCRIPTION: Interface for Log repository operations

// Imports
import { LogEntity } from "../../entities/log.entity";
import { GetLogsDto } from "../../dtos/log.dto";

export interface ILogRepository {
  /**
   * Create a new log entry
   * @param logData LogEntity or relevant fields to create a log
   * @returns Promise resolving to the created LogEntity
   */
  create(logData: LogEntity): Promise<LogEntity>;

  /**
   * Get all logs, optionally filtered by GetLogsDto
   * @param filters Optional filters for search
   * @returns Promise resolving to an array of LogEntity
   */
  findAll(filters?: GetLogsDto): Promise<LogEntity[]>;

  /**
   * Get the most recent logs
   * @param limit Number of logs to return
   * @returns Promise resolving to an array of LogEntity
   */
  findRecent(limit: number): Promise<LogEntity[]>;

  /**
   * Find a log by its unique ID
   * @param logId Log ID to search for
   * @returns Promise resolving to LogEntity or null if not found
   */
  findById(logId: string): Promise<LogEntity | null>;

  /**
   * Delete a log by its unique ID
   * @param logId Log ID to delete
   * @returns Promise resolving to boolean indicating success
   */
  delete(logId: string): Promise<boolean>;
}
