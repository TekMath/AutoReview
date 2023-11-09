import OpenAI from "openai";
import { App } from "@slack/bolt";
import { getReviewResponse } from "./gpt/getReviewResponse";
import {
  sendNewReviewsMessage,
  sendNoReviewMessage,
  sendReviewProposal,
} from "./slack";
import { Apple, Google } from "./stores";
import { androidpublisher_v3 } from "googleapis";
import { ASCReviewData, GlobalReview } from "./types";

function mergeReviews(
  googleReviews: androidpublisher_v3.Schema$Review[],
  appleReviews: ASCReviewData[]
) {
  const reviews: GlobalReview[] = [];

  for (const review of googleReviews) {
    if (!review.comments || !review.reviewId || !review.comments[0].userComment) {
      continue;
    }

    const userComment = review.comments[0].userComment;
    reviews.push({
      type: "google",
      id: review.reviewId,
      title: "New review",
      author: review.authorName || "Anonymous",
      createdAt: new Date(Number(userComment.lastModified?.seconds) * 1000),
      rating: userComment.starRating as GlobalReview["rating"],
      description: userComment.text || "No description",
    });
  }

  for (const review of appleReviews) {
    reviews.push({
      type: "apple",
      id: review.id,
      title: review.attributes.title,
      author: review.attributes.reviewerNickname,
      createdAt: new Date(review.attributes.createdDate),
      rating: review.attributes.rating,
      description: review.attributes.body,
    });
  }
  
  return reviews;
}

export async function run(app: App, apple: Apple, google: Google) {
  const googleReviews = await google.getReviews();
  const appleReviews = await apple.getReviews();
  const reviews = mergeReviews(googleReviews, appleReviews);

  if (reviews.length < 1) {
    return sendNoReviewMessage(app);
  }

  const ts = await sendNewReviewsMessage(app, reviews.length);
  if (!ts) {
    return;
  }

  const openai = new OpenAI();
  reviews.map(async (review) => {
    const response = await getReviewResponse(review, openai);
    if (!response || response.length > 350) {
      console.log(`Too big ${review.id}`)
      return;
    }

    await sendReviewProposal(app, ts, review, response);
  });
}
