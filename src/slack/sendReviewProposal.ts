import { App, MessageAttachment } from "@slack/bolt";
import { sendMessage } from ".";
import { GlobalReview } from "../types";

export async function sendReviewProposal(
  app: App,
  ts: string,
  review: GlobalReview,
  response: string
) {
  const formatReview = `${review.description}\n_Review: ${"⭐️".repeat(
    review.rating
  )}_`;

  const reviewAttachement: MessageAttachment = {
    mrkdwn_in: ["text"],
    color: "#BCBCBC",
    author_name: review.author,
    title: review.title,
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
            value: `${review.id}--${review.type}--${review.author}--${response}`,
          },
        ],
      },
    ],
  };

  await sendMessage(
    app,
    [reviewAttachement, responseAttachement],
    `📲 Review on ${review.type}`,
    ts
  );
}
