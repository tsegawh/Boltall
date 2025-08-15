export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  role: 'user' | 'admin';
  subscription?: Subscription;
}

export interface Device {
  id: string;
  name: string;
  imei: string;
  status: 'active' | 'inactive' | 'expired';
  lastUpdate: string;
  expiryDate: string;
  position?: Position;
  batteryLevel?: number;
}

export interface Position {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  altitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

export interface Subscription {
  id: string;
  planName: string;
  deviceLimit: number;
  price: number;
  currency: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

export interface Plan {
  id: string;
  name: string;
  deviceLimit: number;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
}

export interface Order {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
}

export interface Report {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'route' | 'stops' | 'summary';
  startDate: string;
  endDate: string;
  data: any;
  createdAt: string;
}

export interface WebSocketMessage {
  positions?: Position[];
  devices?: Device[];
}