@@ .. @@
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
-import { LayoutDashboard, MapPin, Smartphone, CreditCard, User, Settings, LogOut } from 'lucide-react';
+import { LayoutDashboard, MapPin, Smartphone, CreditCard, User, Settings, LogOut, FileText, Crown, ShoppingBag } from 'lucide-react';
 import { useAuth } from '../contexts/AuthContext';

@@ .. @@
   const menuItems = [
     { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
+    { icon: Smartphone, label: 'Devices', path: '/devices' },
+    { icon: MapPin, label: 'Live Tracking', path: '/tracking' },
+    { icon: FileText, label: 'Reports', path: '/reports' },
+    { icon: Crown, label: 'Subscriptions', path: '/subscriptions' },
+    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
-    { icon: MapPin, label: 'Tracking', path: '/tracking' },
-    { icon: Smartphone, label: 'Devices', path: '/devices' },
-    { icon: CreditCard, label: 'Payments', path: '/payments' },
     { icon: User, label: 'Profile', path: '/profile' },
     { icon: Settings, label: 'Settings', path: '/settings' },
   ];