// src/routes/AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import LoginPage from '@/pages/LoginPage';
import POSPage from '@/modules/pos/pages/POSPage';
import DashboardPage from '@/modules/admin/pages/DashboardPage';
import OrdersPage from '@/modules/admin/pages/OrdersPage';
import ProductsPage from '@/modules/admin/pages/ProductsPage';
import CategoriesPage from '@/modules/admin/pages/CategoriesPage';
import UsersPage from '@/modules/admin/pages/UsersPage';
import TransactionsPage from '@/modules/admin/pages/TransactionsPage';
import DaySummaryPage from '@/modules/admin/pages/DaySummaryPage';
import WithdrawPage from '@/modules/admin/pages/WithdrawPage';
import ProtectedRoute from './ProtectedRoute';
import Layout from '@/components/layout/Layout';

// Unauthorized page component
function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute requiredRole="Admin">
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route path="" element={<Navigate to="/dashboard" replace />} />
            
            {/* Admin routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredPermissions={['analytics:read']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute requiredPermissions={['order:read']}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="products"
              element={
                <ProtectedRoute requiredPermissions={['product:read']}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="categories"
              element={
                <ProtectedRoute requiredPermissions={['category:read']}>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredPermissions={['user:read']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            
            {/* Accounts routes */}
            <Route
              path="accounts/transactions"
              element={
                <ProtectedRoute requiredPermissions={['analytics:read']}>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="accounts/summary"
              element={
                <ProtectedRoute requiredPermissions={['analytics:read']}>
                  <DaySummaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="accounts/withdraw"
              element={
                <ProtectedRoute requiredPermissions={['analytics:read']}>
                  <WithdrawPage />
                </ProtectedRoute>
              }
            />
            
            {/* POS route */}
            <Route
              path="pos"
              element={
                <ProtectedRoute requiredPermissions={['sales:create']}>
                  <POSPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}