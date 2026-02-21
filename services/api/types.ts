export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  plan?: 'free' | 'pro' | 'team';
}

export interface Session {
  user: User;
  expiresAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  thumbnail?: string;
  elements: CanvasElement[];
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ProjectSettings {
  width: number;
  height: number;
  backgroundColor: string;
  gridEnabled: boolean;
  gridColor: string;
}

export interface CanvasElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
  children?: CanvasElement[];
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
