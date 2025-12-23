import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, ThumbsUp } from 'lucide-react';

export default function InsightCard({ type, message, delay = 0 }) {
    const configs = {
        tip: {
            icon: Lightbulb,
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            iconBg: 'bg-amber-100 text-amber-600'
        },
        saving: {
            icon: TrendingDown,
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            iconBg: 'bg-emerald-100 text-emerald-600'
        },
        warning: {
            icon: AlertCircle,
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            iconBg: 'bg-rose-100 text-rose-600'
        },
        success: {
            icon: ThumbsUp,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            iconBg: 'bg-blue-100 text-blue-600'
        }
    };

    const config = configs[type] || configs.tip;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border",
                config.bg,
                config.border
            )}
        >
            <div className={cn("p-2 rounded-xl flex-shrink-0", config.iconBg)}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{message}</p>
        </motion.div>
    );
}