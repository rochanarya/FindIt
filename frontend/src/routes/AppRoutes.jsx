import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import BrowseItemsPage from '../pages/BrowseItemsPage';
import ItemDetailsPage from '../pages/ItemDetailsPage';
import DashboardPage from '../pages/DashboardPage';
import CreateReportPage from '../pages/CreateReportPage';
import MyReportsPage from '../pages/MyReportsPage';
import MyClaimsPage from '../pages/MyClaimsPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';

// Admin components
import AdminLayout from '../admin/AdminLayout';
import AdminDashboard from '../admin/AdminDashboard';
import AdminItems from '../admin/AdminItems';
import AdminClaims from '../admin/AdminClaims';
import AdminUsers from '../admin/AdminUsers';
import AdminCategories from '../admin/AdminCategories';
import AdminAnalytics from '../admin/AdminAnalytics';
import AdminAuditLogs from '../admin/AdminAuditLogs';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Student Layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/browse" element={<BrowseItemsPage />} />
        <Route path="/items/:id" element={<ItemDetailsPage />} />

        {/* Protected Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-report"
          element={
            <ProtectedRoute>
              <CreateReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <MyReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-claims"
          element={
            <ProtectedRoute>
              <MyClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="items" element={<AdminItems />} />
        <Route path="claims" element={<AdminClaims />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

