import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Smartphone, 
  Crown, 
  ShoppingBag, 
  MapPin, 
  Bell, 
  FileText, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Smartphone, label: 'Devices', path: '/admin/devices' },
    { icon: Crown, label: 'Plans', path: '/admin/plans' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: MapPin, label: 'Live Map', path: '/admin/tracking' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-gray-400 text-sm">GPS Tracking System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;