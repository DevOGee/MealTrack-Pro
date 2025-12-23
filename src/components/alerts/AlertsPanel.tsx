import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO, differenceInDays, addDays, isPast } from 'date-fns';
import { AlertTriangle, Bell, DollarSign, Calendar, Package, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const alertTypes = {
    expiry: { icon: AlertTriangle, color: 'rose', label: 'Expiring Soon' },
    low_stock: { icon: Package, color: 'amber', label: 'Low Stock' },
    budget: { icon: DollarSign, color: 'rose', label: 'Budget Warning' },
    prep: { icon: Calendar, color: 'blue', label: 'Prep Reminder' },
    over_budget: { icon: TrendingUp, color: 'red', label: 'Over Budget' }
};

export default function AlertsPanel({ onDismiss }) {
    const currentMonth = format(new Date(), 'yyyy-MM');

    const { data: pantryItems = [] } = useQuery({
        queryKey: ['pantry'],
        queryFn: () => base44.entities.PantryItem.list()
    });

    const { data: shoppingItems = [] } = useQuery({
        queryKey: ['shoppingItems', currentMonth],
        queryFn: () => base44.entities.ShoppingItem.filter({ month: currentMonth })
    });

    const { data: meals = [] } = useQuery({
        queryKey: ['upcomingMeals'],
        queryFn: async () => {
            const allMeals = await base44.entities.Meal.list('-date', 50);
            const today = format(new Date(), 'yyyy-MM-dd');
            const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
            return allMeals.filter(m => m.date >= today && m.date <= nextWeek);
        }
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const list = await base44.entities.UserSettings.list();
            return list[0] || {
                monthly_budget: 6000,
                alert_preferences: {
                    expiry_alerts: true,
                    low_stock_alerts: true,
                    budget_alerts: true,
                    meal_prep_reminders: true,
                    expiry_days_before: 3
                }
            };
        }
    });

    const alerts = useMemo(() => {
        const alertsList = [];
        const prefs = settings?.alert_preferences || {};

        // Expiry Alerts
        if (prefs.expiry_alerts !== false) {
            pantryItems.forEach(item => {
                if (item.expiry_date) {
                    const daysUntilExpiry = differenceInDays(parseISO(item.expiry_date), new Date());
                    if (daysUntilExpiry <= (prefs.expiry_days_before || 3) && daysUntilExpiry >= 0) {
                        alertsList.push({
                            type: 'expiry',
                            message: `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
                            link: 'Pantry',
                            priority: daysUntilExpiry === 0 ? 3 : 2
                        });
                    } else if (isPast(parseISO(item.expiry_date))) {
                        alertsList.push({
                            type: 'expiry',
                            message: `${item.name} has expired`,
                            link: 'Pantry',
                            priority: 3
                        });
                    }
                }
            });
        }

        // Low Stock Alerts
        if (prefs.low_stock_alerts !== false) {
            pantryItems.forEach(item => {
                if (item.quantity && item.low_stock_threshold) {
                    if (parseFloat(item.quantity) <= parseFloat(item.low_stock_threshold)) {
                        alertsList.push({
                            type: 'low_stock',
                            message: `${item.name} is running low (${item.quantity} ${item.unit || ''} left)`,
                            link: 'Pantry',
                            priority: 1
                        });
                    }
                }
            });
        }

        // Budget Alerts
        if (prefs.budget_alerts !== false) {
            const totalSpent = shoppingItems.reduce((sum, i) => sum + (i.price || 0), 0);
            const budget = settings?.monthly_budget || 6000;
            const percentUsed = (totalSpent / budget) * 100;

            if (totalSpent > budget) {
                alertsList.push({
                    type: 'over_budget',
                    message: `You're KES ${(totalSpent - budget).toFixed(0)} over budget this month`,
                    link: 'Shopping',
                    priority: 3
                });
            } else if (percentUsed >= 90) {
                alertsList.push({
                    type: 'budget',
                    message: `You've used ${percentUsed.toFixed(0)}% of your monthly budget`,
                    link: 'Shopping',
                    priority: 2
                });
            }

            // Category budget warnings
            const allocation = settings?.budget_allocation || {};
            const categorySpending = {};
            shoppingItems.forEach(item => {
                categorySpending[item.category] = (categorySpending[item.category] || 0) + (item.price || 0);
            });

            Object.entries(categorySpending).forEach(([cat, spent]) => {
                const allocated = allocation[cat] || 0;
                if (spent > allocated * 0.9 && allocated > 0) {
                    alertsList.push({
                        type: 'budget',
                        message: `${cat} category nearing limit: KES ${spent}/${allocated}`,
                        link: 'Shopping',
                        priority: 1
                    });
                }
            });
        }

        // Meal Prep Reminders
        if (prefs.meal_prep_reminders !== false) {
            const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
            const tomorrowMeals = meals.filter(m => m.date === tomorrow && m.prep_notes);
            tomorrowMeals.forEach(meal => {
                alertsList.push({
                    type: 'prep',
                    message: `Prep for tomorrow's ${meal.type}: ${meal.prep_notes}`,
                    link: 'Planner',
                    priority: 1
                });
            });
        }

        return alertsList.sort((a, b) => b.priority - a.priority);
    }, [pantryItems, shoppingItems, meals, settings]);

    if (alerts.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-stone-600" />
                    <h3 className="font-semibold text-stone-800">Alerts ({alerts.length})</h3>
                </div>
            </div>
            <div className="space-y-2">
                <AnimatePresence>
                    {alerts.slice(0, 5).map((alert, idx) => {
                        const config = alertTypes[alert.type];
                        const Icon = config.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link to={createPageUrl(alert.link)}>
                                    <div className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-colors hover:shadow-sm",
                                        `bg-${config.color}-50 border-${config.color}-200`
                                    )}>
                                        <Icon className={cn("w-4 h-4 flex-shrink-0", `text-${config.color}-600`)} />
                                        <p className="text-sm text-stone-700 flex-1">{alert.message}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}