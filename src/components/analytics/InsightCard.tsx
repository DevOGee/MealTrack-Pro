import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, ThumbsUp } from 'lucide-react';

export default function InsightCard({ type, message, delay = 0 }) {
    const configs = {
        tip: {
            icon: Lightbulb,
            bg: 'bg-teal-600',
            border: 'border-teal-200',
            iconBg: 'bg-teal-100 text-teal-600'
        },
        saving: {
            icon: TrendingDown,
            bg: 'bg-teal-600',
            border: 'border-teal-200',
            iconBg: 'bg-teal-100 text-teal-600'
        },
        warning: {
            icon: AlertCircle,
            bg: 'bg-teal-600',
            border: 'border-teal-200',
            iconBg: 'bg-teal-100 text-teal-600'
        },
        success: {
            icon: ThumbsUp,
            bg: 'bg-teal-600',
            border: 'border-teal-200',
            iconBg: 'bg-teal-100 text-teal-600'
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
                config.border,
                "text-white font-bold"
            )}
        >
            <div className={cn("p-2 rounded-xl flex-shrink-0", config.iconBg)}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-sm leading-relaxed">{message}</p>
        </motion.div>
    );
}