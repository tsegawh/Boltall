import React, { useState } from 'react';
import { Plus, Smartphone, Battery, MapPin, Calendar, AlertCircle, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Device } from '../types';
import { format } from 'date-fns';
import AddDeviceModal from '../components/AddDeviceModal';

const Devices: React.FC = () => {
  const { devices, subscription, refreshUserData } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const canAddDevice = () => {
    if (!subscription) return false;
    return devices.length < subscription.deviceLimit;
  };

  const handleAddDevice = async (deviceData: { name: string; imei: string }) => {
    try {
      // Simulate API call
      console.log('Adding device:', deviceData);
      await refreshUserData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add device:', error);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        // Simulate API call
        console.log('Deleting device:', deviceId);
        await refreshUserData();
      } catch (error) {
        console.error('Failed to delete device:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
          <p className="text-gray-600">
            {devices.length} of {subscription?.deviceLimit || 0} devices used
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!canAddDevice()}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            canAddDevice()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Device
        </button>
      </div>

      {!canAddDevice() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              You've reached your device limit. Upgrade your plan to add more devices.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-500">{device.imei}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedDevice(device)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDevice(device.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </span>
              </div>

              {device.batteryLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Battery</span>
                  <div className="flex items-center">
                    <Battery className={`w-4 h-4 mr-1 ${getBatteryColor(device.batteryLevel)}`} />
                    <span className="text-sm font-medium">{device.batteryLevel}%</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-sm font-medium">
                  {format(new Date(device.lastUpdate), 'MMM dd, HH:mm')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expires</span>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm font-medium">
                    {format(new Date(device.expiryDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              {device.position && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location</span>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium">
                      {device.position.address || `${device.position.latitude.toFixed(4)}, ${device.position.longitude.toFixed(4)}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No devices yet</h3>
          <p className="text-gray-600 mb-4">Add your first device to start tracking</p>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!canAddDevice()}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canAddDevice()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add Device
          </button>
        </div>
      )}

      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDevice}
          maxDevices={subscription?.deviceLimit || 0}
          currentDevices={devices.length}
        />
      )}
    </div>
  );
};

export default Devices;