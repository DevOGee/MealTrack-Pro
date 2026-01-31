import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, getDaysInMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import MonthCalendar from '@/components/planner/MonthCalendar';
import DayMealCard from '@/components/planner/DayMealCard';
import RecipeDialog from '@/components/planner/RecipeDialog';
import AIGenerateModal, { GenerateOptions } from '@/components/planner/AIGenerateModal';
import BudgetOverviewCard from '@/components/planner/BudgetOverviewCard';
import { Button } from '@/components/ui/button';

export default function Planner() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isGenerating, setIsGenerating] = useState(false);
    const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const queryClient = useQueryClient();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInCurrentMonth = getDaysInMonth(currentMonth);

    const { data: meals = [], isLoading } = useQuery({
        queryKey: ['meals', format(monthStart, 'yyyy-MM')],
        queryFn: async () => {
            const allMeals = await base44.entities.Meal.list('-date', 100);
            return allMeals.filter(m => {
                const mealDate = new Date(m.date);
                return mealDate >= monthStart && mealDate <= monthEnd;
            });
        }
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const list = await base44.entities.UserSettings.list();
            return list[0] || { food_preference: 'kenyan', monthly_budget: 6000 };
        }
    });

    const { data: pantryItems = [] } = useQuery({
        queryKey: ['pantry'],
        queryFn: () => base44.entities.PantryItem.list()
    });

    const mealsByDate = useMemo(() => {
        const grouped = {};
        meals.forEach(meal => {
            if (!grouped[meal.date]) grouped[meal.date] = [];
            grouped[meal.date].push(meal);
        });
        return grouped;
    }, [meals]);

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedDayMeals = mealsByDate[selectedDateStr] || [];

    const getMealByType = (type) => selectedDayMeals.find(m => m.type === type);

    const createMealMutation = useMutation({
        mutationFn: (data) => base44.entities.Meal.create(data),
        onSuccess: () => queryClient.invalidateQueries(['meals'])
    });

    const updateMealMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Meal.update(id, data),
        onSuccess: () => queryClient.invalidateQueries(['meals'])
    });

    const deleteMealMutation = useMutation({
        mutationFn: (id) => base44.entities.Meal.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['meals'])
    });

    const handleSaveMeal = (type, formData) => {
        const existingMeal = getMealByType(type);
        if (existingMeal) {
            updateMealMutation.mutate({ id: existingMeal.id, data: formData });
        } else {
            createMealMutation.mutate({
                ...formData,
                type,
                date: selectedDateStr,
                status: 'pending'
            });
        }
    };

    const handleToggleStatus = (meal) => {
        const newStatus = meal.status === 'done' ? 'pending' : 'done';
        updateMealMutation.mutate({ id: meal.id, data: { status: newStatus } });
    };

    const handleViewRecipe = (meal) => {
        setSelectedMeal(meal);
        setRecipeDialogOpen(true);
    };

    const handleUpdateMealFromRecipe = async (data) => {
        if (selectedMeal) {
            await updateMealMutation.mutate({ id: selectedMeal.id, data });
        }
    };

    const generateAIMeals = async (options: GenerateOptions) => {
        setIsGenerating(true);
        try {
            const preference = settings?.food_preference || 'kenyan';
            const budget = settings?.monthly_budget || 6000;

            // Determine number of days based on period
            let numDays = 7;
            let periodText = 'week';
            if (options.period === '14') {
                numDays = 14;
                periodText = '14 days';
            } else if (options.period === 'month') {
                numDays = daysInCurrentMonth;
                periodText = 'entire month';
            }

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate ${periodText} of meal suggestions for a ${preference} food preference. 
        Include breakfast, lunch, and dinner for ${numDays} days.
        Each meal should have: name (simple, budget-friendly), cost in KES (realistic Kenyan prices), and optional prep_notes.
        Focus on affordable, nutritious Kenyan meals like ugali, sukuma wiki, beans, chapati, rice, etc.
        Monthly budget is KES ${budget}. Average costs: Breakfast ~60 KES, Lunch ~120 KES, Dinner ~140 KES.
        ${options.avoidRepeats ? 'Avoid repeating the same meals.' : ''}
        ${options.budgetAware ? `Stay within the monthly budget of KES ${budget}.` : ''}`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        days: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    breakfast: { type: "object", properties: { name: { type: "string" }, cost: { type: "number" }, prep_notes: { type: "string" } } },
                                    lunch: { type: "object", properties: { name: { type: "string" }, cost: { type: "number" }, prep_notes: { type: "string" } } },
                                    dinner: { type: "object", properties: { name: { type: "string" }, cost: { type: "number" }, prep_notes: { type: "string" } } }
                                }
                            }
                        }
                    }
                }
            });

            // Create meals starting from selected date
            const mealsToCreate = [];
            result.days?.forEach((day, idx) => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + idx);
                const dateStr = format(date, 'yyyy-MM-dd');

                ['breakfast', 'lunch', 'dinner'].forEach(type => {
                    if (day[type]) {
                        mealsToCreate.push({
                            type,
                            date: dateStr,
                            name: day[type].name,
                            cost: day[type].cost,
                            prep_notes: day[type].prep_notes || '',
                            status: 'pending'
                        });
                    }
                });
            });

            if (mealsToCreate.length > 0) {
                await base44.entities.Meal.bulkCreate(mealsToCreate);
                queryClient.invalidateQueries(['meals']);
            }

            setGenerateModalOpen(false);
        } catch (error) {
            console.error('Failed to generate meals:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const totalDayCost = selectedDayMeals.reduce((sum, m) => sum + (m.cost || 0), 0);

    return (
        <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Meal Planner</h1>
                    <p className="text-sm text-stone-500">Plan your meals ahead</p>
                </div>
                <Button
                    onClick={() => setGenerateModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                </Button>
            </motion.div>

            {/* Budget Overview Card */}
            <BudgetOverviewCard
                meals={meals}
                monthlyBudget={settings?.monthly_budget || 6000}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
            />

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-stone-700">
                    {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar */}
            <MonthCalendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                mealsByDate={mealsByDate}
            />

            {/* Selected Day */}
            <motion.div
                key={selectedDateStr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-stone-800">
                            {format(selectedDate, 'EEEE, MMM d')}
                        </h2>
                        <p className="text-sm text-stone-500">
                            {selectedDayMeals.length} meals planned
                        </p>
                    </div>
                    {totalDayCost > 0 && (
                        <div className="text-right">
                            <p className="text-xs text-stone-500">Day total</p>
                            <p className="font-bold text-emerald-600">KES {totalDayCost}</p>
                        </div>
                    )}
                </div>

                {/* Meal Cards */}
                <div className="space-y-3">
                    {['breakfast', 'lunch', 'dinner'].map(type => (
                        <DayMealCard
                            key={type}
                            type={type}
                            meal={getMealByType(type)}
                            onSave={(data) => handleSaveMeal(type, data)}
                            onDelete={() => {
                                const meal = getMealByType(type);
                                if (meal) deleteMealMutation.mutate(meal.id);
                            }}
                            onToggleStatus={() => {
                                const meal = getMealByType(type);
                                if (meal) handleToggleStatus(meal);
                            }}
                            onViewRecipe={() => {
                                const meal = getMealByType(type);
                                if (meal) handleViewRecipe(meal);
                            }}
                            showSwapSuggestion={true}
                            pantryItems={pantryItems}
                            settings={settings}
                        />
                    ))}
                </div>
            </motion.div>

            {/* AI Generate Modal */}
            <AIGenerateModal
                open={generateModalOpen}
                onClose={() => setGenerateModalOpen(false)}
                onGenerate={generateAIMeals}
                isGenerating={isGenerating}
                monthlyBudget={settings?.monthly_budget || 6000}
                daysInMonth={daysInCurrentMonth}
            />

            {/* Recipe Dialog */}
            {selectedMeal && (
                <RecipeDialog
                    meal={selectedMeal}
                    open={recipeDialogOpen}
                    onClose={() => {
                        setRecipeDialogOpen(false);
                        setSelectedMeal(null);
                    }}
                    onUpdateMeal={handleUpdateMealFromRecipe}
                />
            )}
        </div>
    );
}