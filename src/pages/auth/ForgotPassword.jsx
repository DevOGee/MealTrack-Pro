import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UtensilsCrossed, Mail, ArrowLeft, Check } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await forgotPassword(email);
            setSuccess(true);
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

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Back Link */}
                    <Link
                        to="/login"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>

                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#037b90] to-[#ff7f50] mb-4 shadow-lg"
                        >
                            <Mail className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
                        <p className="text-gray-500 mt-1">We'll send you reset instructions</p>
                    </div>

                    {/* Success Message */}
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h2>
                            <p className="text-gray-500 mb-6">
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>
                            <Link to="/login">
                                <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#037b90] to-[#04a3b8] text-white font-semibold">
                                    Back to Login
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <>
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

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
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
                                        className="h-12 rounded-xl border-gray-200 focus:border-[#037b90] focus:ring-[#037b90]/20"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#037b90] to-[#04a3b8] hover:from-[#025d6e] hover:to-[#037b90] text-white font-semibold text-base shadow-lg shadow-[#037b90]/25 transition-all duration-300"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
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
