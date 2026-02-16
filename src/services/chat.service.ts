import { IChatService } from "./interfaces/IChatService";
import { IQuestionService } from "./interfaces/IQuestionService";
import { IOpenAIService } from "./interfaces/IOpenAIService";
import { IChatHistoryRepository } from "../repositories/interfaces/IChatHistoryRepository";
import { ChatResponseDto } from "../dtos/chat.dto";

export class ChatService implements IChatService {
  constructor(
    private questionService: IQuestionService,
    private openaiService: IOpenAIService,
    private chatHistoryRepo: IChatHistoryRepository,
  ) {}

  async processQuestion(question: string): Promise<ChatResponseDto> {
    // First, try to find a similar question in cache
    const similarQuestion =
      await this.questionService.findSimilarQuestion(question);

    if (similarQuestion) {
      // Found in cache
      const answer = similarQuestion.question.answer;
      await this.chatHistoryRepo.create(question, answer, "cache");
      return new ChatResponseDto(answer, "cache", similarQuestion.similarity);
    }

    // Not found in cache, query OpenAI
    const answer = await this.openaiService.generateAnswer(question);

    // Save to cache for future use
    await this.questionService.addQuestion(question, answer);

    // Save to chat history
    await this.chatHistoryRepo.create(question, answer, "openai");

    return new ChatResponseDto(answer, "openai");
  }
}
