import { App } from "@slack/bolt";
import { CronJob } from "cron";
import { run } from "./src/run";
import { configDotenv } from "dotenv";
import { Google } from "./src/stores/Google";
import { Apple } from "./src/stores/Apple";

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

app.action("send_review", async ({ ack, body, respond }) => {
  await ack();
  if (body.type !== "block_actions" || body.actions[0].type != "button") {
    return;
  }

  const value = body.actions[0].value;
  const [id, type, author, response] = value.split("--");

  if (type === "google") {
    const valid = await google.sendReviewResponse(id, response);
    if (!valid) {
      return await respond(`‼️ Error during the reply for ${author} review`);
    }
    return await respond(
      `✅ We have successfully sent the reply for ${author} review`
    );
  }

  if (type === "apple") {
    const valid = await apple.sendReviewResponse(id, response);
    if (!valid) {
      return await respond(`‼️ Error during the reply for ${author} review`);
    }
    return await respond(
      `✅ We have successfully sent the reply for ${author} review`
    );
  }
});

app.start();

CronJob.from({
  cronTime: "58 23 * * *",
  onTick: () => run(app, apple, google),
  start: true,
  timeZone: "Europe/Paris",
});
