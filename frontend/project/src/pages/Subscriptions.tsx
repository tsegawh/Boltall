import React, { useState } from 'react';
import { Crown, Calendar, CreditCard, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Plan } from '../types';
import { format, addDays } from 'date-fns';

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    deviceLimit: 3,
    price: 200,
    currency: 'ETB',
    duration: 30,
    features: [
      'Up to 3 devices',
      'Real-time tracking',
      'Basic reports',
      'Email support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    deviceLimit: 10,
    price: 500,
    currency: 'ETB',
    duration: 30,
    features: [
      'Up to 10 devices',
      'Real-time tracking',
      'Advanced reports',
      'Route history',
      'Geofencing alerts',
      'Priority support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    deviceLimit: 50,
    price: 1500,
    currency: 'ETB',
    duration: 30,
    features: [
      'Up to 50 devices',
      'Real-time tracking',
      'Custom reports',
      'API access',
      'White-label option',
      'Dedicated support',
      'Custom integrations'
    ]
  }
];

const Subscriptions: React.FC = () => {
  const { subscription, devices } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      // Simulate API call to initiate payment
      console.log('Upgrading to plan:', planId);
      // Redirect to payment page or show payment modal
      window.location.href = `/payment?plan=${planId}`;
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.planName.toLowerCase() === planId;
  };

  const canDowngrade = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan && devices.length <= plan.deviceLimit;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600">Choose the plan that best fits your tracking needs</p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Plan: {subscription.planName}</h3>
                <p className="text-gray-600">
                  {devices.length} of {subscription.deviceLimit} devices used
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {subscription.price} {subscription.currency}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </p>
              <p className="text-sm text-gray-600">
                Expires: {format(new Date(subscription.expiryDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                subscription.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                subscription.status === 'active' ? 'text-green-700' : 'text-red-700'
              }`}>
                {subscription.status === 'active' ? 'Active' : 'Expired'}
              </span>
              {subscription.autoRenew && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Auto-renew enabled
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Manage Billing
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Renew Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
              isCurrentPlan(plan.id)
                ? 'border-blue-500 ring-2 ring-blue-200'
                : selectedPlan === plan.id
                ? 'border-blue-300'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {plan.price} {plan.currency}
              </div>
              <p className="text-gray-600">per month</p>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {isCurrentPlan(plan.id) ? (
              <button
                disabled
                className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || (!canDowngrade(plan.id) && devices.length > plan.deviceLimit)}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  devices.length > plan.deviceLimit
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : 'Select Plan'}
              </button>
            )}

            {devices.length > plan.deviceLimit && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <p className="text-xs text-yellow-800">
                    You have {devices.length} devices. This plan supports up to {plan.deviceLimit}.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Telebirr</p>
                <p className="text-sm text-gray-600">Mobile payment</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Next Billing Date</h4>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">
                  {subscription ? format(new Date(subscription.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Auto-renewal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Can I change my plan anytime?</h4>
            <p className="text-gray-600 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">What happens if I exceed my device limit?</h4>
            <p className="text-gray-600 text-sm">
              You'll need to upgrade to a higher plan or remove some devices to add new ones.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">How do I cancel my subscription?</h4>
            <p className="text-gray-600 text-sm">
              Contact our support team to cancel your subscription. Your service will continue until the end of your billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;