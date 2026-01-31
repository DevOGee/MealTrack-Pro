import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, ChevronDown, ChevronUp, Coffee, Utensils, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Meal {
    id: string;
    date: string;
    type: 'breakfast' | 'lunch' | 'dinner';
    cost?: number;
}

interface BudgetOverviewCardProps {
    meals: Meal[];
    monthlyBudget: number;
    currentMonth: Date;
    selectedDate: Date;
}

type ViewFilter = 'day' | 'week' | 'month';

export default function BudgetOverviewCard({
    meals,
    monthlyBudget,
    currentMonth,
    selectedDate
}: BudgetOverviewCardProps) {
    const [viewFilter, setViewFilter] = useState<ViewFilter>('month');
    const [isExpanded, setIsExpanded] = useState(true);

    const calculations = useMemo(() => {
        const now = selectedDate;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const selectedDateStr = now.toISOString().slice(0, 10);
        const monthStr = currentMonth.toISOString().slice(0, 7);

        let filteredMeals: Meal[] = [];
        let label = '';
        let budget = monthlyBudget;

        switch (viewFilter) {
            case 'day':
                filteredMeals = meals.filter(m => m.date === selectedDateStr);
                label = 'Today';
                budget = monthlyBudget / 30; // Daily budget
                break;
            case 'week':
                filteredMeals = meals.filter(m => {
                    const mealDate = new Date(m.date);
                    return mealDate >= startOfWeek && mealDate <= endOfWeek;
                });
                label = 'This Week';
                budget = (monthlyBudget / 30) * 7; // Weekly budget
                break;
            case 'month':
            default:
                filteredMeals = meals.filter(m => m.date.startsWith(monthStr));
                label = 'This Month';
                budget = monthlyBudget;
                break;
        }

        const totalSpent = filteredMeals.reduce((sum, m) => sum + (m.cost || 0), 0);
        const remaining = budget - totalSpent;
        const percentUsed = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

        // Breakdown by meal type
        const breakfastCost = filteredMeals.filter(m => m.type === 'breakfast').reduce((sum, m) => sum + (m.cost || 0), 0);
        const lunchCost = filteredMeals.filter(m => m.type === 'lunch').reduce((sum, m) => sum + (m.cost || 0), 0);
        const dinnerCost = filteredMeals.filter(m => m.type === 'dinner').reduce((sum, m) => sum + (m.cost || 0), 0);

        const mealsPlanned = filteredMeals.length;
        const avgPerMeal = mealsPlanned > 0 ? Math.round(totalSpent / mealsPlanned) : 0;

        return {
            totalSpent,
            remaining,
            percentUsed,
            budget,
            label,
            breakfastCost,
            lunchCost,
            dinnerCost,
            mealsPlanned,
            avgPerMeal
        };
    }, [meals, viewFilter, selectedDate, currentMonth, monthlyBudget]);

    const isOverBudget = calculations.remaining < 0;
    const isNearBudget = calculations.percentUsed >= 80 && !isOverBudget;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-stone-100 overflow-hidden mb-4"
        >
            {/* Header with toggle */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2.5 rounded-xl",
                        isOverBudget ? "bg-red-100" : isNearBudget ? "bg-amber-100" : "bg-emerald-100"
                    )}>
                        <Wallet className={cn(
                            "w-5 h-5",
                            isOverBudget ? "text-red-600" : isNearBudget ? "text-amber-600" : "text-emerald-600"
                        )} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-stone-800">Budget Overview</h3>
                        <p className="text-xs text-stone-500">{calculations.label}: {calculations.mealsPlanned} meals planned</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className={cn(
                            "font-bold text-lg",
                            isOverBudget ? "text-red-600" : "text-emerald-600"
                        )}>
                            KES {calculations.remaining.toLocaleString()}
                        </p>
                        <p className="text-xs text-stone-500">remaining</p>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {/* Filter Tabs */}
                            <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
                                {(['day', 'week', 'month'] as ViewFilter[]).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewFilter(filter);
                                        }}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                                            viewFilter === filter
                                                ? "bg-white text-stone-800 shadow-sm"
                                                : "text-stone-500 hover:text-stone-700"
                                        )}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-stone-600">
                                        Spent: <span className="font-semibold">KES {calculations.totalSpent.toLocaleString()}</span>
                                    </span>
                                    <span className="text-stone-500">
                                        Budget: KES {Math.round(calculations.budget).toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(calculations.percentUsed, 100)}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full",
                                            isOverBudget
                                                ? "bg-gradient-to-r from-red-400 to-red-500"
                                                : isNearBudget
                                                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                                    : "bg-gradient-to-r from-emerald-400 to-teal-500"
                                        )}
                                    />
                                </div>
                                <p className="text-xs text-stone-500 mt-1 text-right">
                                    {Math.round(calculations.percentUsed)}% used
                                </p>
                            </div>

                            {/* Breakdown by Meal Type */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-amber-50 rounded-2xl p-3 text-center">
                                    <Coffee className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                                    <p className="text-xs text-stone-500">Breakfast</p>
                                    <p className="font-bold text-amber-700">KES {calculations.breakfastCost}</p>
                                </div>
                                <div className="bg-orange-50 rounded-2xl p-3 text-center">
                                    <Utensils className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                                    <p className="text-xs text-stone-500">Lunch</p>
                                    <p className="font-bold text-orange-700">KES {calculations.lunchCost}</p>
                                </div>
                                <div className="bg-indigo-50 rounded-2xl p-3 text-center">
                                    <Moon className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                                    <p className="text-xs text-stone-500">Dinner</p>
                                    <p className="font-bold text-indigo-700">KES {calculations.dinnerCost}</p>
                                </div>
                            </div>

                            {/* Average */}
                            {calculations.avgPerMeal > 0 && (
                                <div className="flex items-center justify-between bg-stone-50 rounded-xl p-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-stone-500" />
                                        <span className="text-sm text-stone-600">Avg per meal</span>
                                    </div>
                                    <span className="font-semibold text-stone-800">KES {calculations.avgPerMeal}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
