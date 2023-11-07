import OpenAI from "openai";
import { AppFiguresReview } from "../types";

export async function getReviewResponse(review: AppFiguresReview, openai: OpenAI) {
  if (review.has_response) {
    return null;
  }

  const prompt = process.env.OPENAI_PROMPT;

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: `${prompt}\n\n${review.original_review}` }],
    model: 'gpt-3.5-turbo',
  }).catch((error) => console.log(error));

  return completion?.choices[0].message.content;
}
