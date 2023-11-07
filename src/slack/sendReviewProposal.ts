import { App, MessageAttachment } from "@slack/bolt";
import { AppFiguresReview, AppFiguresStars } from "../types";
import { sendMessage } from ".";

function formatStars(starsString: AppFiguresStars) {
  const stars = Number(starsString.split(".")[0]);

  return "⭐️".repeat(stars);
}

export async function sendReviewProposal(
  app: App,
  ts: string,
  review: AppFiguresReview,
  response: string
) {
  const formatReview = `${review.original_review}\n_Review: ${formatStars(
    review.stars
  )}_`;

  const reviewAttachement: MessageAttachment = {
    mrkdwn_in: ["text"],
    color: "#BCBCBC",
    author_name: review.author,
    title: review.original_title,
    text: formatReview,
  };
  const responseAttachement: MessageAttachment = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: response,
        },
        accessory: {
          type: "image",
          image_url: "https://i.postimg.cc/ZRjbG8zv/b4-F1e-Vp-J-400x400.jpg",
          alt_text: "OpenAI logo",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Send",
            },
            action_id: "send_review",
            style: "primary",
            value: `${review.id}--${response}`,
          },
        ],
      },
    ],
  };

  await sendMessage(
    app,
    [reviewAttachement, responseAttachement],
    `📲 Review on ${review.store}`,
    ts
  );
}
