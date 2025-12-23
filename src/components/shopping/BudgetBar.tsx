import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function BudgetBar({ spent, budget, category }) {
    const percentage = Math.min((spent / budget) * 100, 100);
    const remaining = budget - spent;
    const isOverBudget = spent > budget;
    const isNearLimit = percentage >= 80 && !isOverBudget;

    const getStatusColor = () => {
        if (isOverBudget) return 'bg-rose-500';
        if (isNearLimit) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getStatusIcon = () => {
        if (isOverBudget) return <AlertTriangle className="w-4 h-4 text-rose-500" />;
        if (isNearLimit) return <TrendingUp className="w-4 h-4 text-amber-500" />;
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    };

    return (
        <div className="p-4 bg-white rounded-2xl border border-stone-100">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="font-medium text-stone-700 capitalize">{category}</span>
                </div>
                <span className={cn(
                    "text-sm font-semibold",
                    isOverBudget ? "text-rose-500" : "text-stone-600"
                )}>
                    KES {spent.toLocaleString()} / {budget.toLocaleString()}
                </span>
            </div>

            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn("h-full rounded-full", getStatusColor())}
                />
            </div>

            <p className={cn(
                "text-xs mt-2",
                isOverBudget ? "text-rose-500" : "text-stone-500"
            )}>
                {isOverBudget
                    ? `Over by KES ${Math.abs(remaining).toLocaleString()}`
                    : `KES ${remaining.toLocaleString()} remaining`
                }
            </p>
        </div>
    );
}