import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';

export default function ShoppingListItem({ item, onToggle, onDelete, onUpdateQuantity }) {
    const categoryIcons = {
        staples: '🌾',
        carbohydrates: '🍚',
        proteins: '🥩',
        vegetables: '🥬',
        fruits: '🍎',
        dairy: '🥛',
        misc: '📦'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
                "flex items-center gap-3 p-4 rounded-2xl transition-all duration-300",
                item.purchased
                    ? "bg-emerald-50 border border-emerald-100"
                    : "bg-white border border-stone-100"
            )}
        >
            <button
                onClick={() => onToggle(item)}
                className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                    item.purchased
                        ? "bg-emerald-500 text-white"
                        : "border-2 border-stone-200 hover:border-emerald-300"
                )}
            >
                {item.purchased && <Check className="w-4 h-4" />}
            </button>

            <div className="text-xl flex-shrink-0">
                {categoryIcons[item.category] || '📦'}
            </div>

            <div className="flex-1 min-w-0">
                <p className={cn(
                    "font-medium text-stone-800 truncate",
                    item.purchased && "line-through opacity-60"
                )}>
                    {item.name}
                </p>
                <p className="text-sm text-stone-500">
                    {item.quantity}
                </p>
            </div>

            {item.price && (
                <div className="text-right flex-shrink-0">
                    <p className={cn(
                        "font-semibold",
                        item.purchased ? "text-emerald-600" : "text-stone-700"
                    )}>
                        KES {item.price}
                    </p>
                </div>
            )}

            <button
                onClick={() => onDelete(item)}
                className="p-2 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </motion.div>
    );
}