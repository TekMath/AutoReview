import OpenAI from "openai";
import { GlobalReview } from "../types";
import { readFileSync } from "fs";

export async function getReviewResponse(review: GlobalReview, openai: OpenAI) {
  if (!review.description) {
    return null;
  }

  const prompt = readFileSync("./prompt.txt");
  const completion = await openai.chat.completions
    .create({
      messages: [
        { role: "user", content: `${prompt}\n\n${JSON.stringify(review)}` },
      ],
      model: "gpt-4-1106-preview",
    }).catch((error) => console.log(error));

  return completion?.choices[0].message.content;
}
