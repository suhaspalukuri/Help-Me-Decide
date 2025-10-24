export enum ContributionType {
  Pro = 'Pro',
  Con = 'Con',
}

export interface Contribution {
  id: string;
  text: string;
  author: string;
  upvotes: number;
}

export interface Option {
  id:string;
  name: string;
  pros: Contribution[];
  cons: Contribution[];
  votes: number;
}

export interface DecisionBoard {
  id: string;
  creatorId: string; // This will now be the user's email
  title: string;
  description: string;
  options: Option[];
  isPublic: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface User {
  id?: string; // The user's unique ID from the authentication provider
  email: string;
  name: string;
  password?: string; // Password should be optional on the frontend model
  securityQuestion: string;
  securityAnswer: string;
}
