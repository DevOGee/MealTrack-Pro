import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Filter, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PantryItemCard from '@/components/pantry/PantryItemCard';
import AddPantryDialog from '@/components/pantry/AddPantryDialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CATEGORIES = ['all', 'staples', 'proteins', 'vegetables', 'fruits', 'dairy', 'spices', 'misc'];

export default function Pantry() {
    const [filterCategory, setFilterCategory] = useState('all');
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['pantry'],
        queryFn: () => base44.entities.PantryItem.list('-last_updated')
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PantryItem.create(data),
        onSuccess: () => queryClient.invalidateQueries(['pantry'])
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PantryItem.update(id, data),
        onSuccess: () => queryClient.invalidateQueries(['pantry'])
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PantryItem.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['pantry'])
    });

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

    const lowStockCount = items.filter(item =>
        item.quantity && item.low_stock_threshold &&
        parseFloat(item.quantity) <= parseFloat(item.low_stock_threshold)
    ).length;

    const syncWithShopping = async () => {
        setIsSyncing(true);
        try {
            // Get all purchased shopping items from current month
            const shoppingItems = await base44.entities.ShoppingItem.filter({
                purchased: true,
                month: new Date().toISOString().slice(0, 7)
            });

            // For each purchased item, either update existing pantry item or create new one
            for (const shopItem of shoppingItems) {
                const existingPantry = items.find(p =>
                    p.name.toLowerCase() === shopItem.name.toLowerCase()
                );

                if (existingPantry) {
                    // Update quantity by adding purchased amount
                    const currentQty = parseFloat(existingPantry.quantity) || 0;
                    const addedQty = parseFloat(shopItem.quantity) || 1;
                    await base44.entities.PantryItem.update(existingPantry.id, {
                        quantity: String(currentQty + addedQty),
                        last_updated: new Date().toISOString().slice(0, 10)
                    });
                } else {
                    // Create new pantry item
                    await base44.entities.PantryItem.create({
                        name: shopItem.name,
                        category: shopItem.category,
                        quantity: shopItem.quantity || '1',
                        unit: 'units',
                        last_updated: new Date().toISOString().slice(0, 10)
                    });
                }
            }

            queryClient.invalidateQueries(['pantry']);
        } catch (error) {
            console.error('Failed to sync:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-800">Pantry</h1>
                        <p className="text-sm text-stone-500">{items.length} items in stock</p>
                    </div>
                    <AddPantryDialog onAdd={(data) => createMutation.mutate(data)} />
                </div>

                {/* Quick Stats */}
                <div className="flex gap-3">
                    <div className="flex-1 p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white">
                        <Package className="w-5 h-5 mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{items.length}</p>
                        <p className="text-xs opacity-80">Total Items</p>
                    </div>
                    <div className="flex-1 p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white">
                        <AlertTriangle className="w-5 h-5 mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{lowStockCount}</p>
                        <p className="text-xs opacity-80">Low Stock</p>
                    </div>
                </div>
            </motion.div>

            {/* Filter & Sync */}
            <div className="flex gap-3 mb-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="flex-1">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="capitalize">
                                {cat === 'all' ? 'All Categories' : cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    onClick={syncWithShopping}
                    disabled={isSyncing}
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                    {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Items List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : Object.keys(groupedItems).length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <p className="text-stone-500">Your pantry is empty</p>
                        <p className="text-sm text-stone-400 mb-4">Add items to track your inventory</p>
                        <Link to={createPageUrl('Shopping')}>
                            <Button variant="outline">Go to Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([category, categoryItems]) => (
                        <div key={category}>
                            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2 capitalize">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {categoryItems.map(item => (
                                    <PantryItemCard
                                        key={item.id}
                                        item={item}
                                        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                                        onDelete={(id) => deleteMutation.mutate(id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}