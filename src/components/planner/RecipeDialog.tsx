import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChefHat, Sparkles, Loader2, ShoppingBag, Check, AlertTriangle, Clock, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function RecipeDialog({ meal, open, onClose, onUpdateMeal }) {
    const [recipe, setRecipe] = useState(meal?.recipe ? JSON.parse(meal.recipe) : null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [addedToShopping, setAddedToShopping] = useState(false);
    const queryClient = useQueryClient();

    const { data: pantryItems = [] } = useQuery({
        queryKey: ['pantry'],
        queryFn: () => base44.entities.PantryItem.list()
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const list = await base44.entities.UserSettings.list();
            return list[0] || { food_preference: 'kenyan' };
        }
    });

    const generateRecipe = async () => {
        setIsGenerating(true);
        try {
            const pantryList = pantryItems.map(p => `${p.name} (${p.quantity} ${p.unit || ''})`).join(', ');
            const preference = settings?.food_preference || 'kenyan';
            const dietaryGoals = settings?.dietary_goals || ['balanced'];
            const goalsList = dietaryGoals.join(', ');

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a detailed recipe for "${meal.name}" - a ${preference} meal.
        Budget target: KES ${meal.cost || 150}
        Available pantry items: ${pantryList || 'None'}
        Dietary goals: ${goalsList}
        
        IMPORTANT: Prioritize using pantry items and align with dietary goals (${goalsList}).
        If goals include "low_carb", reduce carbs. If "high_protein", increase protein content.
        
        Provide:
        - Full ingredient list with quantities (mark which are available in pantry)
        - Step-by-step instructions
        - Prep time and cook time
        - Servings
        - Nutritional estimate (calories, protein, carbs, fats, fiber per serving) - accurate for the dietary goals
        - Tips for making it budget-friendly and aligned with dietary goals
        
        Make it authentic and practical for Kenyan home cooking while meeting dietary preferences.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        ingredients: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    quantity: { type: "string" },
                                    in_pantry: { type: "boolean" }
                                }
                            }
                        },
                        instructions: {
                            type: "array",
                            items: { type: "string" }
                        },
                        prep_time: { type: "string" },
                        cook_time: { type: "string" },
                        servings: { type: "number" },
                        nutrition: {
                            type: "object",
                            properties: {
                                calories: { type: "number" },
                                protein: { type: "number" },
                                carbs: { type: "number" },
                                fats: { type: "number" },
                                fiber: { type: "number" }
                            }
                        },
                        tips: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            setRecipe(result);

            // Update meal with recipe and nutrition
            if (result.nutrition) {
                await onUpdateMeal({
                    recipe: JSON.stringify(result),
                    nutrition: result.nutrition
                });
                queryClient.invalidateQueries(['meals']);
            }
        } catch (error) {
            console.error('Failed to generate recipe:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const addMissingToShopping = async () => {
        if (!recipe?.ingredients) return;

        const missingItems = recipe.ingredients.filter(ing => !ing.in_pantry);
        if (missingItems.length === 0) return;

        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const itemsToAdd = missingItems.map(ing => ({
                name: ing.name,
                quantity: ing.quantity,
                category: 'misc', // Could be improved with categorization
                month: currentMonth,
                purchased: false,
                price: 0
            }));

            await base44.entities.ShoppingItem.bulkCreate(itemsToAdd);
            queryClient.invalidateQueries(['shoppingItems']);
            setAddedToShopping(true);
            setTimeout(() => setAddedToShopping(false), 2000);
        } catch (error) {
            console.error('Failed to add to shopping:', error);
        }
    };

    const missingCount = recipe?.ingredients?.filter(i => !i.in_pantry).length || 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <ChefHat className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle>{meal?.name}</DialogTitle>
                            <p className="text-sm text-stone-500">
                                {meal?.type && <span className="capitalize">{meal.type}</span>}
                                {meal?.cost && <span> • KES {meal.cost}</span>}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    {!recipe ? (
                        <div className="text-center py-12">
                            <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                            <p className="text-stone-600 mb-2">No recipe yet</p>
                            <p className="text-sm text-stone-400 mb-6">
                                Let AI generate a detailed recipe with ingredients and instructions
                            </p>
                            <Button
                                onClick={generateRecipe}
                                disabled={isGenerating}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Generate Recipe
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-teal-600 rounded-xl text-center text-white font-bold">
                                    <Clock className="w-4 h-4 text-white mx-auto mb-1" />
                                    <p className="text-xs">Prep</p>
                                    <p className="font-semibold">{recipe.prep_time}</p>
                                </div>
                                <div className="p-3 bg-teal-600 rounded-xl text-center text-white font-bold">
                                    <Clock className="w-4 h-4 text-white mx-auto mb-1" />
                                    <p className="text-xs">Cook</p>
                                    <p className="font-semibold">{recipe.cook_time}</p>
                                </div>
                                <div className="p-3 bg-teal-600 rounded-xl text-center text-white font-bold">
                                    <Users className="w-4 h-4 text-white mx-auto mb-1" />
                                    <p className="text-xs">Servings</p>
                                    <p className="font-semibold">{recipe.servings}</p>
                                </div>
                            </div>

                            {/* Nutrition */}
                            {recipe.nutrition && (
                                <div className="p-4 bg-teal-600 rounded-xl text-white font-bold">
                                    <h3 className="font-semibold text-stone-800 mb-3 text-sm">Nutrition (per serving)</h3>
                                    <div className="grid grid-cols-5 gap-2 text-center">
                                        <div>
                                            <p className="text-xs text-stone-500">Calories</p>
                                            <p className="font-bold text-white">{recipe.nutrition.calories}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500">Protein</p>
                                            <p className="font-bold text-white">{recipe.nutrition.protein}g</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500">Carbs</p>
                                            <p className="font-bold text-white">{recipe.nutrition.carbs}g</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500">Fats</p>
                                            <p className="font-bold text-white">{recipe.nutrition.fats}g</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500">Fiber</p>
                                            <p className="font-bold text-white">{recipe.nutrition.fiber || 0}g</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ingredients */}
                            <div className="p-3 bg-teal-600 rounded-xl text-white font-bold">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-stone-800">Ingredients</h3>
                                    {missingCount > 0 && (
                                        <Button
                                            onClick={addMissingToShopping}
                                            size="sm"
                                            variant="outline"
                                            disabled={addedToShopping}
                                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                        >
                                            {addedToShopping ? (
                                                <>
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Added
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="w-4 h-4 mr-1" />
                                                    Add {missingCount} to Shopping
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {recipe.ingredients?.map((ing, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg text-white",
                                                ing.in_pantry ? "bg-teal-600" : "bg-teal-800"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {ing.in_pantry ? (
                                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                                )}
                                                <span className="text-sm font-medium text-stone-700">{ing.name}</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {ing.quantity}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h3 className="font-semibold text-stone-800 mb-3">Instructions</h3>
                                <div className="space-y-3">
                                    {recipe.instructions?.map((step, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-white">{idx + 1}</span>
                                            </div>
                                            <p className="text-sm text-white leading-relaxed">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tips */}
                            {recipe.tips && recipe.tips.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-stone-800 mb-3">Budget Tips</h3>
                                    <div className="space-y-2">
                                        {recipe.tips.map((tip, idx) => (
                                            <div key={idx} className="flex gap-2 text-sm text-stone-600">
                                                <span className="text-emerald-600">💡</span>
                                                <p>{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}