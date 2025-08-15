import React, { useState, useEffect } from 'react';
import { Users, Smartphone, Crown, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    activeSubscriptions: 0,
    totalOrders: 0,
    revenue: 0,
    expiringSubscriptions: 0
  });

  const [chartData, setChartData] = useState({
    userGrowth: [],
    deviceUsage: [],
    revenueData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls
      setStats({
        totalUsers: 1247,
        totalDevices: 3891,
        activeSubscriptions: 892,
        totalOrders: 2156,
        revenue: 125000,
        expiringSubscriptions: 23
      });

      setChartData({
        userGrowth: [
          { month: 'Jan', users: 100 },
          { month: 'Feb', users: 180 },
          { month: 'Mar', users: 250 },
          { month: 'Apr', users: 320 },
          { month: 'May', users: 450 },
          { month: 'Jun', users: 580 }
        ],
        deviceUsage: [
          { name: 'Active', value: 2890, color: '#10B981' },
          { name: 'Inactive', value: 701, color: '#F59E0B' },
          { name: 'Expired', value: 300, color: '#EF4444' }
        ],
        revenueData: [
          { month: 'Jan', revenue: 15000 },
          { month: 'Feb', revenue: 18000 },
          { month: 'Mar', revenue: 22000 },
          { month: 'Apr', revenue: 25000 },
          { month: 'May', revenue: 28000 },
          { month: 'Jun', revenue: 32000 }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Devices',
      value: stats.totalDevices.toLocaleString(),
      icon: Smartphone,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      icon: Crown,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: 'bg-orange-500',
      change: '+22%'
    },
    {
      title: 'Monthly Revenue',
      value: `${stats.revenue.toLocaleString()} ETB`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      change: '+18%'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSubscriptions.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-5%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your GPS tracking system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.deviceUsage}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.deviceUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} ETB`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">New user registered</p>
              <p className="text-sm text-gray-600">john.doe@example.com - 2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Order completed</p>
              <p className="text-sm text-gray-600">Premium plan purchase - 5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Subscription expiring</p>
              <p className="text-sm text-gray-600">User subscription expires in 3 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;