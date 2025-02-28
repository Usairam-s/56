import React, { useState, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { PLANS, type Plan, createCheckoutSession, createPortalSession, isStripeEnabled } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { 
  CreditCard, 
  Coins, 
  Star, 
  Check, 
  AlertCircle,
  Sparkles,
  Zap,
  RefreshCw,
  Settings,
  Lock
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const TokenSystem: React.FC = () => {
  const { credits, subscription } = useTeleprompterStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handlePurchase = async (planId: Plan) => {
    if (!isStripeEnabled()) {
      setError('Payment system is currently unavailable. Please try again later.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await createCheckoutSession(planId);
      window.location.href = session.url;
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!isStripeEnabled()) {
      setError('Subscription management is currently unavailable. Please try again later.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      setError('Failed to open subscription management. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isStripeEnabled()) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment System Unavailable
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The payment system is currently unavailable. Please try again later or contact support for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Script Credits
          </h2>
        </div>
        {subscription.type !== 'none' && (
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <Settings className="w-5 h-5" />
            <span>Manage Subscription</span>
          </button>
        )}
      </div>

      {/* Current Credits */}
      <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              Available Credits
            </p>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
              {credits} Scripts
            </p>
            {subscription.type !== 'none' && (
              <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mt-1">
                {subscription.type === 'pro' ? 'Pro Plan' : 'Basic Plan'} •{' '}
                {subscription.expiresAt && new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Plan */}
        <div className={`
          p-6 rounded-xl border-2 transition-all
          ${selectedPlan === 'BASIC'
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
          }
        `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {PLANS.BASIC.name}
            </h3>
            <Coins className="w-6 h-6 text-indigo-600" />
          </div>
          
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              ${PLANS.BASIC.price}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              /pack
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {PLANS.BASIC.description}
          </p>

          <ul className="space-y-2 mb-6">
            {PLANS.BASIC.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePurchase('BASIC')}
            disabled={loading}
            className={`
              w-full py-2 px-4 rounded-lg font-medium transition-colors
              ${selectedPlan === 'BASIC'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Purchase Credits
                <CreditCard className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`
          p-6 rounded-xl border-2 transition-all relative overflow-hidden
          ${selectedPlan === 'PRO'
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
          }
        `}>
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full">
              Best Value
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {PLANS.PRO.name}
            </h3>
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              ${PLANS.PRO.price}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              /month
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {PLANS.PRO.description}
          </p>

          <ul className="space-y-2 mb-6">
            {PLANS.PRO.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePurchase('PRO')}
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Subscribe Now
                <Zap className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:text-red-700 dark:hover:text-red-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};