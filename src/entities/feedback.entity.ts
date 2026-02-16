// FILE PATH: src/entities/feedback.entity.ts

export class StudentFeedbackEntity {
  id: string;
  studentName: string;
  studentID: string | null;
  rating: number;
  feedbackText: string;
  submittedAt: Date;

  constructor(data: Partial<StudentFeedbackEntity> = {}) {
    this.id = data.id || "";
    this.studentName = data.studentName || "";
    this.studentID = data.studentID || null;
    this.rating = data.rating || 0;
    this.feedbackText = data.feedbackText || "";
    this.submittedAt = data.submittedAt || new Date();
  }

  // Convert to response DTO
  toResponseDto() {
    return {
      id: this.id,
      studentName: this.studentName,
      studentID: this.studentID,
      rating: this.rating,
      feedbackText: this.feedbackText,
      submittedAt: this.submittedAt.toISOString(),
    };
  }

  // Convert from database model
  static fromDatabaseModel(model: any): StudentFeedbackEntity {
    return new StudentFeedbackEntity({
      id: model.id,
      studentName: model.studentName,
      studentID: model.studentID,
      rating: model.rating,
      feedbackText: model.feedbackText,
      submittedAt: model.submittedAt,
    });
  }
}
