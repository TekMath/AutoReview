import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { google, androidpublisher_v3 } from "googleapis";

export class Google {
  auth: GoogleAuth<JSONClient>;
  androidPublisher: androidpublisher_v3.Androidpublisher;

  constructor(config: { keyFile: string; scopes: string[] }) {
    this.auth = new google.auth.GoogleAuth(config);
    this.androidPublisher = google.androidpublisher({
      version: "v3",
      auth: this.auth,
    });
  }

  private async getWeeklyReviews(token?: string) {
    const response = await this.androidPublisher.reviews
      .list({
        packageName: process.env.GOOGLE_APP_PACKAGE,
        token,
      })
      .catch((error) => console.log(error));
    return response?.data;
  }

  async sendReviewResponse(id: string, response: string) {
    const res = await this.androidPublisher.reviews.reply({
      packageName: process.env.GOOGLE_APP_PACKAGE,
      reviewId: id,
      requestBody: { replyText: response },
    }).catch((error) => console.log(error));

    return res;
  }

  async getReviews() {
    const reviews = [];
    let token = undefined;

    const data = await this.getWeeklyReviews();
    if (!data || !data.reviews) {
      return [];
    }
    reviews.push(...data.reviews);
    token = data.tokenPagination?.nextPageToken;

    while (token) {
      const data = await this.getWeeklyReviews(token);
      if (!data || !data.reviews) {
        continue;
      }

      reviews.push(...data.reviews);
      token = data.tokenPagination?.nextPageToken;
    }

    return reviews.filter((review) => {
      if (review.comments?.find((comment) => comment.developerComment)) {
        return false;
      }

      const userComment = review.comments?.find(
        (comment) => comment.userComment
      )?.userComment;
      if (!userComment || !userComment.lastModified) {
        return false;
      }

      const date = new Date();
      const lastModifiedSeconds = Number(userComment.lastModified?.seconds);
      date.setDate(date.getDate() - 4);

      const yesterdaySeconds = Math.floor(date.getTime() / 1000);
      if (yesterdaySeconds > lastModifiedSeconds) {
        return false;
      }

      return true;
    });
  }
}
