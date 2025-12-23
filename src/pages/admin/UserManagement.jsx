import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Users, Search, MoreVertical, Check, X, Shield, User,
    ArrowLeft, RefreshCw, Mail, Calendar, Activity
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserManagement() {
    const { getUsers, saveUsers, addAuditLog, user: currentUser } = useAuth();
    const [users, setUsers] = useState(getUsers());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleUserStatus = (userId) => {
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                const newStatus = !u.is_active;
                addAuditLog(newStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 'User', userId);
                return { ...u, is_active: newStatus };
            }
            return u;
        });
        saveUsers(updatedUsers);
        setUsers(updatedUsers);
    };

    const resetUserPassword = (userId) => {
        const newPassword = 'reset123!';
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                return { ...u, password_hash: simpleHash(newPassword) };
            }
            return u;
        });
        saveUsers(updatedUsers);
        setUsers(updatedUsers);
        addAuditLog('PASSWORD_RESET_BY_ADMIN', 'User', userId);
        alert(`Password reset to: ${newPassword}`);
    };

    // Simple hash function (same as in AuthContext)
    const simpleHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#037b90] to-[#04a3b8] text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <Link to="/admin" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <Users className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-white/80">{users.length} total users</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search users by email or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 rounded-xl"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Last Login</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'ADMIN' ? 'bg-[#037b90]/10' : 'bg-gray-100'}`}>
                                                    {u.role === 'ADMIN' ? (
                                                        <Shield className="w-5 h-5 text-[#037b90]" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{u.name || u.email.split('@')[0]}</p>
                                                    <p className="text-sm text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'} className={u.role === 'ADMIN' ? 'bg-[#037b90]' : ''}>
                                                {u.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className={`text-sm ${u.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                                    {u.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.id !== currentUser?.id && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => toggleUserStatus(u.id)}>
                                                            {u.is_active ? (
                                                                <>
                                                                    <X className="w-4 h-4 mr-2" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Check className="w-4 h-4 mr-2" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => resetUserPassword(u.id)}>
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No users found</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
