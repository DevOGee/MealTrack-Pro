import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Wallet, Clock, Globe, Bell, Save, Check, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export default function Settings() {
    const queryClient = useQueryClient();
    const [saved, setSaved] = useState(false);

    const { data: existingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const list = await base44.entities.UserSettings.list();
            return list[0] || null;
        }
    });

    const [settings, setSettings] = useState({
        household_size: 1,
        monthly_budget: 6000,
        breakfast_time: '07:00',
        lunch_time: '13:00',
        dinner_time: '20:00',
        food_preference: 'kenyan',
        notifications_enabled: true,
        budget_allocation: {
            staples: 2800,
            proteins: 1900,
            vegetables: 500,
            fruits: 500,
            misc: 300
        }
    });

    useEffect(() => {
        if (existingSettings) {
            setSettings({
                ...settings,
                ...existingSettings,
                budget_allocation: {
                    ...settings.budget_allocation,
                    ...existingSettings.budget_allocation
                }
            });
        }
    }, [existingSettings]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (existingSettings?.id) {
                return base44.entities.UserSettings.update(existingSettings.id, data);
            } else {
                return base44.entities.UserSettings.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['settings']);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    });

    const handleSave = () => {
        saveMutation.mutate(settings);
    };

    const updateBudgetAllocation = (category, value) => {
        setSettings({
            ...settings,
            budget_allocation: {
                ...settings.budget_allocation,
                [category]: value
            }
        });
    };

    return (
        <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
                <p className="text-sm text-stone-500">Customize your meal planning</p>
            </motion.div>

            <div className="space-y-6">
                {/* Household */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800">Household Size</h3>
                            <p className="text-xs text-stone-500">Number of people eating</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[settings.household_size]}
                            onValueChange={([v]) => setSettings({ ...settings, household_size: v })}
                            min={1}
                            max={10}
                            step={1}
                            className="flex-1"
                        />
                        <span className="w-12 text-center font-bold text-stone-800 text-lg">
                            {settings.household_size}
                        </span>
                    </div>
                </motion.div>

                {/* Budget */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <Wallet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800">Monthly Budget</h3>
                            <p className="text-xs text-stone-500">Your food budget in KES</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-stone-500">KES</span>
                        <Input
                            type="number"
                            value={settings.monthly_budget}
                            onChange={(e) => setSettings({ ...settings, monthly_budget: parseInt(e.target.value) || 0 })}
                            className="text-lg font-semibold"
                        />
                    </div>

                    <div className="mt-6 space-y-3">
                        <p className="text-sm font-medium text-stone-600">Budget Allocation</p>
                        {['staples', 'proteins', 'vegetables', 'fruits', 'misc'].map(cat => (
                            <div key={cat} className="flex items-center justify-between">
                                <span className="text-sm text-stone-500 capitalize w-24">{cat}</span>
                                <Input
                                    type="number"
                                    value={settings.budget_allocation[cat]}
                                    onChange={(e) => updateBudgetAllocation(cat, parseInt(e.target.value) || 0)}
                                    className="w-28 text-right"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Meal Times */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 rounded-xl">
                            <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800">Meal Times</h3>
                            <p className="text-xs text-stone-500">When you eat each meal</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[
                            { key: 'breakfast_time', label: 'Breakfast', emoji: '🍳' },
                            { key: 'lunch_time', label: 'Lunch', emoji: '🍛' },
                            { key: 'dinner_time', label: 'Dinner', emoji: '🍽️' }
                        ].map(meal => (
                            <div key={meal.key} className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span>{meal.emoji}</span>
                                    <span className="text-sm text-stone-600">{meal.label}</span>
                                </span>
                                <Input
                                    type="time"
                                    value={settings[meal.key]}
                                    onChange={(e) => setSettings({ ...settings, [meal.key]: e.target.value })}
                                    className="w-32"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Food Preference */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-50 rounded-xl">
                            <Globe className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800">Food Preference</h3>
                            <p className="text-xs text-stone-500">Your dietary preference</p>
                        </div>
                    </div>
                    <Select
                        value={settings.food_preference}
                        onValueChange={(v) => setSettings({ ...settings, food_preference: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kenyan">🇰🇪 Kenyan Traditional</SelectItem>
                            <SelectItem value="vegetarian">🥬 Vegetarian</SelectItem>
                            <SelectItem value="mixed">🍽️ Mixed</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Dietary Goals</Label>
                        <div className="flex flex-wrap gap-2">
                            {['balanced', 'low_carb', 'high_protein', 'low_fat', 'high_fiber', 'keto'].map(goal => (
                                <button
                                    key={goal}
                                    onClick={() => {
                                        const current = settings.dietary_goals || ['balanced'];
                                        const updated = current.includes(goal)
                                            ? current.filter(g => g !== goal)
                                            : [...current, goal];
                                        setSettings({ ...settings, dietary_goals: updated.length > 0 ? updated : ['balanced'] });
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                        (settings.dietary_goals || ['balanced']).includes(goal)
                                            ? "bg-orange-500 text-white"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                    )}
                                >
                                    {goal.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 rounded-xl">
                                <Bell className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-stone-800">Notifications</h3>
                                <p className="text-xs text-stone-500">Meal reminders & alerts</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.notifications_enabled}
                            onCheckedChange={(v) => setSettings({ ...settings, notifications_enabled: v })}
                        />
                    </div>
                </motion.div>

                {/* Nutrition Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800">Daily Nutrition Goals</h3>
                            <p className="text-xs text-stone-500">Target intake per day</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500">Calories</span>
                            <Input
                                type="number"
                                value={settings.nutrition_goals?.daily_calories || 2000}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    nutrition_goals: {
                                        ...settings.nutrition_goals,
                                        daily_calories: parseInt(e.target.value) || 2000
                                    }
                                })}
                                className="w-28 text-right"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500">Protein (g)</span>
                            <Input
                                type="number"
                                value={settings.nutrition_goals?.daily_protein || 60}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    nutrition_goals: {
                                        ...settings.nutrition_goals,
                                        daily_protein: parseInt(e.target.value) || 60
                                    }
                                })}
                                className="w-28 text-right"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500">Carbs (g)</span>
                            <Input
                                type="number"
                                value={settings.nutrition_goals?.daily_carbs || 250}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    nutrition_goals: {
                                        ...settings.nutrition_goals,
                                        daily_carbs: parseInt(e.target.value) || 250
                                    }
                                })}
                                className="w-28 text-right"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500">Fats (g)</span>
                            <Input
                                type="number"
                                value={settings.nutrition_goals?.daily_fats || 70}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    nutrition_goals: {
                                        ...settings.nutrition_goals,
                                        daily_fats: parseInt(e.target.value) || 70
                                    }
                                })}
                                className="w-28 text-right"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500">Fiber (g)</span>
                            <Input
                                type="number"
                                value={settings.nutrition_goals?.daily_fiber || 25}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    nutrition_goals: {
                                        ...settings.nutrition_goals,
                                        daily_fiber: parseInt(e.target.value) || 25
                                    }
                                })}
                                className="w-28 text-right"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Alert Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl p-5 border border-stone-100"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl">
                            <Bell className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800">Alert Preferences</h3>
                            <p className="text-xs text-stone-500">Manage your notifications</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-600">Expiry Alerts</span>
                            <Switch
                                checked={settings.alert_preferences?.expiry_alerts !== false}
                                onCheckedChange={(v) => setSettings({
                                    ...settings,
                                    alert_preferences: { ...settings.alert_preferences, expiry_alerts: v }
                                })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-600">Low Stock Alerts</span>
                            <Switch
                                checked={settings.alert_preferences?.low_stock_alerts !== false}
                                onCheckedChange={(v) => setSettings({
                                    ...settings,
                                    alert_preferences: { ...settings.alert_preferences, low_stock_alerts: v }
                                })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-600">Budget Warnings</span>
                            <Switch
                                checked={settings.alert_preferences?.budget_alerts !== false}
                                onCheckedChange={(v) => setSettings({
                                    ...settings,
                                    alert_preferences: { ...settings.alert_preferences, budget_alerts: v }
                                })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-600">Meal Prep Reminders</span>
                            <Switch
                                checked={settings.alert_preferences?.meal_prep_reminders !== false}
                                onCheckedChange={(v) => setSettings({
                                    ...settings,
                                    alert_preferences: { ...settings.alert_preferences, meal_prep_reminders: v }
                                })}
                            />
                        </div>
                        <div className="pt-2 border-t">
                            <Label className="text-sm mb-2 block">Alert Before Expiry (days)</Label>
                            <Input
                                type="number"
                                min="1"
                                max="7"
                                value={settings.alert_preferences?.expiry_days_before || 3}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    alert_preferences: {
                                        ...settings.alert_preferences,
                                        expiry_days_before: parseInt(e.target.value) || 3
                                    }
                                })}
                                className="w-24"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                >
                    <Button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className={cn(
                            "w-full h-14 text-lg font-semibold rounded-2xl transition-all duration-300",
                            saved
                                ? "bg-emerald-500 hover:bg-emerald-500"
                                : "bg-stone-800 hover:bg-stone-900"
                        )}
                    >
                        {saved ? (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}