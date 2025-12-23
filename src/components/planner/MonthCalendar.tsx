import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MonthCalendar({ currentMonth, selectedDate, onSelectDate, mealsByDate }) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getDayStatus = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const meals = mealsByDate[dateStr] || [];
        const completed = meals.filter(m => m.status === 'done').length;
        if (meals.length === 0) return 'empty';
        if (completed === 3) return 'complete';
        if (completed > 0) return 'partial';
        return 'planned';
    };

    const statusColors = {
        empty: 'bg-stone-100',
        planned: 'bg-orange-100',
        partial: 'bg-amber-200',
        complete: 'bg-emerald-200'
    };

    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100">
            <h3 className="font-semibold text-stone-800 mb-4 text-center">
                {format(currentMonth, 'MMMM yyyy')}
            </h3>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-medium text-stone-400 py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {days.map((day, idx) => {
                    const status = getDayStatus(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                        <motion.button
                            key={day.toISOString()}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            onClick={() => onSelectDate(day)}
                            className={cn(
                                "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200",
                                statusColors[status],
                                isSelected && "ring-2 ring-emerald-500 ring-offset-2",
                                isTodayDate && !isSelected && "ring-2 ring-stone-300",
                                "hover:scale-105"
                            )}
                        >
                            {format(day, 'd')}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-stone-100">
                {[
                    { color: 'bg-stone-100', label: 'Empty' },
                    { color: 'bg-orange-100', label: 'Planned' },
                    { color: 'bg-emerald-200', label: 'Done' }
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <div className={cn("w-3 h-3 rounded-full", item.color)} />
                        <span className="text-xs text-stone-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}