import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['staples', 'proteins', 'vegetables', 'fruits', 'dairy', 'spices', 'misc'];

export default function AddPantryDialog({ onAdd }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'staples',
        quantity: '',
        unit: 'kg',
        low_stock_threshold: '',
        expiry_date: '',
        notes: ''
    });

    const handleSubmit = () => {
        if (!formData.name) return;
        onAdd({
            ...formData,
            last_updated: format(new Date(), 'yyyy-MM-dd')
        });
        setFormData({
            name: '',
            category: 'staples',
            quantity: '',
            unit: 'kg',
            low_stock_threshold: '',
            expiry_date: '',
            notes: ''
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Pantry Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div>
                        <Label>Item Name</Label>
                        <Input
                            placeholder="e.g., Rice, Cooking Oil"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label>Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(v) => setFormData({ ...formData, category: v })}
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Quantity</Label>
                            <Input
                                placeholder="e.g., 5"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Unit</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(v) => setFormData({ ...formData, unit: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="g">g</SelectItem>
                                    <SelectItem value="l">liters</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="pieces">pieces</SelectItem>
                                    <SelectItem value="packets">packets</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Low Stock Alert (optional)</Label>
                        <Input
                            placeholder="Alert when below this amount"
                            value={formData.low_stock_threshold}
                            onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label>Expiry Date (optional)</Label>
                        <Input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.name}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                        Add to Pantry
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}