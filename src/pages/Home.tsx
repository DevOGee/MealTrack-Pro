import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Wallet, Utensils, TrendingUp, Sparkles } from 'lucide-react';
import MealTimeCard from '@/components/home/MealTimeCard';
import QuickStatCard from '@/components/home/QuickStatCard';
import AlertCard from '@/components/home/AlertCard';
import AlertsPanel from '@/components/alerts/AlertsPanel';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentHour = new Date().getHours();
    const queryClient = useQueryClient();

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const list = await base44.entities.UserSettings.list();
            return list[0] || {
                breakfast_time: '07:00',
                lunch_time: '13:00',
                dinner_time: '20:00',
                monthly_budget: 6000
            };
        }
    });

    const { data: todayMeals = [], isLoading } = useQuery({
        queryKey: ['meals', today],
        queryFn: () => base44.entities.Meal.filter({ date: today })
    });

    const { data: lowStockItems = [] } = useQuery({
        queryKey: ['lowStock'],
        queryFn: () => base44.entities.ShoppingItem.filter({ low_stock: true })
    });

    const { data: monthSpending = [] } = useQuery({
        queryKey: ['monthSpending'],
        queryFn: () => base44.entities.SpendingRecord.filter({
            month: format(new Date(), 'yyyy-MM')
        })
    });

    const updateMealMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.Meal.update(id, { status }),
        onSuccess: () => queryClient.invalidateQueries(['meals'])
    });

    const getMealByType = (type) => {
        return todayMeals.find(m => m.type === type) || { type, status: 'pending' };
    };

    const getNextMeal = () => {
        if (currentHour < 10) return 'breakfast';
        if (currentHour < 15) return 'lunch';
        return 'dinner';
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    const totalSpent = monthSpending.reduce((sum, r) => sum + (r.amount || 0), 0);
    const budgetRemaining = (settings?.monthly_budget || 6000) - totalSpent;
    const mealsCompleted = todayMeals.filter(m => m.status === 'done').length;
    const todayCost = todayMeals.reduce((sum, m) => sum + (m.cost || 0), 0);

    const toggleMealStatus = (meal) => {
        if (!meal.id) return;
        const newStatus = meal.status === 'done' ? 'pending' : 'done';
        updateMealMutation.mutate({ id: meal.id, status: newStatus });
    };

    const nextMeal = getNextMeal();
    const nextMealData = getMealByType(nextMeal);

    return (
        <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <p className="text-sm text-stone-500 font-medium">
                    {format(new Date(), 'EEEE, MMMM d')}
                </p>
                <h1 className="text-2xl font-bold text-stone-800 mt-1">
                    Today's Meals
                </h1>
            </motion.div>

            {/* Next Meal Highlight */}
            {nextMealData.name && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white shadow-xl shadow-emerald-200"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                            Up Next
                        </span>
                    </div>
                    <h2 className="text-xl font-bold">{nextMealData.name}</h2>
                    <p className="text-sm opacity-80 mt-1 capitalize">{nextMeal} • {formatTime(settings?.[`${nextMeal}_time`])}</p>
                    {nextMealData.prep_notes && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <p className="text-xs opacity-80">💡 {nextMealData.prep_notes}</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Alerts Panel */}
            <AlertsPanel />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <QuickStatCard
                    icon={Wallet}
                    title="Budget Left"
                    value={`KES ${budgetRemaining.toLocaleString()}`}
                    subtitle="this month"
                    color="emerald"
                    delay={0.1}
                />
                <QuickStatCard
                    icon={Utensils}
                    title="Today's Cost"
                    value={`KES ${todayCost}`}
                    subtitle={`${mealsCompleted}/3 meals done`}
                    color="orange"
                    delay={0.2}
                />
            </div>

            {/* Alerts */}
            <div className="space-y-3 mb-6">
                {lowStockItems.length > 0 && (
                    <AlertCard
                        type="shopping"
                        message={`${lowStockItems.length} items running low`}
                        action="View"
                        onAction={() => { }}
                    />
                )}
                {nextMealData.prep_notes && (
                    <AlertCard
                        type="prep"
                        message={nextMealData.prep_notes}
                    />
                )}
                {budgetRemaining < 1000 && budgetRemaining > 0 && (
                    <AlertCard
                        type="budget"
                        message={`Only KES ${budgetRemaining.toLocaleString()} left this month`}
                    />
                )}
            </div>

            {/* Meal Schedule */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Today's Schedule</h2>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    ['breakfast', 'lunch', 'dinner'].map((mealType, idx) => {
                        const meal = getMealByType(mealType);
                        return (
                            <MealTimeCard
                                key={mealType}
                                meal={mealType}
                                time={formatTime(settings?.[`${mealType}_time`])}
                                status={meal.status}
                                name={meal.name}
                                cost={meal.cost}
                                isNext={nextMeal === mealType && meal.status !== 'done'}
                                onToggle={() => toggleMealStatus(meal)}
                            />
                        );
                    })
                )}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex gap-3"
            >
                <Link
                    to={createPageUrl('Planner')}
                    className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-xl text-center text-sm font-medium text-stone-700 transition-colors"
                >
                    View Full Plan
                </Link>
                <Link
                    to={createPageUrl('Shopping')}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-center text-sm font-medium text-white transition-colors"
                >
                    Shopping List
                </Link>
            </motion.div>
        </div>
    );
}