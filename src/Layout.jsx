import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { useAuth } from './contexts/AuthContext';
import { Home, Calendar, ShoppingCart, BarChart3, Package, Settings, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Home', icon: Home, page: 'Home' },
        { name: 'Planner', icon: Calendar, page: 'Planner' },
        { name: 'Shopping', icon: ShoppingCart, page: 'Shopping' },
        { name: 'Pantry', icon: Package, page: 'Pantry' },
        { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
        { name: 'Settings', icon: Settings, page: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-emerald-50/20">
            <style>{`
                :root {
                    --primary: #037b90;
                    --primary-light: #04a3b8;
                    --accent: #ff7f50;
                    --accent-light: #ff9a6c;
                }
            `}</style>

            {/* Top Header Bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
                <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#037b90] to-[#ff7f50] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="font-semibold text-gray-800">MealTrack</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin() && (
                            <Link to="/admin">
                                <Button variant="ghost" size="sm" className="text-[#037b90] hover:bg-[#037b90]/10">
                                    <Shield className="w-4 h-4 mr-1" />
                                    Admin
                                </Button>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="pb-24 min-h-[calc(100vh-3.5rem)]">
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
                                        ? "text-[#037b90] bg-[#037b90]/10"
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