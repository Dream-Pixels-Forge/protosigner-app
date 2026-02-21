import type { Subscription } from './types';

const SUBSCRIPTION_STORAGE_KEY = 'protosigner_subscription';

export interface PricingPlan {
  id: 'free' | 'pro' | 'team';
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    projects: number;
    aiGenerations: number;
    storage: string;
    exports: number;
  };
}

export const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic AI generation',
      '5 projects',
      'React/HTML export',
      'Community support',
    ],
    limits: {
      projects: 5,
      aiGenerations: 10,
      storage: '100MB',
      exports: 50,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    interval: 'month',
    features: [
      'Advanced AI generation',
      'Unlimited projects',
      'All export formats',
      'Priority support',
      'Custom templates',
      'Version history',
    ],
    limits: {
      projects: Infinity,
      aiGenerations: 500,
      storage: '10GB',
      exports: Infinity,
    },
  },
  {
    id: 'team',
    name: 'Team',
    price: 39,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared templates',
      'Admin controls',
      'SSO integration',
      'Dedicated support',
    ],
    limits: {
      projects: Infinity,
      aiGenerations: Infinity,
      storage: '100GB',
      exports: Infinity,
    },
  },
];

/**
 * Get current user subscription
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!stored) return null;
  
  const subscription: Subscription = JSON.parse(stored);
  if (subscription.userId !== userId) return null;
  
  // Check if subscription is expired
  if (new Date(subscription.currentPeriodEnd) < new Date()) {
    return { ...subscription, status: 'past_due' as const };
  }
  
  return subscription;
}

/**
 * Create checkout session (mock for now)
 */
export async function createCheckoutSession(planId: string, userId: string): Promise<{ sessionId: string; url: string }> {
  // In production: Call Stripe API to create checkout session
  console.log('Creating checkout session for plan:', planId, 'user:', userId);
  
  // Mock implementation
  return {
    sessionId: `cs_test_${crypto.randomUUID()}`,
    url: `https://checkout.stripe.com/mock/${planId}`,
  };
}

/**
 * Create portal session for managing subscription
 */
export async function createPortalSession(userId: string): Promise<{ url: string }> {
  // In production: Call Stripe API to create portal session
  console.log('Creating portal session for user:', userId);
  
  return {
    url: 'https://billing.stripe.com/mock',
  };
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(_subscriptionId: string): Promise<Subscription> {
  const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!stored) throw new Error('No subscription found');
  
  const subscription: Subscription = JSON.parse(stored);
  subscription.cancelAtPeriodEnd = true;
  
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
  return subscription;
}

/**
 * Check if user has access to a feature based on plan
 */
export function hasAccess(plan: 'free' | 'pro' | 'team', feature: string): boolean {
  const planLimits = PLANS.find(p => p.id === plan)?.limits;
  if (!planLimits) return false;
  
  // Simple feature checks
  if (feature === 'unlimited_projects') {
    return plan === 'pro' || plan === 'team';
  }
  if (feature === 'team_collaboration') {
    return plan === 'team';
  }
  if (feature === 'custom_templates') {
    return plan === 'pro' || plan === 'team';
  }
  
  return true;
}

/**
 * Check usage limits
 */
export function checkLimit(plan: 'free' | 'pro' | 'team', usageType: keyof PricingPlan['limits'], current: number): boolean {
  const limit = PLANS.find(p => p.id === plan)?.limits[usageType];
  if (limit === undefined) return true;
  if (limit === Infinity) return true;
  
  // Parse storage limits (e.g., "100MB" -> 100)
  if (usageType === 'storage') {
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
    return current < limitNum;
  }
  
  return current < (limit as number);
}
