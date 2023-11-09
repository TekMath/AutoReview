export interface GlobalReview {
  type: "google" | "apple";
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  createdAt: Date;
}
