import { ChatResponseDto } from "../../dtos/chat.dto";

export interface IChatService {
  processQuestion(question: string): Promise<ChatResponseDto>;
}
