export class ChatRequestDto {
  question: string;

  constructor(data: any) {
    this.question = data.question;
  }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.question || this.question.trim().length === 0) {
      errors.push("Question is required");
    }
    return errors;
  }
}

export class ChatResponseDto {
  answer: string;
  source: "cache" | "openai";
  confidence?: number;

  constructor(answer: string, source: "cache" | "openai", confidence?: number) {
    this.answer = answer;
    this.source = source;
    this.confidence = confidence;
  }
}
