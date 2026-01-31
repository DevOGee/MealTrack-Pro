import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Calendar, Wallet, Shuffle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIGenerateModalProps {
    open: boolean;
    onClose: () => void;
    onGenerate: (options: GenerateOptions) => void;
    isGenerating: boolean;
    monthlyBudget?: number;
    daysInMonth?: number;
}

export interface GenerateOptions {
    period: '7' | '14' | 'month';
    budgetAware: boolean;
    avoidRepeats: boolean;
}

const periodOptions = [
    { value: '7', label: '7 Days', description: 'Generate a week of meals', icon: '📅' },
    { value: '14', label: '14 Days', description: 'Generate two weeks of meals', icon: '📆' },
    { value: 'month', label: 'Full Month', description: 'Generate entire month', icon: '🗓️' }
];

export default function AIGenerateModal({
    open,
    onClose,
    onGenerate,
    isGenerating,
    monthlyBudget = 6000,
    daysInMonth = 30
}: AIGenerateModalProps) {
    const [period, setPeriod] = useState<'7' | '14' | 'month'>('7');
    const [budgetAware, setBudgetAware] = useState(true);
    const [avoidRepeats, setAvoidRepeats] = useState(true);

    const getDays = () => {
        if (period === '7') return 7;
        if (period === '14') return 14;
        return daysInMonth;
    };

    const estimatedCost = () => {
        const days = getDays();
        const avgDailyCost = 320; // Average: 60 + 120 + 140
        return days * avgDailyCost;
    };

    const handleGenerate = () => {
        onGenerate({ period, budgetAware, avoidRepeats });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white rounded-3xl p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-white text-xl">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            AI Meal Generator
                        </DialogTitle>
                    </DialogHeader>
                    <p className="mt-2 text-purple-100 text-sm">
                        Let AI create personalized meal plans based on your preferences
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Period Selection */}
                    <div>
                        <Label className="text-sm font-semibold text-stone-700 mb-3 block">
                            Generation Period
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {periodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setPeriod(option.value as '7' | '14' | 'month')}
                                    className={cn(
                                        "relative p-3 rounded-2xl border-2 transition-all duration-200 text-center",
                                        period === option.value
                                            ? "border-purple-500 bg-purple-50"
                                            : "border-stone-200 hover:border-stone-300"
                                    )}
                                >
                                    {period === option.value && (
                                        <motion.div
                                            layoutId="selected-period"
                                            className="absolute inset-0 bg-purple-50 rounded-2xl"
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                    <div className="relative">
                                        <span className="text-2xl">{option.icon}</span>
                                        <p className="font-semibold text-stone-800 mt-1 text-sm">
                                            {option.label}
                                        </p>
                                    </div>
                                    {period === option.value && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1"
                                        >
                                            <Check className="w-3 h-3 text-white" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                    <Wallet className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-stone-800">Budget Aware</p>
                                    <p className="text-xs text-stone-500">Stay within KES {monthlyBudget}/month</p>
                                </div>
                            </div>
                            <Switch checked={budgetAware} onCheckedChange={setBudgetAware} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-xl">
                                    <Shuffle className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-stone-800">Maximize Variety</p>
                                    <p className="text-xs text-stone-500">Avoid repeating meals</p>
                                </div>
                            </div>
                            <Switch checked={avoidRepeats} onCheckedChange={setAvoidRepeats} />
                        </div>
                    </div>

                    {/* Estimate */}
                    <div className="bg-gradient-to-r from-stone-100 to-stone-50 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-stone-600">Meals to generate:</span>
                            <span className="font-bold text-stone-800">{getDays() * 3} meals</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-stone-600">Estimated cost:</span>
                            <span className="font-bold text-emerald-600">~KES {estimatedCost().toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating Meals...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate {getDays()}-Day Plan
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
