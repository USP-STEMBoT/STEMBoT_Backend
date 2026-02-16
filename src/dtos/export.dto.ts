// FILE PATH: src/dtos/export.dto.ts
// FILE DESCRIPTION: Data Transfer Objects for export endpoints

export class ExportRequestDto {
  startDate?: string;
  endDate?: string;
  format: "excel" | "csv" | "json";

  constructor(data: any) {
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.format = data.format || "excel";
  }

  validate(): string[] {
    const errors: string[] = [];

    // Validate format
    const validFormats = ["excel", "csv", "json"];
    if (!validFormats.includes(this.format)) {
      errors.push(`format must be one of: ${validFormats.join(", ")}`);
    }

    // Validate date range
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push("Invalid date format. Use YYYY-MM-DD");
      } else if (start > end) {
        errors.push("startDate must be before or equal to endDate");
      }
    } else if (this.startDate && !this.endDate) {
      errors.push("endDate is required when startDate is provided");
    } else if (!this.startDate && this.endDate) {
      errors.push("startDate is required when endDate is provided");
    }

    return errors;
  }
}
