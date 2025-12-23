import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Loader2, ShoppingBag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShoppingListItem from '@/components/shopping/ShoppingListItem';
import BudgetBar from '@/components/shopping/BudgetBar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const CATEGORIES = ['staples', 'proteins', 'vegetables', 'fruits', 'dairy', 'misc'];

export default function Shopping() {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const [showAddForm, setShowAddForm] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', category: 'staples', quantity: '', price: '' });
    const queryClient = useQueryClient();

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['shoppingItems', currentMonth],
        queryFn: () => base44.entities.ShoppingItem.filter({ month: currentMonth })
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const list = await base44.entities.UserSettings.list();
            return list[0] || {
                monthly_budget: 6000,
                budget_allocation: {
                    staples: 2800,
                    proteins: 1900,
                    vegetables: 500,
                    fruits: 500,
                    misc: 300
                }
            };
        }
    });

    const { data: meals = [] } = useQuery({
        queryKey: ['mealsForShopping', currentMonth],
        queryFn: async () => {
            const allMeals = await base44.entities.Meal.list('-date', 100);
            return allMeals.filter(m => m.date?.startsWith(currentMonth));
        }
    });

    const createItemMutation = useMutation({
        mutationFn: (data) => base44.entities.ShoppingItem.create({ ...data, month: currentMonth }),
        onSuccess: () => {
            queryClient.invalidateQueries(['shoppingItems']);
            setNewItem({ name: '', category: 'staples', quantity: '', price: '' });
            setShowAddForm(false);
        }
    });

    const updateItemMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            await base44.entities.ShoppingItem.update(id, data);

            // If item is marked as purchased, update pantry
            if (data.purchased === true) {
                const item = items.find(i => i.id === id);
                if (item) {
                    // Check if pantry item exists
                    const existingPantry = pantryItems.find(p =>
                        p.name.toLowerCase() === item.name.toLowerCase()
                    );

                    if (existingPantry) {
                        // Add to existing quantity
                        const currentQty = parseFloat(existingPantry.quantity) || 0;
                        const addedQty = parseFloat(item.quantity) || 1;
                        await base44.entities.PantryItem.update(existingPantry.id, {
                            quantity: String(currentQty + addedQty),
                            last_updated: format(new Date(), 'yyyy-MM-dd')
                        });
                    } else {
                        // Create new pantry item
                        await base44.entities.PantryItem.create({
                            name: item.name,
                            category: item.category,
                            quantity: item.quantity || '1',
                            unit: 'units',
                            last_updated: format(new Date(), 'yyyy-MM-dd')
                        });
                    }
                    queryClient.invalidateQueries(['pantry']);
                }
            }
        },
        onSuccess: () => queryClient.invalidateQueries(['shoppingItems'])
    });

    const deleteItemMutation = useMutation({
        mutationFn: (id) => base44.entities.ShoppingItem.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['shoppingItems'])
    });

    const { data: pantryItems = [] } = useQuery({
        queryKey: ['pantry'],
        queryFn: () => base44.entities.PantryItem.list()
    });

    const generateFromMeals = async () => {
        setIsGenerating(true);
        try {
            const mealNames = meals.map(m => m.name).filter(Boolean);
            if (mealNames.length === 0) {
                alert('No meals planned yet. Add some meals first!');
                setIsGenerating(false);
                return;
            }

            // Build pantry inventory summary
            const pantryList = pantryItems.map(p => `${p.name} (${p.quantity} ${p.unit || ''})`).join(', ');

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Based on these planned meals: ${mealNames.join(', ')}
        
        Current pantry inventory: ${pantryList || 'Empty pantry'}
        
        Generate a shopping list with ingredients needed. ONLY include items that are NOT already in the pantry or if pantry quantity is insufficient.
        Check the pantry carefully and exclude items we already have.
        
        Categories: staples (rice, flour, maize meal, cooking oil), proteins (meat, chicken, fish, eggs, beans), vegetables (sukuma wiki, tomatoes, onions, etc), fruits, dairy (milk), misc (spices, salt).
        Include realistic Kenyan market prices in KES.
        Each item should have: name, category (one of: staples, proteins, vegetables, fruits, dairy, misc), quantity (with unit), price (number in KES).`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    category: { type: "string" },
                                    quantity: { type: "string" },
                                    price: { type: "number" }
                                }
                            }
                        }
                    }
                }
            });

            if (result.items?.length > 0) {
                await base44.entities.ShoppingItem.bulkCreate(
                    result.items.map(item => ({
                        ...item,
                        month: currentMonth,
                        purchased: false
                    }))
                );
                queryClient.invalidateQueries(['shoppingItems']);
            }
        } catch (error) {
            console.error('Failed to generate shopping list:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredItems = filterCategory === 'all'
        ? items
        : items.filter(i => i.category === filterCategory);

    const groupedItems = useMemo(() => {
        const groups = {};
        filteredItems.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [filteredItems]);

    const spendingByCategory = useMemo(() => {
        const spending = {};
        items.forEach(item => {
            if (!spending[item.category]) spending[item.category] = 0;
            spending[item.category] += item.price || 0;
        });
        return spending;
    }, [items]);

    const totalSpent = items.reduce((sum, i) => sum + (i.price || 0), 0);
    const purchasedCount = items.filter(i => i.purchased).length;

    return (
        <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Shopping</h1>
                    <p className="text-sm text-stone-500">
                        {purchasedCount}/{items.length} items done
                    </p>
                </div>
                <Button
                    onClick={generateFromMeals}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Auto Generate
                </Button>
            </motion.div>

            {/* Budget Overview */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-5 bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl text-white"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-stone-400">Monthly Budget</span>
                    <ShoppingBag className="w-5 h-5 text-stone-400" />
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold">KES {totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-stone-400">
                            of KES {(settings?.monthly_budget || 6000).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-emerald-400 font-medium">
                            KES {((settings?.monthly_budget || 6000) - totalSpent).toLocaleString()}
                        </p>
                        <p className="text-xs text-stone-500">remaining</p>
                    </div>
                </div>
            </motion.div>

            {/* Category Budgets */}
            <div className="space-y-2 mb-6">
                {CATEGORIES.slice(0, 3).map(cat => (
                    <BudgetBar
                        key={cat}
                        category={cat}
                        spent={spendingByCategory[cat] || 0}
                        budget={settings?.budget_allocation?.[cat] || 1000}
                    />
                ))}
            </div>

            {/* Filter & Add */}
            <div className="flex items-center gap-3 mb-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                    <DialogTrigger asChild>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Shopping Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input
                                placeholder="Item name"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                            <Select
                                value={newItem.category}
                                onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Quantity (e.g., 2 kg)"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                            />
                            <Input
                                placeholder="Price (KES)"
                                type="number"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            />
                            <Button
                                onClick={() => createItemMutation.mutate({
                                    ...newItem,
                                    price: parseFloat(newItem.price) || 0
                                })}
                                disabled={!newItem.name}
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                                Add to List
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Shopping List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : Object.keys(groupedItems).length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <p className="text-stone-500">No items yet</p>
                        <p className="text-sm text-stone-400">Add items or generate from your meal plan</p>
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([category, categoryItems]) => (
                        <div key={category}>
                            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2 capitalize">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {categoryItems.map(item => (
                                        <ShoppingListItem
                                            key={item.id}
                                            item={item}
                                            onToggle={() => updateItemMutation.mutate({
                                                id: item.id,
                                                data: { purchased: !item.purchased }
                                            })}
                                            onDelete={() => deleteItemMutation.mutate(item.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}