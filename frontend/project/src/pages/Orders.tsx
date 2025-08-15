import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, CreditCard, CheckCircle, XCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { format } from 'date-fns';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockOrders: Order[] = [
        {
          id: 'ord_001',
          planId: 'premium',
          planName: 'Premium Plan',
          amount: 500,
          currency: 'ETB',
          status: 'completed',
          paymentMethod: 'Telebirr',
          createdAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:32:00Z'
        },
        {
          id: 'ord_002',
          planId: 'basic',
          planName: 'Basic Plan',
          amount: 200,
          currency: 'ETB',
          status: 'pending',
          paymentMethod: 'Telebirr',
          createdAt: '2024-01-20T14:15:00Z'
        },
        {
          id: 'ord_003',
          planId: 'enterprise',
          planName: 'Enterprise Plan',
          amount: 1500,
          currency: 'ETB',
          status: 'failed',
          paymentMethod: 'Telebirr',
          createdAt: '2024-01-18T09:45:00Z'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const retryPayment = async (orderId: string) => {
    try {
      // Simulate retry payment
      console.log('Retrying payment for order:', orderId);
      // Redirect to payment page
      window.location.href = `/payment?retry=${orderId}`;
    } catch (error) {
      console.error('Failed to retry payment:', error);
    }
  };

  const downloadReceipt = (order: Order) => {
    // Generate and download receipt
    const receiptContent = `
      GPS Tracking Service Receipt
      
      Order ID: ${order.id}
      Plan: ${order.planName}
      Amount: ${order.amount} ${order.currency}
      Payment Method: ${order.paymentMethod}
      Status: ${order.status}
      Date: ${format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
      ${order.completedAt ? `Completed: ${format(new Date(order.completedAt), 'MMM dd, yyyy HH:mm')}` : ''}
      
      Thank you for your business!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600">View your payment history and manage orders</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <button
            onClick={fetchOrders}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ShoppingBag className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0)} ETB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No orders found</h4>
              <p className="text-gray-600">
                {filter === 'all' ? 'You haven\'t made any orders yet' : `No ${filter} orders found`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">{order.planName}</h4>
                      <p className="text-sm text-gray-600">Order #{order.id}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {order.amount} {order.currency}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Created: {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  
                  {order.completedAt && (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Completed: {format(new Date(order.completedAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span>Payment: {order.paymentMethod}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center space-x-3">
                  {order.status === 'completed' && (
                    <button
                      onClick={() => downloadReceipt(order)}
                      className="flex items-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Receipt
                    </button>
                  )}
                  
                  {order.status === 'failed' && (
                    <button
                      onClick={() => retryPayment(order.id)}
                      className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry Payment
                    </button>
                  )}
                  
                  {order.status === 'pending' && (
                    <span className="text-sm text-yellow-600">
                      Payment processing...
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;