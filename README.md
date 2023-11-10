# AutoReview
⭐️ Automated App Review Responses with ChatGPT Integration (Google and Apple Compatible)

This project enables automated reviews for your app, seamlessly compatible with both Google and Apple platforms. Receive instant, real-time responses from ChatGPT and validate them directly within your enterprise tool, such as Slack. Streamline your app review process and enhance efficiency with this integration.

## Setup

Please refer to the documentation to setup credentials of your app:
- [Google](https://developers.google.com/android-publisher/getting_started?hl=fr#configure)
- [App Store Connect](https://developer.apple.com/documentation/appstoreconnectapi/generating_tokens_for_api_requests)
- [Slack](https://slack.dev/bolt-js/tutorial/getting-started)

In order for the system to work properly, you will need to set up the following files:
- `.env`: Following the `.env.example` model
- `APPLE_PRIVATE_KEY.p8`: This file contains the apple private key which is supplied with an ID to be inserted in the .env file. This key must have the necessary permissions to retrieve customer reviews AND send a reply (admin permission - 2023).
- `GOOGLE_CREDS.json`: This json file is supplied by GCP when your service account is created. Remember to activate the necessary permissions in the GooglePlayConsole > Setup > API access panel.
- `prompt.txt`: This file will contain the basic prompt that will be used to generate a response to reviews. Remember to request a maximum 350-character response, or you won't be able to send any reply to the blinds.

⚠️ As far as the model used for GPT is concerned, we're using the GPT 4 Turbo preview here. **We strongly advise you to modify the model yourself to suit your needs.**
You'll find the template in the `src/gpt/getReviewResponse` file.
You'll find all template information [here](https://platform.openai.com/docs/models).

## Launch
Start by building the project with docker:
```
docker build . --tag autoreview
```

Next, start the projet with the env file:
```
docker run --rm --env-file .env autoreview
```
Free to add `-d` flag for continuous production.

## Infos
By default, the bot sends a list of all reviews at 23:58. Feel free to modify this directly in `src/index.ts`.

You can decide to modify the maximum limit of reviews that are get in order to optimize requests according to your influence.
You'll find this in the `getReviews` queries available in the `Google` and `Apple` classes in `src/stores`. 