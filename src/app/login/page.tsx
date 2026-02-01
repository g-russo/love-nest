'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingHearts, Card, Button, Input } from '@/components/ui';
import { Heart, Mail, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back! 💕');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative">
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
                        <Heart className="w-12 h-12 text-rose-500 fill-rose-500 mx-auto mb-4" />
                        <h1 className="font-serif text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Sign in to your Love Nest</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-romantic pl-12"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-romantic pl-12"
                            />
                        </div>

                        <Button type="submit" loading={loading} className="w-full">
                            Sign In
                        </Button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center mt-6 text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-rose-600 hover:text-rose-700 font-medium">
                            Create one
                        </Link>
                    </p>
                </Card>
            </div>
        </main>
    );
}
