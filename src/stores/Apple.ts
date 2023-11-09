import axios, { AxiosInstance } from "axios";
import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import { ASCReviewData, ASCReviews } from "../types";

export class Apple {
  JWTtoken: string;
  exp: number;
  instance: AxiosInstance;

  constructor(
    public creds: {
      kid: string;
      iss: string;
      privateKeyPath: string;
    },
    public id: string
  ) {
    this.JWTtoken = "";
    this.exp = Date.now();
    this.instance = axios.create({
      baseURL: "https://api.appstoreconnect.apple.com/v1/",
      timeout: 3000,
    });

    this.refreshToken();
  }

  get token() {
    if (this.exp <= Date.now()) {
      this.refreshToken();
    }
    return this.JWTtoken;
  }

  private refreshToken() {
    const privateKey: jwt.Secret = readFileSync(this.creds.privateKeyPath);

    const now = Math.round(Date.now() / 1000);
    const expirationDate = now + 1199;

    const payload = {
      iss: this.creds.iss,
      exp: expirationDate,
      aud: "appstoreconnect-v1",
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: this.creds.kid,
        typ: "JWT",
      },
    };

    const token = jwt.sign(payload, privateKey, signOptions);
    this.JWTtoken = token;
    this.exp = expirationDate;
  }

  async getApps() {
    const response = await this.instance
      .get("apps", {
        headers: {
          Authorization: this.token,
        },
      })
      .catch((error) => console.log(error));

    if (!response) {
      return null;
    }
    console.log(response.data.data);
  }

  async sendReviewResponse(id: string, response: string) {
    const res = await this.instance
      .post(
        `customerReviewResponses`,
        {
          data: {
            attributes: {
              responseBody: response,
            },
            relationships: {
              review: { data: { id, type: "customerReviews" } },
            },
            type: "customerReviewResponses",
          },
        },
        {
          headers: {
            Authorization: this.token,
          },
        }
      )
      .catch((error) => console.log(error));

    return res;
  }

  async getReviews() {
    const response = await this.instance
      .get(
        `apps/${this.id}/customerReviews?sort=-createdDate&exists[publishedResponse]=false&limit=50`,
        {
          headers: {
            Authorization: this.token,
          },
        }
      )
      .catch((error) => console.log(error));

    if (!response) {
      return [];
    }

    const date = new Date();
    date.setDate(date.getDate() - 1);

    const reviews = [];
    const data = response.data as ASCReviews;
    for (const review of data.data) {
      const creationDate = new Date(review.attributes.createdDate);
      if (creationDate >= date) {
        reviews.push(review);
      }
    }

    return reviews;
  }
}
