import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, UtensilsCrossed } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/home');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#037b90] via-[#04a3b8] to-[#ff7f50] animate-gradient-shift" />

            {/* Animated Circles */}
            <motion.div
                className="absolute top-20 left-20 w-72 h-72 rounded-full bg-[#ff7f50]/30 blur-3xl"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#037b90]/40 blur-3xl"
                animate={{
                    x: [0, -40, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.15, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/10 blur-2xl"
                animate={{
                    x: [0, 30, 0],
                    y: [0, -30, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#037b90] to-[#ff7f50] mb-4 shadow-lg"
                        >
                            <UtensilsCrossed className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-800">MealTrack Pro</h1>
                        <p className="text-gray-500 mt-1">Sign in to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-medium">
                                Email or Username
                            </Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="Enter your email or username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-xl border-gray-200 focus:border-[#037b90] focus:ring-[#037b90]/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#037b90] focus:ring-[#037b90]/20 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-[#037b90] hover:text-[#025d6e] font-medium transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#037b90] to-[#04a3b8] hover:from-[#025d6e] hover:to-[#037b90] text-white font-semibold text-base shadow-lg shadow-[#037b90]/25 transition-all duration-300"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="text-[#ff7f50] hover:text-[#e66a3d] font-semibold transition-colors"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-4 backdrop-blur-md bg-white/20 rounded-2xl text-center text-white text-sm"
                >
                    <p className="font-medium mb-2">Demo Credentials:</p>
                    <p className="text-white/80">Admin: gee.mwerevu@gmail.com / passcode123!</p>
                    <p className="text-white/80">User: demo@mealtrack.pro / demo123!</p>
                </motion.div>
            </motion.div>

            {/* CSS for gradient animation */}
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradient-shift 8s ease infinite;
                }
            `}</style>
        </div>
    );
}
