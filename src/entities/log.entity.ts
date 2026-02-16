// FILE PATH: src/entities/log.entity.ts

/**
 * ENTITY NAME: LogEntity
 * ENTITY DESCRIPTION:
 * Domain representation of the Log model.
 * Stores system and user activity logs for
 * auditing and monitoring purposes.
 */
export class LogEntity {
  /**
   * Unique identifier of the log record
   * Maps to Prisma field: logId
   * DB column: LogId
   */
  logId: string;

  /**
   * Description of the logged event
   * Maps to Prisma field: description
   * DB column: Description
   */
  description: string;

  /**
   * IP address from which the action originated
   * Maps to Prisma field: ipAddress
   * DB column: IPAddress
   */
  ipAddress: string;

  /**
   * Timestamp when the log entry was created
   * Maps to Prisma field: timestamp
   * DB column: Timestamp
   */
  timestamp: Date;

  /**
   * Information about the device or client
   * Maps to Prisma field: deviceInfo
   * DB column: DeviceInfo
   */
  deviceInfo: string;

  /**
   * Type of action performed
   * Maps to Prisma field: actionType
   * DB column: ActionType
   */
  actionType: string;

  /**
   * Constructs a LogEntity.
   */
  constructor(data: any) {
    this.logId = data.logId;
    this.description = data.description;
    this.ipAddress = data.ipAddress;

    // Normalize timestamp to a Date instance
    this.timestamp =
      data.timestamp instanceof Date
        ? data.timestamp
        : new Date(data.timestamp);

    this.deviceInfo = data.deviceInfo;
    this.actionType = data.actionType;
  }
}
