import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Edit3, Trash2, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO, isPast } from 'date-fns';

const categoryIcons = {
    staples: '🌾',
    carbohydrates: '🍚',
    proteins: '🥩',
    vegetables: '🥬',
    fruits: '🍎',
    dairy: '🥛',
    misc: '📦'
};


export default function PantryItemCard({ item, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        quantity: item.quantity || '',
        expiry_date: item.expiry_date || ''
    });

    const isExpiringSoon = item.expiry_date && isPast(parseISO(item.expiry_date));
    const isLowStock = item.quantity && item.low_stock_threshold &&
        parseFloat(item.quantity) <= parseFloat(item.low_stock_threshold);

    const handleSave = () => {
        onUpdate(item.id, {
            ...editData,
            last_updated: format(new Date(), 'yyyy-MM-dd')
        });
        setIsEditing(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-100 p-4"
        >
            <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">
                    {categoryIcons[item.category] || '📦'}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h3 className="font-semibold text-stone-800 truncate">{item.name}</h3>
                            <p className="text-xs text-stone-400 capitalize">{item.category}</p>
                        </div>

                        {!isEditing && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="p-2 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-2">
                            <Input
                                placeholder="Quantity"
                                value={editData.quantity}
                                onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                                className="h-8 text-sm"
                            />
                            <Input
                                type="date"
                                value={editData.expiry_date}
                                onChange={(e) => setEditData({ ...editData, expiry_date: e.target.value })}
                                className="h-8 text-sm"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleSave} size="sm" className="flex-1">Save</Button>
                                <Button
                                    onClick={() => setIsEditing(false)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-3.5 h-3.5 text-stone-400" />
                                <span className="text-sm font-medium text-stone-700">
                                    {item.quantity} {item.unit || ''}
                                </span>
                            </div>

                            {(isLowStock || isExpiringSoon) && (
                                <div className="flex gap-2 mt-2">
                                    {isLowStock && (
                                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                            <AlertTriangle className="w-3 h-3" />
                                            Low Stock
                                        </span>
                                    )}
                                    {isExpiringSoon && (
                                        <span className="flex items-center gap-1 text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                            <AlertTriangle className="w-3 h-3" />
                                            Expired
                                        </span>
                                    )}
                                </div>
                            )}

                            {item.expiry_date && !isExpiringSoon && (
                                <p className="text-xs text-stone-400 mt-1">
                                    Expires: {format(parseISO(item.expiry_date), 'MMM d, yyyy')}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}