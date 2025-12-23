import React from 'react';
import { Check, Clock, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MealTimeCard({ meal, time, status, name, cost, onToggle, isNext }) {
    const mealIcons = {
        breakfast: '🍳',
        lunch: '🍛',
        dinner: '🍽️'
    };

    const statusColors = {
        pending: 'bg-amber-50 border-amber-200',
        done: 'bg-emerald-50 border-emerald-200',
        skipped: 'bg-stone-100 border-stone-200'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative p-4 rounded-2xl border-2 transition-all duration-300",
                statusColors[status] || statusColors.pending,
                isNext && "ring-2 ring-emerald-400 ring-offset-2"
            )}
        >
            {isNext && (
                <div className="absolute -top-2 left-4 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                    Next
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">{mealIcons[meal]}</div>
                    <div>
                        <h3 className="font-semibold text-stone-800 capitalize">{meal}</h3>
                        <div className="flex items-center gap-2 text-sm text-stone-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{time}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onToggle}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                        status === 'done'
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                            : "bg-white border-2 border-stone-200 text-stone-400 hover:border-emerald-300"
                    )}
                >
                    <Check className="w-5 h-5" />
                </button>
            </div>

            {name && (
                <div className="mt-3 pt-3 border-t border-stone-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-stone-400" />
                            <span className="text-sm font-medium text-stone-700">{name}</span>
                        </div>
                        {cost && (
                            <span className="text-sm font-semibold text-emerald-600">
                                KES {cost}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}