import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, ShoppingCart, Bell, TrendingDown } from 'lucide-react';

export default function AlertCard({ type, message, action, onAction }) {
    const configs = {
        shopping: {
            icon: ShoppingCart,
            bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
            iconBg: 'bg-orange-100 text-orange-600',
            border: 'border-orange-200'
        },
        prep: {
            icon: Bell,
            bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
            iconBg: 'bg-blue-100 text-blue-600',
            border: 'border-blue-200'
        },
        budget: {
            icon: TrendingDown,
            bg: 'bg-gradient-to-r from-rose-50 to-pink-50',
            iconBg: 'bg-rose-100 text-rose-600',
            border: 'border-rose-200'
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
            iconBg: 'bg-amber-100 text-amber-600',
            border: 'border-amber-200'
        }
    };

    const config = configs[type] || configs.warning;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "p-4 rounded-2xl border flex items-center gap-3",
                config.bg,
                config.border
            )}
        >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.iconBg)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-stone-700">{message}</p>
            </div>
            {action && (
                <button
                    onClick={onAction}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                    {action}
                </button>
            )}
        </motion.div>
    );
}