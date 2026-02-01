'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, EmptyState } from '@/components/ui';
import { Camera, Calendar, Gift, ListChecks, BookHeart, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';

export default function DashboardPage() {
    const { user, partner } = useAuth();
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [stats, setStats] = useState({
        memories: 0,
        events: 0,
        bucketlistProgress: 0,
        journalEntries: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch upcoming events
                const eventsData: any = await api.getUpcomingEvents(3);
                setUpcomingEvents(eventsData.events || []);

                // Fetch bucketlist for stats
                if (partner) {
                    const bucketlistData: any = await api.getBucketlist();
                    setStats(prev => ({
                        ...prev,
                        bucketlistProgress: bucketlistData.stats?.progress || 0,
                    }));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        if (partner) {
            fetchData();
        }
    }, [partner]);

    const quickLinks = [
        { href: '/dashboard/memories', icon: Camera, label: 'Add Memory', color: 'from-rose-400 to-pink-500' },
        { href: '/dashboard/calendar', icon: Calendar, label: 'Plan Date', color: 'from-purple-400 to-violet-500' },
        { href: '/dashboard/wishlist', icon: Gift, label: 'Wishlist', color: 'from-pink-400 to-rose-500' },
        { href: '/dashboard/journal', icon: BookHeart, label: 'Write Entry', color: 'from-violet-400 to-purple-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="text-center md:text-left">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Welcome back, <span className="text-gradient">{user?.nickname || user?.displayName}</span>! 💕
                </h1>
                {partner ? (
                    <p className="text-gray-500">
                        {partner.nickname || partner.displayName} is waiting to see what you've been up to
                    </p>
                ) : (
                    <p className="text-gray-500">
                        Invite your partner to start building your Love Nest together
                    </p>
                )}
            </div>

            {!partner ? (
                /* Not Linked State */
                <Card className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="relative inline-block mb-6">
                            <Heart className="w-20 h-20 text-rose-500/20" />
                            <Sparkles className="w-8 h-8 text-purple-400 absolute top-0 right-0" />
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-3">
                            Your Nest Awaits Two Hearts
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Love Nest is designed for couples. Invite your special someone to unlock all features and start your journey together.
                        </p>
                        <p className="text-sm text-rose-600 mb-2">Click "Invite Partner" in the sidebar to send a beautiful invitation 💌</p>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Quick Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickLinks.map((link, index) => (
                            <Link key={index} href={link.href}>
                                <Card className="p-4 text-center hover:scale-105 transition-transform group cursor-pointer">
                                    <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                                        <link.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="font-medium text-gray-700">{link.label}</p>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Main Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Upcoming Events */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-serif text-xl font-semibold text-gray-800">Upcoming Events</h2>
                                <Link href="/dashboard/calendar" className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingEvents.map((event) => (
                                        <div key={event._id} className="flex items-center gap-4 p-3 bg-rose-50 rounded-xl">
                                            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-400 rounded-xl flex items-center justify-center text-white">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate">{event.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(event.date), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon="📅"
                                    title="No upcoming events"
                                    description="Plan your next date!"
                                />
                            )}
                        </Card>

                        {/* Bucket List Progress */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-serif text-xl font-semibold text-gray-800">Bucket List</h2>
                                <Link href="/dashboard/bucketlist" className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="text-center py-6">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full border-8 border-rose-100 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-gradient">{stats.bucketlistProgress}%</p>
                                            <p className="text-xs text-gray-500">Complete</p>
                                        </div>
                                    </div>
                                    <div
                                        className="absolute inset-0 rounded-full border-8 border-transparent border-t-rose-500"
                                        style={{
                                            transform: `rotate(${stats.bucketlistProgress * 3.6}deg)`,
                                            transition: 'transform 1s ease-out'
                                        }}
                                    />
                                </div>
                                <p className="mt-4 text-gray-500">
                                    Keep checking off those dreams together! ✨
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Romantic Note */}
                    <Card className="p-6 bg-gradient-to-r from-rose-50 to-purple-50 border-none">
                        <div className="text-center">
                            <p className="font-serif text-lg text-gray-700 italic">
                                "The best thing to hold onto in life is each other."
                            </p>
                            <p className="text-sm text-gray-500 mt-2">— Audrey Hepburn</p>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
