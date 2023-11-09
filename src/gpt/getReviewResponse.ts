import OpenAI from "openai";
import { GlobalReview } from "../types";

export async function getReviewResponse(review: GlobalReview, openai: OpenAI) {
  if (!review.description) {
    return null;
  }

  const prompt = process.env.OPENAI_PROMPT;
  const completion = await openai.chat.completions
    .create({
      messages: [
        { role: "user", content: `${prompt}\n\n${review.description}` },
      ],
      model: "gpt-3.5-turbo",
    }).catch((error) => console.log(error));

  return completion?.choices[0].message.content;
}
