'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FloatingHearts, Card, Button, LoadingPage } from '@/components/ui';
import { Heart, Mail, Lock, User, Cake, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function InvitePage() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();

    const [inviter, setInviter] = useState<{ displayName: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        nickname: '',
        birthday: '',
    });

    useEffect(() => {
        const validateToken = async () => {
            try {
                const data: any = await api.validateInvite(token);
                setInviter(data.inviter);
            } catch (err: any) {
                setError(err.message || 'Invalid or expired invitation');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            validateToken();
        }
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setSubmitting(true);

        try {
            await api.acceptInvite(token, {
                email: formData.email,
                password: formData.password,
                displayName: formData.displayName,
                nickname: formData.nickname || undefined,
                birthday: formData.birthday || undefined,
            });

            toast.success('You are now connected! 💕');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Failed to accept invitation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 relative">
                <FloatingHearts count={8} />
                <Card className="p-8 text-center max-w-md relative z-10">
                    <div className="text-5xl mb-4">💔</div>
                    <h1 className="font-serif text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Button onClick={() => router.push('/')}>Go Home</Button>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative py-12">
            <FloatingHearts count={15} />

            <div className="w-full max-w-md relative z-10">
                <Card className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <Heart className="w-16 h-16 text-rose-500 fill-rose-500 animate-pulse" />
                            <Sparkles className="w-6 h-6 text-purple-400 absolute -top-1 -right-2" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-gradient mt-4 mb-2">
                            You're Invited! ✨
                        </h1>
                        <p className="text-gray-600">
                            <span className="font-semibold text-rose-600">{inviter?.displayName}</span> has invited you
                            <br />to join their Love Nest
                        </p>
                    </div>

                    {/* Romantic Quote */}
                    <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-4 mb-6 text-center">
                        <p className="text-gray-600 italic text-sm">
                            "Every love story is beautiful, but ours is my favorite."
                        </p>
                        <div className="flex justify-center gap-1 mt-2 text-rose-400">
                            <span>♥</span><span>♥</span><span>♥</span>
                        </div>
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
                                placeholder="Create a password"
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

                        <Button type="submit" loading={submitting} className="w-full" size="lg">
                            Accept & Join 💝
                        </Button>
                    </form>
                </Card>
            </div>
        </main>
    );
}
