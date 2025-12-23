import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ArrowRight, DollarSign, Package } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function MealSwapSuggestion({ meal, pantryItems, onSwap, settings }) {
    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateSwaps = async () => {
        setIsLoading(true);
        try {
            const pantryList = pantryItems.map(p => `${p.name} (${p.quantity} ${p.unit || ''})`).join(', ');
            const dietaryGoals = settings?.dietary_goals || ['balanced'];
            const preference = settings?.food_preference || 'kenyan';

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Current meal: "${meal.name}" - Cost: KES ${meal.cost || 0}
        
        Available pantry: ${pantryList || 'Limited'}
        Dietary goals: ${dietaryGoals.join(', ')}
        Food preference: ${preference}
        
        Suggest 2-3 alternative meals that are:
        1. Cheaper or same cost
        2. Use more pantry ingredients
        3. Align with dietary goals
        4. Similar meal type (${meal.type})
        
        For each suggestion provide: name, estimated_cost, pantry_usage_score (0-100), reason (why it's better)`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    estimated_cost: { type: "number" },
                                    pantry_usage_score: { type: "number" },
                                    reason: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setSuggestions(result.suggestions || []);
        } catch (error) {
            console.error('Failed to generate swaps:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwap = (suggestion) => {
        onSwap({
            name: suggestion.name,
            cost: suggestion.estimated_cost
        });
        setSuggestions(null);
    };

    return (
        <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
            {!suggestions ? (
                <Button
                    onClick={generateSwaps}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="w-full text-purple-600 border-purple-200 hover:bg-purple-100"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Suggest Better Alternatives
                </Button>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-purple-700 mb-2">Smart Alternatives</p>
                    {suggestions.map((sug, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-3 bg-teal-600 rounded-lg border border-teal-200 text-white"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-white text-sm">{sug.name}</h4>
                                    <p className="text-xs text-white mt-1">{sug.reason}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs bg-teal-500 text-white">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    KES {sug.estimated_cost}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-teal-500 text-white">
                                    <Package className="w-3 h-3 mr-1" />
                                    {sug.pantry_usage_score}% pantry
                                </Badge>
                            </div>
                            <Button
                                onClick={() => handleSwap(sug)}
                                size="sm"
                                className="w-full bg-teal-600 hover:bg-teal-700"
                            >
                                <ArrowRight className="w-4 h-4 mr-1" />
                                Swap to This
                            </Button>
                        </motion.div>
                    ))}
                    <Button
                        onClick={() => setSuggestions(null)}
                        size="sm"
                        variant="ghost"
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
}