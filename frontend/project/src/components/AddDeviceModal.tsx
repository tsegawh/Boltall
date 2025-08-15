import React, { useState } from 'react';
import { X, Smartphone, AlertCircle } from 'lucide-react';

interface AddDeviceModalProps {
  onClose: () => void;
  onAdd: (device: { name: string; imei: string }) => Promise<void>;
  maxDevices: number;
  currentDevices: number;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  onClose,
  onAdd,
  maxDevices,
  currentDevices
}) => {
  const [formData, setFormData] = useState({
    name: '',
    imei: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.imei.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.imei.length !== 15) {
      setError('IMEI must be exactly 15 digits');
      return;
    }

    if (currentDevices >= maxDevices) {
      setError('Device limit reached. Please upgrade your plan.');
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
    } catch (err) {
      setError('Failed to add device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'imei' ? value.replace(/\D/g, '').slice(0, 15) : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Smartphone className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Device</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Devices: {currentDevices} / {maxDevices} used
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Device Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Vehicle 001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="imei" className="block text-sm font-medium text-gray-700 mb-1">
              IMEI Number
            </label>
            <input
              type="text"
              id="imei"
              name="imei"
              value={formData.imei}
              onChange={handleInputChange}
              placeholder="15-digit IMEI number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 15-digit IMEI number found on your GPS device
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || currentDevices >= maxDevices}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceModal;