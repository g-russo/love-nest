'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingHearts, Button, LoadingPage } from '@/components/ui';
import { Heart, Camera, Calendar, Gift, BookHeart, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Memories',
    description: 'Share photos & videos in a beautiful polaroid gallery',
    color: 'from-rose-400 to-pink-500',
  },
  {
    icon: Calendar,
    title: 'Date Planner',
    description: 'Plan special dates with automatic reminders',
    color: 'from-purple-400 to-violet-500',
  },
  {
    icon: Gift,
    title: 'Wishlists',
    description: 'Keep track of what makes each other happy',
    color: 'from-pink-400 to-rose-500',
  },
  {
    icon: BookHeart,
    title: 'Our Journal',
    description: 'Write your love story together',
    color: 'from-violet-400 to-purple-500',
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <FloatingHearts count={20} />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative">
              <Heart className="w-16 h-16 text-rose-500 fill-rose-500 animate-pulse" />
              <Sparkles className="w-6 h-6 text-purple-400 absolute -top-1 -right-1" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Love Nest</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-light">
            A special place for the two of you
          </p>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Share memories, plan dates, keep wishlists, and write your love story together in your own private corner of the internet.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                <Heart className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 text-gradient">
            Everything You Need
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Create, share, and celebrate your love with features designed just for couples
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-400 text-sm">
        <p>Made with 💕 for couples everywhere</p>
      </footer>
    </main>
  );
}
