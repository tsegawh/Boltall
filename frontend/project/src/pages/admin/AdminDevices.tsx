import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Smartphone, Battery, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Device } from '../../types';
import { format } from 'date-fns';

const AdminDevices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchTerm, statusFilter]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockDevices: Device[] = [
        {
          id: '1',
          name: 'Vehicle 001',
          imei: '123456789012345',
          status: 'active',
          lastUpdate: '2024-01-20T10:30:00Z',
          expiryDate: '2024-02-20T00:00:00Z',
          batteryLevel: 85,
          position: {
            id: 'pos_1',
            deviceId: '1',
            latitude: 9.0320,
            longitude: 38.7469,
            speed: 45,
            course: 180,
            altitude: 2400,
            accuracy: 5,
            timestamp: '2024-01-20T10:30:00Z',
            address: 'Bole Road, Addis Ababa'
          }
        },
        {
          id: '2',
          name: 'Truck 002',
          imei: '234567890123456',
          status: 'inactive',
          lastUpdate: '2024-01-19T15:45:00Z',
          expiryDate: '2024-02-15T00:00:00Z',
          batteryLevel: 23,
          position: {
            id: 'pos_2',
            deviceId: '2',
            latitude: 9.0420,
            longitude: 38.7569,
            speed: 0,
            course: 0,
            altitude: 2350,
            accuracy: 8,
            timestamp: '2024-01-19T15:45:00Z',
            address: 'Meskel Square, Addis Ababa'
          }
        },
        {
          id: '3',
          name: 'Fleet 003',
          imei: '345678901234567',
          status: 'expired',
          lastUpdate: '2024-01-10T08:20:00Z',
          expiryDate: '2024-01-15T00:00:00Z',
          batteryLevel: 0
        }
      ];
      setDevices(mockDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = devices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.imei.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(device => device.status === statusFilter);
    }

    setFilteredDevices(filtered);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowEditModal(true);
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        // Simulate API call
        console.log('Deleting device:', deviceId);
        setDevices(devices.filter(device => device.id !== deviceId));
      } catch (error) {
        console.error('Failed to delete device:', error);
      }
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
          <p className="text-gray-600">Monitor and manage all GPS tracking devices</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.status === 'expired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="w-4 h-4 mr-1" />
            {filteredDevices.length} of {devices.length} devices
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                        <div className="text-sm text-gray-500">{device.imei}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.status)}`}>
                      {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {device.batteryLevel ? (
                      <div className="flex items-center">
                        <Battery className={`w-4 h-4 mr-1 ${getBatteryColor(device.batteryLevel)}`} />
                        <span className="text-sm font-medium">{device.batteryLevel}%</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {device.position ? (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <div className="text-sm">
                          <div className="text-gray-900">{device.position.address || 'Unknown'}</div>
                          <div className="text-gray-500">
                            {device.position.latitude.toFixed(4)}, {device.position.longitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No location</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {format(new Date(device.lastUpdate), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {format(new Date(device.expiryDate), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditDevice(device)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDevice(device.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Device Modal */}
      {showEditModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Device</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedDevice.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMEI
                </label>
                <input
                  type="text"
                  defaultValue={selectedDevice.imei}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  defaultValue={selectedDevice.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDevices;