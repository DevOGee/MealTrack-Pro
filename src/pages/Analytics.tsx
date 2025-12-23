import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, getDay } from 'date-fns';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Wallet, Utensils, Target, Trash2, ChevronLeft, ChevronRight, Sparkles, Loader2, Activity, Flame, Beef } from 'lucide-react';
import StatCard from '@/components/analytics/StatCard';
import InsightCard from '@/components/analytics/InsightCard';
import ExportDialog from '@/components/analytics/ExportDialog';
import { Button } from '@/components/ui/button';

const COLORS = ['#10b981', '#f97316', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [insights, setInsights] = useState([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const monthStr = format(selectedMonth, 'yyyy-MM');

    const { data: pantryItems = [] } = useQuery({
        queryKey: ['pantry'],
        queryFn: () => base44.entities.PantryItem.list()
    });

    const { data: meals = [] } = useQuery({
        queryKey: ['analyticssMeals', monthStr],
        queryFn: async () => {
            const allMeals = await base44.entities.Meal.list('-date', 200);
            return allMeals.filter(m => m.date?.startsWith(monthStr));
        }
    });

    const { data: spending = [] } = useQuery({
        queryKey: ['analyticsSpending', monthStr],
        queryFn: () => base44.entities.SpendingRecord.filter({ month: monthStr })
    });

    const { data: shoppingItems = [] } = useQuery({
        queryKey: ['analyticsItems', monthStr],
        queryFn: () => base44.entities.ShoppingItem.filter({ month: monthStr })
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const list = await base44.entities.UserSettings.list();
            return list[0] || { monthly_budget: 6000 };
        }
    });

    // Calculate stats
    const totalSpent = shoppingItems.reduce((sum, i) => sum + (i.price || 0), 0);
    const totalMealCost = meals.reduce((sum, m) => sum + (m.cost || 0), 0);
    const mealsCompleted = meals.filter(m => m.status === 'done').length;
    const totalMeals = meals.length;
    const budget = settings?.monthly_budget || 6000;
    const budgetSaved = budget - totalSpent;

    // Waste Score Calculation
    const wasteScore = useMemo(() => {
        const skippedMeals = meals.filter(m => m.status === 'skipped').length;
        const expiredItems = pantryItems.filter(p =>
            p.expiry_date && new Date(p.expiry_date) < new Date()
        ).length;

        const totalMealOpportunities = meals.length || 1;
        const mealWaste = (skippedMeals / totalMealOpportunities) * 50;
        const pantryWaste = Math.min(expiredItems * 5, 50);

        const score = 100 - (mealWaste + pantryWaste);
        return Math.max(0, Math.min(100, score));
    }, [meals, pantryItems]);

    // Cost Trend (last 6 months)
    const costTrend = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(selectedMonth, i);
            months.push({
                month: format(date, 'MMM'),
                amount: 0
            });
        }

        // This is simplified - in real app would query historical data
        const currentIdx = months.length - 1;
        months[currentIdx].amount = totalSpent;

        // Simulate some trend data
        for (let i = currentIdx - 1; i >= 0; i--) {
            months[i].amount = Math.round(totalSpent * (0.85 + Math.random() * 0.3));
        }

        return months;
    }, [totalSpent, selectedMonth]);

    // Nutrition stats
    const nutritionTotals = useMemo(() => {
        const totals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, count: 0 };
        meals.forEach(meal => {
            if (meal.nutrition) {
                totals.calories += meal.nutrition.calories || 0;
                totals.protein += meal.nutrition.protein || 0;
                totals.carbs += meal.nutrition.carbs || 0;
                totals.fats += meal.nutrition.fats || 0;
                totals.fiber += meal.nutrition.fiber || 0;
                totals.count++;
            }
        });
        return totals;
    }, [meals]);

    const dailyNutrition = useMemo(() => {
        const daysInMonth = meals.length > 0 ? Math.max(1, new Date(monthStr + '-01').getDate()) : 1;
        const daysWithData = nutritionTotals.count > 0 ? Math.ceil(nutritionTotals.count / 3) : 1;
        return {
            calories: Math.round(nutritionTotals.calories / Math.max(1, daysWithData)),
            protein: Math.round(nutritionTotals.protein / Math.max(1, daysWithData)),
            carbs: Math.round(nutritionTotals.carbs / Math.max(1, daysWithData)),
            fats: Math.round(nutritionTotals.fats / Math.max(1, daysWithData)),
            fiber: Math.round(nutritionTotals.fiber / Math.max(1, daysWithData))
        };
    }, [nutritionTotals, meals, monthStr]);

    const nutritionGoals = settings?.nutrition_goals || {
        daily_calories: 2000,
        daily_protein: 60,
        daily_carbs: 250,
        daily_fats: 70,
        daily_fiber: 25
    };

    const nutritionProgress = useMemo(() => {
        return [
            {
                subject: 'Calories',
                current: Math.min(100, (dailyNutrition.calories / nutritionGoals.daily_calories) * 100),
                fullMark: 100
            },
            {
                subject: 'Protein',
                current: Math.min(100, (dailyNutrition.protein / nutritionGoals.daily_protein) * 100),
                fullMark: 100
            },
            {
                subject: 'Carbs',
                current: Math.min(100, (dailyNutrition.carbs / nutritionGoals.daily_carbs) * 100),
                fullMark: 100
            },
            {
                subject: 'Fats',
                current: Math.min(100, (dailyNutrition.fats / nutritionGoals.daily_fats) * 100),
                fullMark: 100
            },
            {
                subject: 'Fiber',
                current: Math.min(100, (dailyNutrition.fiber / nutritionGoals.daily_fiber) * 100),
                fullMark: 100
            }
        ];
    }, [dailyNutrition, nutritionGoals]);

    // Category spending for pie chart
    const categorySpending = useMemo(() => {
        const spending = {};
        shoppingItems.forEach(item => {
            spending[item.category] = (spending[item.category] || 0) + (item.price || 0);
        });
        return Object.entries(spending).map(([name, value]) => ({ name, value }));
    }, [shoppingItems]);

    // Weekly spending for bar chart
    const weeklySpending = useMemo(() => {
        const weeks = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
        meals.forEach(meal => {
            const day = parseISO(meal.date).getDate();
            const week = Math.ceil(day / 7);
            weeks[`Week ${Math.min(week, 4)}`] += meal.cost || 0;
        });
        return Object.entries(weeks).map(([name, amount]) => ({ name, amount }));
    }, [meals]);

    // Cost per meal type
    const costByMealType = useMemo(() => {
        const costs = { breakfast: [], lunch: [], dinner: [] };
        meals.forEach(meal => {
            if (meal.cost && costs[meal.type]) {
                costs[meal.type].push(meal.cost);
            }
        });
        return Object.entries(costs).map(([type, values]) => ({
            type,
            avg: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
        }));
    }, [meals]);

    // Day of week spending
    const dayOfWeekSpending = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const spending = days.map(d => ({ day: d, amount: 0 }));
        meals.forEach(meal => {
            const dayIdx = getDay(parseISO(meal.date));
            spending[dayIdx].amount += meal.cost || 0;
        });
        return spending;
    }, [meals]);

    const generateInsights = async () => {
        setIsLoadingInsights(true);
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze this meal planning data and provide 3-4 helpful insights:
        - Total spent: KES ${totalSpent}
        - Budget: KES ${budget}
        - Meals completed: ${mealsCompleted}/${totalMeals}
        - Category spending: ${JSON.stringify(categorySpending)}
        - Day of week spending: ${JSON.stringify(dayOfWeekSpending)}
        - Cost per meal type: ${JSON.stringify(costByMealType)}
        
        Provide actionable, specific insights about spending patterns, savings opportunities, or meal consistency.
        Keep each insight under 20 words. Be specific with numbers.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        insights: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string", enum: ["tip", "saving", "warning", "success"] },
                                    message: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setInsights(result.insights || []);
        } catch (error) {
            console.error('Failed to generate insights:', error);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    return (
        <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Analytics</h1>
                    <p className="text-sm text-stone-500">Your spending insights</p>
                </div>
                <ExportDialog monthStr={monthStr} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mb-6"
            >
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                        className="p-2 rounded-xl hover:bg-stone-100"
                    >
                        <ChevronLeft className="w-5 h-5 text-stone-600" />
                    </button>
                    <span className="text-sm font-medium text-stone-700 w-24 text-center">
                        {format(selectedMonth, 'MMM yyyy')}
                    </span>
                    <button
                        onClick={() => setSelectedMonth(new Date())}
                        className="p-2 rounded-xl hover:bg-stone-100"
                    >
                        <ChevronRight className="w-5 h-5 text-stone-600" />
                    </button>
                </div>
            </motion.div>

            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatCard
                    icon={Wallet}
                    title="Total Spent"
                    value={`KES ${totalSpent.toLocaleString()}`}
                    subtitle={`of ${budget.toLocaleString()} budget`}
                    color="emerald"
                    delay={0.1}
                />
                <StatCard
                    icon={Target}
                    title="Budget Saved"
                    value={`KES ${Math.max(0, budgetSaved).toLocaleString()}`}
                    subtitle={budgetSaved > 0 ? "Under budget" : "Over budget"}
                    color={budgetSaved > 0 ? "blue" : "rose"}
                    delay={0.15}
                />
                <StatCard
                    icon={Utensils}
                    title="Meals Cooked"
                    value={`${mealsCompleted}/${totalMeals}`}
                    subtitle={`${totalMeals > 0 ? Math.round((mealsCompleted / totalMeals) * 100) : 0}% completion`}
                    color="orange"
                    delay={0.2}
                />
                <StatCard
                    icon={Trash2}
                    title="Waste Score"
                    value={`${Math.round(wasteScore)}%`}
                    subtitle={wasteScore >= 80 ? "Excellent!" : wasteScore >= 60 ? "Good" : "Needs work"}
                    color={wasteScore >= 80 ? "emerald" : wasteScore >= 60 ? "orange" : "rose"}
                    delay={0.25}
                />
            </div>

            {/* Nutrition Overview */}
            {nutritionTotals.count > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100 mb-6"
                >
                    <h3 className="font-semibold text-stone-800 mb-4">Daily Nutrition Goals</h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-stone-500">Protein</span>
                            </div>
                            <p className="text-xl font-bold text-blue-700">{dailyNutrition.protein}g</p>
                            <p className="text-xs text-stone-400">Goal: {nutritionGoals.daily_protein}g</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Beef className="w-4 h-4 text-amber-600" />
                                <span className="text-xs text-stone-500">Carbs</span>
                            </div>
                            <p className="text-xl font-bold text-amber-700">{dailyNutrition.carbs}g</p>
                            <p className="text-xs text-stone-400">Goal: {nutritionGoals.daily_carbs}g</p>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-rose-600" />
                                <span className="text-xs text-stone-500">Fats</span>
                            </div>
                            <p className="text-xl font-bold text-rose-700">{dailyNutrition.fats}g</p>
                            <p className="text-xs text-stone-400">Goal: {nutritionGoals.daily_fats}g</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs text-stone-500">Fiber</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-700">{dailyNutrition.fiber}g</p>
                            <p className="text-xs text-stone-400">Goal: {nutritionGoals.daily_fiber}g</p>
                        </div>
                    </div>

                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={nutritionProgress}>
                                <PolarGrid stroke="#e7e5e4" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#78716c' }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                                <Radar
                                    name="Progress"
                                    dataKey="current"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-stone-400 mt-2">
                        Showing % of daily goals achieved
                    </p>
                </motion.div>
            )}

            {/* Spending by Category Pie */}
            {categorySpending.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100 mb-6"
                >
                    <h3 className="font-semibold text-stone-800 mb-4">Spending by Category</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categorySpending}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {categorySpending.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `KES ${value}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                        {categorySpending.map((entry, idx) => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="text-xs text-stone-600 capitalize">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Cost Trend - 6 Months */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-3xl p-5 border border-stone-100 mb-6"
            >
                <h3 className="font-semibold text-stone-800 mb-4">6-Month Cost Trend</h3>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={costTrend}>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis hide />
                            <Tooltip formatter={(value) => `KES ${value}`} />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Weekly Spending */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl p-5 border border-stone-100 mb-6"
            >
                <h3 className="font-semibold text-stone-800 mb-4">Weekly Spending</h3>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklySpending}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis hide />
                            <Tooltip formatter={(value) => `KES ${value}`} />
                            <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Cost per Meal Type */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="bg-white rounded-3xl p-5 border border-stone-100 mb-6"
            >
                <h3 className="font-semibold text-stone-800 mb-4">Average Cost per Meal</h3>
                <div className="space-y-3">
                    {costByMealType.map(item => (
                        <div key={item.type} className="flex items-center justify-between">
                            <span className="capitalize text-stone-600">{item.type}</span>
                            <span className="font-semibold text-stone-800">KES {item.avg}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-stone-800">Smart Insights</h3>
                    <Button
                        onClick={generateInsights}
                        disabled={isLoadingInsights}
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                        {isLoadingInsights ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Generate
                    </Button>
                </div>
                <div className="space-y-3">
                    {insights.length > 0 ? (
                        insights.map((insight, idx) => (
                            <InsightCard
                                key={idx}
                                type={insight.type}
                                message={insight.message}
                                delay={0.1 * idx}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-stone-400">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Click generate for AI insights</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}