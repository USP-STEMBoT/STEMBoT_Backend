// FILE PATH: src/utils/vector.util.ts
// FILE DESCRIPTION: Utility functions for vector operations

// import { QuestionEntity } from "../entities/question.entity";
// import { cosineSimilarity } from "./similarity.util";

// export function findMostSimilar(
//   targetEmbedding: number[],
//   questions: QuestionEntity[],
// ): { question: QuestionEntity; similarity: number } | null {
//   if (questions.length === 0) {
//     return null;
//   }

//   let maxSimilarity = -1;
//   let mostSimilar: QuestionEntity | null = null;

//   for (const question of questions) {
//     const similarity = cosineSimilarity(targetEmbedding, question.embedding);
//     if (similarity > maxSimilarity) {
//       maxSimilarity = similarity;
//       mostSimilar = question;
//     }
//   }

//   return mostSimilar
//     ? { question: mostSimilar, similarity: maxSimilarity }
//     : null;
// }

// src/utils/vector.util.ts

import { QuestionEntity } from "../entities/question.entity";
import { cosineSimilarity } from "./similarity.util";
import { SIMILARITY_THRESHOLD } from "../config/openai.config";

export interface SimilarityResult {
  question: QuestionEntity;
  similarity: number;
  confidenceLevel: "high" | "medium" | "low" | "none";
}

/**
 * Get confidence level based on similarity score
 */
function getConfidenceLevel(
  similarity: number,
): "high" | "medium" | "low" | "none" {
  if (similarity >= 0.9) return "high";
  if (similarity >= 0.8) return "medium";
  if (similarity >= 0.7) return "low";
  return "none";
}

export function findMostSimilar(
  targetEmbedding: number[],
  questions: QuestionEntity[],
  threshold: number = SIMILARITY_THRESHOLD,
): SimilarityResult | null {
  if (questions.length === 0) {
    return null;
  }

  let maxSimilarity = -1;
  let mostSimilar: QuestionEntity | null = null;

  for (const question of questions) {
    const similarity = cosineSimilarity(targetEmbedding, question.embedding);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilar = question;
    }
  }

  // Return null if best match is below threshold
  if (maxSimilarity < threshold || !mostSimilar) {
    return null;
  }

  return {
    question: mostSimilar,
    similarity: maxSimilarity,
    confidenceLevel: getConfidenceLevel(maxSimilarity),
  };
}
