import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Crown, Check } from 'lucide-react';
import { Plan } from '../../types';

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deviceLimit: 1,
    price: 0,
    currency: 'ETB',
    duration: 30,
    features: ['']
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Simulate API call
      const mockPlans: Plan[] = [
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
      setPlans(mockPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        ...formData,
        id: editingPlan?.id || Date.now().toString(),
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editingPlan) {
        // Update existing plan
        setPlans(plans.map(p => p.id === editingPlan.id ? planData as Plan : p));
      } else {
        // Create new plan
        setPlans([...plans, planData as Plan]);
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      deviceLimit: plan.deviceLimit,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      features: [...plan.features, '']
    });
    setShowModal(true);
  };

  const handleDelete = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        setPlans(plans.filter(p => p.id !== planId));
      } catch (error) {
        console.error('Failed to delete plan:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      deviceLimit: 1,
      price: 0,
      currency: 'ETB',
      duration: 30,
      features: ['']
    });
    setEditingPlan(null);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-yellow-500 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {plan.price} {plan.currency}
              </div>
              <p className="text-gray-600">per {plan.duration} days</p>
              <p className="text-sm text-gray-500 mt-1">Up to {plan.deviceLimit} devices</p>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.deviceLimit}
                    onChange={(e) => setFormData({ ...formData, deviceLimit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;