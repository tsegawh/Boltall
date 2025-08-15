import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Filter, MapPin, Battery, Clock, Navigation, Users, Smartphone } from 'lucide-react';
import { Device, Position, WebSocketMessage } from '../../types';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createDeviceIcon = (status: string) => {
  const color = status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red';
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const MapUpdater: React.FC<{ devices: Device[] }> = ({ devices }) => {
  const map = useMap();

  useEffect(() => {
    if (devices.length > 0) {
      const positions = devices
        .filter(device => device.position)
        .map(device => [device.position!.latitude, device.position!.longitude] as [number, number]);
      
      if (positions.length > 0) {
        map.fitBounds(positions, { padding: [20, 20] });
      }
    }
  }, [devices, map]);

  return null;
};

const AdminTracking: React.FC = () => {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchAllDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [allDevices, selectedUser, statusFilter]);

  useEffect(() => {
    // Connect to WebSocket for live updates
    const connectWebSocket = () => {
      const wsUrl = process.env.REACT_APP_TRACCAR_WEBSOCKET_URL || 'ws://localhost:8082/api/socket';
      
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('Admin WebSocket connected');
          setIsConnected(true);
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            if (data.positions) {
              setLastUpdate(new Date());
              // Update device positions
              console.log('Received positions:', data.positions);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        wsRef.current.onclose = () => {
          console.log('Admin WebSocket disconnected');
          setIsConnected(false);
          // Reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        wsRef.current.onerror = (error) => {
          console.error('Admin WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchAllDevices = async () => {
    try {
      // Simulate API call to get all devices from all users
      const mockDevices: Device[] = [
        {
          id: '1',
          name: 'Vehicle 001 (John Doe)',
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
          name: 'Truck 002 (Jane Smith)',
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
          name: 'Fleet 003 (Company ABC)',
          imei: '345678901234567',
          status: 'expired',
          lastUpdate: '2024-01-10T08:20:00Z',
          expiryDate: '2024-01-15T00:00:00Z',
          batteryLevel: 0,
          position: {
            id: 'pos_3',
            deviceId: '3',
            latitude: 9.0120,
            longitude: 38.7269,
            speed: 0,
            course: 0,
            altitude: 2300,
            accuracy: 10,
            timestamp: '2024-01-10T08:20:00Z',
            address: 'Piazza, Addis Ababa'
          }
        }
      ];
      setAllDevices(mockDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const filterDevices = () => {
    let filtered = allDevices;

    // User filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter(device => 
        device.name.toLowerCase().includes(selectedUser.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(device => device.status === statusFilter);
    }

    setFilteredDevices(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const uniqueUsers = Array.from(new Set(allDevices.map(device => {
    const userMatch = device.name.match(/\(([^)]+)\)/);
    return userMatch ? userMatch[1] : 'Unknown';
  })));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Tracking - All Devices</h1>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
              {lastUpdate && ` • Last update: ${format(lastUpdate, 'HH:mm:ss')}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{allDevices.length}</p>
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
                {allDevices.filter(d => d.status === 'active').length}
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
                {allDevices.filter(d => d.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-gray-900">Devices ({filteredDevices.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredDevices.map(device => (
              <div
                key={device.id}
                className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{device.name}</h4>
                  <span className={`text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                </div>
                
                {device.position && (
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Navigation className="w-3 h-3 mr-1" />
                      <span>{device.position.speed} km/h</span>
                    </div>
                    {device.batteryLevel && (
                      <div className="flex items-center">
                        <Battery className={`w-3 h-3 mr-1 ${getBatteryColor(device.batteryLevel)}`} />
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{format(new Date(device.lastUpdate), 'HH:mm')}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
            <MapContainer
              center={[9.0320, 38.7469]} // Addis Ababa coordinates
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapUpdater devices={filteredDevices} />
              
              {filteredDevices.map(device => (
                device.position && (
                  <Marker
                    key={device.id}
                    position={[device.position.latitude, device.position.longitude]}
                    icon={createDeviceIcon(device.status)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold text-gray-900 mb-2">{device.name}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{device.position.address || 'Unknown location'}</span>
                          </div>
                          <div className="flex items-center">
                            <Navigation className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{device.position.speed} km/h</span>
                          </div>
                          {device.batteryLevel && (
                            <div className="flex items-center">
                              <Battery className={`w-3 h-3 mr-1 ${getBatteryColor(device.batteryLevel)}`} />
                              <span>{device.batteryLevel}%</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{format(new Date(device.lastUpdate), 'MMM dd, HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTracking;