import {
  ButtonAction,
  MessageAttachment,
  RespondFn,
  SlackAction,
} from "@slack/bolt";

export async function editValidationMessage(
  respond: RespondFn,
  body: SlackAction,
  author: string,
  apiReturn: any
) {
  if (body.type !== "block_actions") {
    return;
  }

  const orignialAttachment = body.message?.attachments[0] as MessageAttachment;
  const responseAttachment = body.message?.attachments[1] as MessageAttachment;
  responseAttachment.blocks?.pop();

  const invalidAttachment: MessageAttachment = {
    mrkdwn_in: ["text"],
    color: "#BCBCBC",
    author_name: `By ${body.user.username}`,
    title: "Invalid send",
    text: `‼️ Error during the reply for ${author} review`,
  };
  const validAttachment: MessageAttachment = {
    mrkdwn_in: ["text"],
    color: "#4DA1B4",
    author_name: `By ${body.user.username}`,
    title: "Successfully send",
    text: `☑️ We have successfully sent the reply for ${author} review`,
  };

  if (!apiReturn) {
    return await respond({
      attachments: [orignialAttachment, responseAttachment, invalidAttachment],
      text: body.message?.text,
    });
  }
  return await respond({
    attachments: [orignialAttachment, responseAttachment, validAttachment],
    text: body.message?.text,
  });
}
