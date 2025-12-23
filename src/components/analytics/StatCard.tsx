import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({ icon: Icon, title, value, subtitle, trend, color = 'emerald', delay = 0 }) {
    const colorClasses = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' }
    };

    const colors = colorClasses[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={cn(
                "p-5 rounded-3xl border",
                colors.bg,
                colors.border
            )}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-xl", colors.bg)}>
                    <Icon className={cn("w-5 h-5", colors.text)} />
                </div>
                {trend && (
                    <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        trend > 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    )}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-sm text-stone-500 mb-1">{title}</p>
            <p className={cn("text-2xl font-bold", colors.text)}>{value}</p>
            {subtitle && (
                <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
            )}
        </motion.div>
    );
}