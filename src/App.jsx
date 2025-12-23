import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Layout from './Layout';

// Auth Pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import Home from './pages/Home';
import Planner from './pages/Planner';
import Shopping from './pages/Shopping';
import Pantry from './pages/Pantry';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected User Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout currentPageName="Home"><Home /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <Layout currentPageName="Home"><Home /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/planner" element={
              <ProtectedRoute>
                <Layout currentPageName="Planner"><Planner /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/shopping" element={
              <ProtectedRoute>
                <Layout currentPageName="Shopping"><Shopping /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/pantry" element={
              <ProtectedRoute>
                <Layout currentPageName="Pantry"><Pantry /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout currentPageName="Analytics"><Analytics /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout currentPageName="Settings"><Settings /></Layout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            <Route path="/admin/logs" element={
              <AdminRoute>
                <AuditLogs />
              </AdminRoute>
            } />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
