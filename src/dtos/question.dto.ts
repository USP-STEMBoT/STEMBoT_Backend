/**
 * Data Transfer Object (DTO) for creating a Question
 */
export class CreateQuestionDto {
  /** The question text */
  question: string;

  /** The answer corresponding to the question */
  answer: string;

  /**
   * Constructs a CreateQuestionDto from raw input data
   * @param data - Incoming request payload (e.g., request body)
   */
  constructor(data: any) {
    this.question = data.question;
    this.answer = data.answer;
  }

  /**
   * Validates the DTO fields
   * @returns An array of validation error messages (empty if valid)
   */
  validate(): string[] {
    const errors: string[] = [];

    // Ensure question exists and is not empty or whitespace
    if (!this.question || this.question.trim().length === 0) {
      errors.push("Question is required");
    }

    // Ensure answer exists and is not empty or whitespace
    if (!this.answer || this.answer.trim().length === 0) {
      errors.push("Answer is required");
    }

    return errors;
  }
}
