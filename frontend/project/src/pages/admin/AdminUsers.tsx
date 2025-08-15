import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Eye, Plus, Crown, Calendar } from 'lucide-react';
import { User } from '../../types';
import { format } from 'date-fns';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, subscriptionFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          name: 'John Doe',
          phone: '+251911234567',
          role: 'user',
          createdAt: '2024-01-15T10:30:00Z',
          subscription: {
            id: 'sub_1',
            planName: 'Premium',
            deviceLimit: 10,
            price: 500,
            currency: 'ETB',
            startDate: '2024-01-15T00:00:00Z',
            expiryDate: '2024-02-15T00:00:00Z',
            status: 'active',
            autoRenew: true
          }
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          phone: '+251922345678',
          role: 'user',
          createdAt: '2024-01-10T14:20:00Z',
          subscription: {
            id: 'sub_2',
            planName: 'Basic',
            deviceLimit: 3,
            price: 200,
            currency: 'ETB',
            startDate: '2024-01-10T00:00:00Z',
            expiryDate: '2024-01-05T00:00:00Z',
            status: 'expired',
            autoRenew: false
          }
        },
        {
          id: '3',
          email: 'admin@example.com',
          name: 'System Admin',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Subscription filter
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (!user.subscription) return subscriptionFilter === 'expired';
        return user.subscription.status === subscriptionFilter;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Simulate API call
        console.log('Deleting user:', userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getSubscriptionStatus = (user: User) => {
    if (!user.subscription) return { status: 'No subscription', color: 'text-gray-500' };
    
    switch (user.subscription.status) {
      case 'active':
        return { status: 'Active', color: 'text-green-600' };
      case 'expired':
        return { status: 'Expired', color: 'text-red-600' };
      default:
        return { status: 'Unknown', color: 'text-gray-500' };
    }
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all system users and their subscriptions</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Subscriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="w-4 h-4 mr-1" />
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const subscriptionStatus = getSubscriptionStatus(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.subscription ? (
                          <>
                            <div className="flex items-center">
                              <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                              {user.subscription.planName}
                            </div>
                            <div className={`text-xs ${subscriptionStatus.color}`}>
                              {subscriptionStatus.status}
                            </div>
                            <div className="text-xs text-gray-500">
                              Expires: {format(new Date(user.subscription.expiryDate), 'MMM dd, yyyy')}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">No subscription</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;