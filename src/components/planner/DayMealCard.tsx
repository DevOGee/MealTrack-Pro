import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Edit3, Trash2, Plus, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MealSwapSuggestion from './MealSwapSuggestion';

const mealEmojis = {
    breakfast: '🍳',
    lunch: '🍛',
    dinner: '🍽️'
};

export default function DayMealCard({ type, meal, onSave, onDelete, onToggleStatus, onViewRecipe, showSwapSuggestion, pantryItems, settings }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: meal?.name || '',
        cost: meal?.cost || '',
        prep_notes: meal?.prep_notes || ''
    });

    const handleSave = () => {
        onSave({
            ...formData,
            cost: parseFloat(formData.cost) || 0
        });
        setIsEditing(false);
    };

    const statusColors = {
        pending: 'border-amber-200 bg-amber-50/50',
        done: 'border-emerald-200 bg-emerald-50/50',
        skipped: 'border-stone-200 bg-stone-50/50'
    };

    return (
        <motion.div
            layout
            className={cn(
                "rounded-2xl border-2 overflow-hidden",
                meal?.status ? statusColors[meal.status] : 'border-dashed border-stone-200 bg-white'
            )}
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{mealEmojis[type]}</span>
                        <span className="font-semibold text-stone-700 capitalize">{type}</span>
                    </div>

                    {meal?.id && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onViewRecipe}
                                className="p-2 rounded-lg hover:bg-orange-50 text-stone-400 hover:text-orange-600 transition-colors"
                            >
                                <BookOpen className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                            >
                                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={onToggleStatus}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                    meal.status === 'done'
                                        ? "bg-emerald-500 text-white"
                                        : "bg-stone-100 text-stone-400 hover:bg-emerald-100 hover:text-emerald-500"
                                )}
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {isEditing || !meal?.id ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <Input
                                placeholder="Meal name (e.g., Rice & Beans)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-white"
                            />
                            <Input
                                placeholder="Cost (KES)"
                                type="number"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="bg-white"
                            />
                            <Input
                                placeholder="Prep notes (optional)"
                                value={formData.prep_notes}
                                onChange={(e) => setFormData({ ...formData, prep_notes: e.target.value })}
                                className="bg-white"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={!formData.name}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {meal?.id ? 'Update' : 'Add Meal'}
                                </Button>
                                {meal?.id && (
                                    <Button
                                        variant="outline"
                                        onClick={onDelete}
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ) : meal?.name ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className={cn(
                                "font-medium text-stone-800",
                                meal.status === 'done' && "line-through opacity-60"
                            )}>
                                {meal.name}
                            </p>
                            {meal.cost && (
                                <p className="text-sm text-emerald-600 font-medium mt-1">
                                    KES {meal.cost}
                                </p>
                            )}
                            {meal.prep_notes && (
                                <p className="text-xs text-stone-500 mt-2 bg-stone-100 rounded-lg px-3 py-2">
                                    💡 {meal.prep_notes}
                                </p>
                            )}
                        </motion.div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsEditing(true)}
                            className="w-full py-4 flex items-center justify-center gap-2 text-stone-400 hover:text-emerald-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add {type}</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Meal Swap Suggestion */}
                {showSwapSuggestion && meal?.id && !isEditing && (
                    <MealSwapSuggestion
                        meal={meal}
                        pantryItems={pantryItems}
                        settings={settings}
                        onSwap={(swapData) => {
                            setFormData({ ...formData, ...swapData });
                            onSave(swapData);
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
}