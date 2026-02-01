'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingHearts, Card, Button } from '@/components/ui';
import { Heart, Mail, Lock, User, Cake, ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        nickname: '',
        birthday: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                displayName: formData.displayName,
                nickname: formData.nickname || undefined,
                birthday: formData.birthday || undefined,
            });
            toast.success('Account created! Welcome to Love Nest 💕');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative py-12">
            <FloatingHearts count={12} />

            <div className="w-full max-w-md relative z-10">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                <Card className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                            <Sparkles className="w-5 h-5 text-purple-400 absolute -top-1 -right-2" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-gradient mt-4 mb-2">Create Your Nest</h1>
                        <p className="text-gray-500">Start your love story today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                            <input
                                type="text"
                                name="displayName"
                                placeholder="Your name"
                                value={formData.displayName}
                                onChange={handleChange}
                                required
                                className="input-romantic pl-12"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="input-romantic pl-12"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password (min 6 characters)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="input-romantic pl-12"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="input-romantic pl-12"
                            />
                        </div>

                        {/* Optional Fields */}
                        <div className="pt-2 border-t border-rose-100">
                            <p className="text-sm text-gray-400 mb-3">Optional details</p>

                            <div className="relative mb-4">
                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                                <input
                                    type="text"
                                    name="nickname"
                                    placeholder="Nickname (e.g., Babe, Honey)"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    className="input-romantic pl-12"
                                />
                            </div>

                            <div className="relative">
                                <Cake className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                                <input
                                    type="date"
                                    name="birthday"
                                    placeholder="Your birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    className="input-romantic pl-12"
                                />
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="w-full">
                            Create Account
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-rose-600 hover:text-rose-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </Card>
            </div>
        </main>
    );
}
