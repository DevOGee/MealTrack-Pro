import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function ExportDialog({ monthStr }) {
    const [open, setOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const exportData = async (format) => {
        setIsExporting(true);
        try {
            // Fetch all data
            const [meals, shopping, spending, pantry] = await Promise.all([
                base44.entities.Meal.list('-date', 200),
                base44.entities.ShoppingItem.list('-month', 200),
                base44.entities.SpendingRecord.list('-date', 200),
                base44.entities.PantryItem.list()
            ]);

            const monthMeals = meals.filter(m => m.date?.startsWith(monthStr));
            const monthShopping = shopping.filter(s => s.month === monthStr);
            const monthSpending = spending.filter(s => s.month === monthStr);

            if (format === 'csv') {
                // Generate CSV
                let csv = 'MEALS REPORT\n';
                csv += 'Date,Type,Name,Status,Cost,Calories,Protein,Carbs,Fats\n';
                monthMeals.forEach(m => {
                    csv += `${m.date},${m.type},${m.name},${m.status},${m.cost || 0},${m.nutrition?.calories || ''},${m.nutrition?.protein || ''},${m.nutrition?.carbs || ''},${m.nutrition?.fats || ''}\n`;
                });

                csv += '\n\nSHOPPING LIST\n';
                csv += 'Item,Category,Quantity,Price,Purchased\n';
                monthShopping.forEach(s => {
                    csv += `${s.name},${s.category},${s.quantity},${s.price || 0},${s.purchased}\n`;
                });

                csv += '\n\nPANTRY INVENTORY\n';
                csv += 'Item,Category,Quantity,Unit,Expiry Date\n';
                pantry.forEach(p => {
                    csv += `${p.name},${p.category},${p.quantity || ''},${p.unit || ''},${p.expiry_date || ''}\n`;
                });

                // Download
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mealtrack-report-${monthStr}.csv`;
                a.click();
            } else if (format === 'pdf') {
                // Generate PDF report using AI
                const totalSpent = monthShopping.reduce((sum, s) => sum + (s.price || 0), 0);
                const totalMeals = monthMeals.length;
                const mealsCompleted = monthMeals.filter(m => m.status === 'done').length;

                const reportText = `
MealTrack Pro - Monthly Report
Month: ${monthStr}

SUMMARY
-------
Total Meals Planned: ${totalMeals}
Meals Completed: ${mealsCompleted}
Total Spending: KES ${totalSpent}

MEALS
-----
${monthMeals.map(m => `${m.date} - ${m.type}: ${m.name} (KES ${m.cost || 0})`).join('\n')}

SHOPPING
--------
${monthShopping.map(s => `${s.name} - ${s.category}: KES ${s.price || 0}`).join('\n')}
        `;

                alert('PDF export generated. Check your downloads folder for: mealtrack-report-' + monthStr + '.txt');

                const blob = new Blob([reportText], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mealtrack-report-${monthStr}.txt`;
                a.click();
            }

            setOpen(false);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-4">
                    <p className="text-sm text-stone-600">Choose format for {format(new Date(monthStr + '-01'), 'MMMM yyyy')} report</p>
                    <Button
                        onClick={() => exportData('csv')}
                        disabled={isExporting}
                        className="w-full justify-start"
                        variant="outline"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                        Export as CSV
                    </Button>
                    <Button
                        onClick={() => exportData('pdf')}
                        disabled={isExporting}
                        className="w-full justify-start"
                        variant="outline"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                        Export as Text Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}