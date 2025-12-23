import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Calendar, ShoppingCart, BarChart3, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
    const navItems = [
        { name: 'Home', icon: Home, page: 'Home' },
        { name: 'Planner', icon: Calendar, page: 'Planner' },
        { name: 'Shopping', icon: ShoppingCart, page: 'Shopping' },
        { name: 'Pantry', icon: Package, page: 'Pantry' },
        { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
        { name: 'Settings', icon: Settings, page: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-emerald-50/20">
            <style>{`
        :root {
          --primary: #059669;
          --primary-light: #10b981;
          --accent: #f97316;
          --accent-light: #fb923c;
        }
      `}</style>

            <main className="pb-24 min-h-screen">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/60 z-50 safe-area-pb">
                <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = currentPageName === item.page;
                        return (
                            <Link
                                key={item.page}
                                to={createPageUrl(item.page)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300",
                                    isActive
                                        ? "text-emerald-600 bg-emerald-50"
                                        : "text-stone-400 hover:text-stone-600"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform duration-300",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    isActive && "font-semibold"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}