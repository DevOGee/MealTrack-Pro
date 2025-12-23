import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, UtensilsCrossed, Check } from 'lucide-react';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const passwordRequirements = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Contains a number', met: /\d/.test(password) },
        { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await signup(email, password, name);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff7f50] via-[#ff9a6c] to-[#037b90] animate-gradient-shift" />

            {/* Animated Circles */}
            <motion.div
                className="absolute top-10 right-20 w-80 h-80 rounded-full bg-[#037b90]/30 blur-3xl"
                animate={{
                    x: [0, -50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-10 left-20 w-96 h-96 rounded-full bg-[#ff7f50]/40 blur-3xl"
                animate={{
                    x: [0, 40, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.15, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Sign Up Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Logo & Title */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff7f50] to-[#037b90] mb-4 shadow-lg"
                        >
                            <UtensilsCrossed className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                        <p className="text-gray-500 mt-1">Join MealTrack Pro today</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center"
                        >
                            <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="font-semibold">Account Created!</p>
                            <p className="text-sm">Redirecting to login...</p>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && !success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Sign Up Form */}
                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 font-medium">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff7f50] focus:ring-[#ff7f50]/20"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff7f50] focus:ring-[#ff7f50]/20"
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
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-xl border-gray-200 focus:border-[#ff7f50] focus:ring-[#ff7f50]/20 pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Requirements */}
                                <div className="mt-2 space-y-1">
                                    {passwordRequirements.map((req, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                {req.met && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff7f50] focus:ring-[#ff7f50]/20"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#ff7f50] to-[#ff9a6c] hover:from-[#e66a3d] hover:to-[#ff7f50] text-white font-semibold text-base shadow-lg shadow-[#ff7f50]/25 transition-all duration-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-[#037b90] hover:text-[#025d6e] font-semibold transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
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
