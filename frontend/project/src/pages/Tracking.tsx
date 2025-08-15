import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Filter, MapPin, Battery, Clock, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Device, Position, WebSocketMessage } from '../types';
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

const Tracking: React.FC = () => {
  const { devices } = useAuth();
  const [filteredDevices, setFilteredDevices] = useState<Device[]>(devices);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setFilteredDevices(devices);
  }, [devices]);

  useEffect(() => {
    // Connect to WebSocket for live updates
    const connectWebSocket = () => {
      const wsUrl = process.env.REACT_APP_TRACCAR_WEBSOCKET_URL || 'ws://localhost:8082/api/socket';
      
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
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
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
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

  const handleDeviceFilter = (deviceId: string) => {
    setSelectedDevice(deviceId);
    if (deviceId === 'all') {
      setFilteredDevices(devices);
    } else {
      setFilteredDevices(devices.filter(device => device.id === deviceId));
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
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
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Devices</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
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
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedDevice === device.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleDeviceFilter(device.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{device.name}</h4>
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
              zoom={13}
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

export default Tracking;