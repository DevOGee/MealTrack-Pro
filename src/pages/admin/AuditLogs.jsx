import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    FileText, Search, ArrowLeft, Activity, User, Shield,
    LogIn, LogOut, RefreshCw, UserPlus, Settings, Calendar,
    Download
} from 'lucide-react';

const ACTION_ICONS = {
    LOGIN_SUCCESS: LogIn,
    LOGIN_FAILED: LogIn,
    LOGIN_BLOCKED: Shield,
    LOGOUT: LogOut,
    USER_CREATED: UserPlus,
    USER_ACTIVATED: User,
    USER_DEACTIVATED: User,
    PASSWORD_RESET_REQUESTED: RefreshCw,
    PASSWORD_RESET_COMPLETED: RefreshCw,
    PASSWORD_RESET_BY_ADMIN: RefreshCw,
    SETTINGS_UPDATED: Settings,
};

const ACTION_COLORS = {
    LOGIN_SUCCESS: 'bg-green-100 text-green-600',
    LOGIN_FAILED: 'bg-red-100 text-red-600',
    LOGIN_BLOCKED: 'bg-red-100 text-red-600',
    LOGOUT: 'bg-gray-100 text-gray-600',
    USER_CREATED: 'bg-blue-100 text-blue-600',
    USER_ACTIVATED: 'bg-green-100 text-green-600',
    USER_DEACTIVATED: 'bg-orange-100 text-orange-600',
    PASSWORD_RESET_REQUESTED: 'bg-amber-100 text-amber-600',
    PASSWORD_RESET_COMPLETED: 'bg-green-100 text-green-600',
    PASSWORD_RESET_BY_ADMIN: 'bg-purple-100 text-purple-600',
    SETTINGS_UPDATED: 'bg-blue-100 text-blue-600',
};

export default function AuditLogs() {
    const [logs, setLogs] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('AuditLog') || '[]');
        } catch {
            return [];
        }
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    const uniqueActions = [...new Set(logs.map(l => l.action))];

    const filteredLogs = logs
        .filter(log => {
            const matchesSearch =
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.entity_id && log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesFilter = filterAction === 'all' || log.action === filterAction;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const exportLogs = () => {
        const csv = [
            ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User Agent'].join(','),
            ...filteredLogs.map(log => [
                log.timestamp,
                log.action,
                log.entity_type || '',
                log.entity_id || '',
                `"${log.user_agent || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
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
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Audit Logs</h1>
                                <p className="text-white/80">{logs.length} total events</p>
                            </div>
                        </div>
                        <Button
                            onClick={exportLogs}
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 rounded-xl"
                        />
                    </div>
                    <Select value={filterAction} onValueChange={setFilterAction}>
                        <SelectTrigger className="w-48 h-12 rounded-xl">
                            <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            {uniqueActions.map(action => (
                                <SelectItem key={action} value={action}>{action}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Logs List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    {filteredLogs.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredLogs.map((log, idx) => {
                                const Icon = ACTION_ICONS[log.action] || Activity;
                                const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600';

                                return (
                                    <motion.div
                                        key={log.id || idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50/50"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {log.action}
                                                </Badge>
                                                {log.entity_type && (
                                                    <span className="text-xs text-gray-400">
                                                        {log.entity_type}
                                                    </span>
                                                )}
                                            </div>
                                            {log.entity_id && (
                                                <p className="text-sm text-gray-600 truncate">
                                                    {log.entity_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No audit logs found</p>
                            <p className="text-sm text-gray-400">Activity will appear here</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
