// FILE PATH: src/repositories/log.repository.ts
// FILE DESCRIPTION: Implementation of Log repository

import { PrismaClient } from "@prisma/client";
import { ILogRepository } from "./interfaces/ILogRepository";
import { LogEntity } from "../entities/log.entity";
import { GetLogsDto } from "../dtos/log.dto";

export class LogRepository implements ILogRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  /**
   * Create a new log entry
   */
  async create(logData: LogEntity): Promise<LogEntity> {
    const created = await this.prisma.log.create({
      data: {
        logId: logData.logId,
        description: logData.description,
        ipAddress: logData.ipAddress,
        timestamp: logData.timestamp || new Date(),
        deviceInfo: logData.deviceInfo,
        actionType: logData.actionType,
      },
    });

    return new LogEntity(created);
  }

  /**
   * Get all logs with optional filters
   */
  async findAll(filters?: GetLogsDto): Promise<LogEntity[]> {
    const where: any = {};

    if (filters) {
      if (filters.actionType) {
        where.actionType = filters.actionType;
      }
      if (filters.description) {
        where.description = {
          contains: filters.description,
          mode: "insensitive",
        };
      }
      if (filters.ipAddress) {
        where.ipAddress = { contains: filters.ipAddress, mode: "insensitive" };
      }
      if (filters.deviceInfo) {
        where.deviceInfo = {
          contains: filters.deviceInfo,
          mode: "insensitive",
        };
      }
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }
    }

    const logs = await this.prisma.log.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });

    return logs.map((log: any) => new LogEntity(log));
  }

  /**
   * Get the most recent logs limited by `limit`
   */
  async findRecent(limit: number): Promise<LogEntity[]> {
    const logs = await this.prisma.log.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return logs.map((log: any) => new LogEntity(log));
  }

  /**
   * Find a log by its unique ID
   */
  async findById(logId: string): Promise<LogEntity | null> {
    const log = await this.prisma.log.findUnique({
      where: { logId },
    });
    return log ? new LogEntity(log) : null;
  }

  /**
   * Delete a log by its unique ID
   */
  async delete(logId: string): Promise<boolean> {
    try {
      await this.prisma.log.delete({
        where: { logId },
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
