import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Users, FileText, Settings, TrendingUp, Shield, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const { user, getUsers } = useAuth();
    const users = getUsers();
    const auditLogs = JSON.parse(localStorage.getItem('AuditLog') || '[]');

    const stats = [
        {
            label: 'Total Users',
            value: users.length,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            link: '/admin/users'
        },
        {
            label: 'Active Users',
            value: users.filter(u => u.is_active).length,
            icon: Activity,
            color: 'from-green-500 to-green-600',
            link: '/admin/users'
        },
        {
            label: 'Audit Logs',
            value: auditLogs.length,
            icon: FileText,
            color: 'from-purple-500 to-purple-600',
            link: '/admin/logs'
        },
        {
            label: 'Admin Role',
            value: users.filter(u => u.role === 'ADMIN').length,
            icon: Shield,
            color: 'from-[#037b90] to-[#04a3b8]',
            link: '/admin/users'
        },
    ];

    const quickActions = [
        { label: 'Manage Users', icon: Users, link: '/admin/users', color: 'bg-blue-50 text-blue-600' },
        { label: 'View Audit Logs', icon: FileText, link: '/admin/logs', color: 'bg-purple-50 text-purple-600' },
        { label: 'System Settings', icon: Settings, link: '/settings', color: 'bg-gray-50 text-gray-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#037b90] to-[#04a3b8] text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-white/80 mt-1">Welcome back, {user?.email}</p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link to={stat.link}>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
                >
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action) => (
                            <Link key={action.label} to={action.link}>
                                <div className={`flex items-center gap-4 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity`}>
                                    <action.icon className="w-6 h-6" />
                                    <span className="font-medium">{action.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                        <Link to="/admin/logs" className="text-sm text-[#037b90] hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {auditLogs.slice(-5).reverse().map((log, idx) => (
                            <div key={log.id || idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{log.action}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {auditLogs.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No activity yet</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
