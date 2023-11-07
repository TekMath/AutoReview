import { App, MessageAttachment } from "@slack/bolt";

export async function sendNoReviewMessage(app: App) {
  const attachement: MessageAttachment = {
    mrkdwn_in: ["text"],
    color: "#C73232",
    title: "Oups... 🫢",
    text: "Unfortunately, there are no reviews on the stores... Please consider coming back later.",
  };

  await sendMessage(
    app,
    [attachement],
    "📋 Here the list of answers to send to the app reviews today."
  );
}

export async function sendNewReviewsMessage(app: App, reviews: number) {
  const attachement: MessageAttachment = {
    mrkdwn_in: ["text"],
    color: "#32C75D",
    title: "The list is available in the thread 📗",
    text: `Find a list of ${reviews} reviews ready to be sent using GPT.\nMake sure to read the content carefully before sending.`,
  };

  const message = await sendMessage(
    app,
    [attachement],
    "📋 Here the list of answers to send to the app reviews today."
  );
  return message.ts;
}

export async function sendMessage(
  app: App,
  attachments: MessageAttachment[] | undefined,
  text: string,
  thread_ts?: string
) {
  const channelId = process.env.SLACK_CHANNEL_ID;
  if (!channelId) {
    throw new Error("Please provide a slack channel ID");
  }

  return await app.client.chat.postMessage({
    channel: channelId,
    text,
    attachments,
    thread_ts,
  });
}
