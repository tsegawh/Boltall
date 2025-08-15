import AdminRoute from './components/AdminRoute';
@@ .. @@
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Tracking from './pages/Tracking';
import Devices from './pages/Devices';
-import Payments from './pages/Payments';
+import Reports from './pages/Reports';
+import Subscriptions from './pages/Subscriptions';
+import Orders from './pages/Orders';
 import Profile from './pages/Profile';
 import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDevices from './pages/admin/AdminDevices';
import AdminPlans from './pages/admin/AdminPlans';
import AdminOrders from './pages/admin/AdminOrders';
import AdminTracking from './pages/admin/AdminTracking';

@@ .. @@
             <Routes>
               <Route path="/" element={<Dashboard />} />
+              <Route path="/devices" element={<Devices />} />
               <Route path="/tracking" element={<Tracking />} />
-              <Route path="/devices" element={<Devices />} />
-              <Route path="/payments" element={<Payments />} />
+              <Route path="/reports" element={<Reports />} />
+              <Route path="/subscriptions" element={<Subscriptions />} />
+              <Route path="/orders" element={<Orders />} />
               <Route path="/profile" element={<Profile />} />
               <Route path="/settings" element={<Settings />} />
          
          {/* Admin Routes */}
          <AdminRoute>
            <AdminLayout>
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/devices" element={<AdminDevices />} />
                <Route path="/admin/plans" element={<AdminPlans />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/tracking" element={<AdminTracking />} />
                <Route path="/admin/notifications" element={<div>Admin Notifications</div>} />
                <Route path="/admin/reports" element={<div>Admin Reports</div>} />
                <Route path="/admin/settings" element={<div>Admin Settings</div>} />
              </Routes>
            </AdminLayout>
          </AdminRoute>
             </Routes>