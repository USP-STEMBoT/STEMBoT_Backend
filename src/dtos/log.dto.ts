// FILE PATH: src/dtos/log.dto.ts
// FILE DESCRIPTION: Data Transfer Objects (DTOs) for log-related operations

export class CreateLogDto {
  description: string;
  actionType: string;
  ipAddress?: string;
  deviceInfo?: string;

  constructor(data: any) {
    this.description = data.description;
    this.actionType = data.actionType;
    this.ipAddress = data.ipAddress;
    this.deviceInfo = data.deviceInfo;
  }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.description || this.description.trim().length === 0) {
      errors.push("Description is required");
    }
    if (!this.actionType || this.actionType.trim().length === 0) {
      errors.push("Action type is required");
    }
    return errors;
  }
}

/**
 * DTO for a single log response
 */
export class LogResponseDto {
  logId: string;
  description: string;
  ipAddress: string;
  timestamp: Date;
  deviceInfo: string;
  actionType: string;

  constructor(entity: any) {
    this.logId = entity.logId;
    this.description = entity.description;
    this.ipAddress = entity.ipAddress;
    this.timestamp =
      entity.timestamp instanceof Date
        ? entity.timestamp
        : new Date(entity.timestamp);
    this.deviceInfo = entity.deviceInfo;
    this.actionType = entity.actionType;
  }
}

/**
 * DTO for fetching multiple logs with filters
 */
export class GetLogsDto {
  // Filter by action type
  actionType?: string;

  // Filter by description
  description?: string;

  // Filter by IP address
  ipAddress?: string;

  // Filter by device info
  deviceInfo?: string;

  // Filter by timestamp range
  startDate?: Date;
  endDate?: Date;

  constructor(data: any) {
    this.actionType = data.actionType;
    this.description = data.description;
    this.ipAddress = data.ipAddress;
    this.deviceInfo = data.deviceInfo;
    this.startDate = data.startDate ? new Date(data.startDate) : undefined;
    this.endDate = data.endDate ? new Date(data.endDate) : undefined;
  }

  /**
   * Validate date filters if present
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.startDate && isNaN(this.startDate.getTime())) {
      errors.push("startDate is invalid");
    }
    if (this.endDate && isNaN(this.endDate.getTime())) {
      errors.push("endDate is invalid");
    }
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      errors.push("startDate cannot be after endDate");
    }

    return errors;
  }
}
