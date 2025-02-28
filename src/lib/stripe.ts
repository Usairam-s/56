import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe only if key is available
let stripePromise: Promise<any> | null = null;

if (stripeKey) {
  stripePromise = loadStripe(stripeKey);
} else {
  console.warn('Stripe key not found, payment features will be disabled');
}

export const PLANS = {
  BASIC: {
    id: 'price_basic_10scripts',
    name: '10 Scripts',
    price: 5.99,
    credits: 10,
    description: 'Perfect for occasional auditions',
    features: [
      '10 script credits',
      'Basic voice features',
      'Standard support'
    ]
  },
  PRO: {
    id: 'price_pro_monthly',
    name: 'Pro Monthly',
    price: 39.99,
    credits: 20,
    description: 'Ideal for active performers',
    features: [
      '20 scripts per month',
      'Priority voice processing',
      'Advanced analytics',
      'Premium support',
      'Unlimited script storage',
      'Auto-renewal'
    ]
  }
} as const;

export type Plan = keyof typeof PLANS;

export interface PaymentSession {
  id: string;
  url: string;
}

export const isStripeEnabled = (): boolean => {
  return !!stripePromise;
};

export const createCheckoutSession = async (planId: Plan): Promise<PaymentSession> => {
  if (!isStripeEnabled()) {
    throw new Error('Stripe is not configured');
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    throw error;
  }
};

export const createPortalSession = async (): Promise<string> => {
  if (!isStripeEnabled()) {
    throw new Error('Stripe is not configured');
  }

  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Portal session creation failed:', error);
    throw error;
  }
};