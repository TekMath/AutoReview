import { CountryCode } from "./CountryCode";

export interface ASCCustomerReviewRelationships {
  response: {
    links: {
      self: `https://api.appstoreconnect.apple.com/v1/customerReviews/${string}/relationships/response`;
      related: `https://api.appstoreconnect.apple.com/v1/customerReviews/${string}/response`;
    };
  };
}

export interface ASCCustomerReviewAttributes {
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  reviewerNickname: string;
  createdDate: string;
  territory: CountryCode;
}

export interface ASCReviewData {
  type: "customerReviews";
  id: string;
  attributes: ASCCustomerReviewAttributes;
  relationships: ASCCustomerReviewRelationships;
  links: {
    self: `https://api.appstoreconnect.apple.com/v1/customerReviews/${string}`;
  };
}

export interface ASCReviews {
  data: ASCReviewData[];
  links: {
    self: string;
    next: string | undefined;
  };
  meta: {
    paging: {
      total: number;
      limit: number;
    };
  };
}
