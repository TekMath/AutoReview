import { App, MessageAttachment } from "@slack/bolt";
import { CronJob } from "cron";
import { run } from "./src/run";
import { configDotenv } from "dotenv";
import { Google } from "./src/stores/Google";
import { Apple } from "./src/stores/Apple";
import { editValidationMessage } from "./src/slack/editValidationMessage";

configDotenv();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const apple = new Apple(
  {
    kid: process.env.APPLE_KEY_ID || "",
    iss: process.env.APPLE_ISSUER_ID || "",
    privateKeyPath: "./APPLE_PRIVATE_KEY.p8",
  },
  process.env.APPLE_APP_ID || ""
);

const google = new Google({
  keyFile: "./GOOGLE_CREDS.json",
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});

app.action("send_review", async ({ ack, respond, action, body }) => {
  await ack();
  if (action.type !== "button" || body.type !== "block_actions") {
    return;
  }

  const value = action.value;
  const [id, type, author, response] = value.split("--");

  if (type === "google") {
    const valid = await google.sendReviewResponse(id, response);
    return await editValidationMessage(respond, body, author, valid);
  }

  if (type === "apple") {
    const valid = await apple.sendReviewResponse(id, response);
    return await editValidationMessage(respond, body, author, valid);
  }
});

app.start();

CronJob.from({
  cronTime: "58 23 * * *",
  onTick: () => run(app, apple, google),
  start: true,
  timeZone: "Europe/Paris",
});
