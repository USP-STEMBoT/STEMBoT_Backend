// FILE PATH: src/services/interfaces/IOpenAIService.ts
// FILE DESCRIPTION: Interface for OpenAI service

export interface IOpenAIService {
  /**
   * Generates a vector embedding for the given text
   *
   * Embeddings are used for semantic similarity,
   * clustering, and search operations.
   *
   * @param text - Input text to be embedded
   * @returns A numerical vector representing the text
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Generates a natural language answer for a question
   *
   * Optionally uses contextual information to improve
   * the relevance and accuracy of the generated response.
   *
   * @param question - The user question
   * @param context - Optional contextual information (e.g., related documents)
   * @returns The generated answer as a string
   */
  generateAnswer(question: string, context?: string): Promise<string>;
}
