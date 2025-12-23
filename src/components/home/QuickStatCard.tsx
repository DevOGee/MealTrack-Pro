import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function QuickStatCard({ icon: Icon, title, value, subtitle, color = 'emerald', delay = 0 }) {
    const colorClasses = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className={cn(
                "p-4 rounded-2xl border",
                colorClasses[color]
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium opacity-70">{title}</p>
                    <p className="text-xl font-bold mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs mt-1 opacity-60">{subtitle}</p>
                    )}
                </div>
                <Icon className="w-5 h-5 opacity-60" />
            </div>
        </motion.div>
    );
}