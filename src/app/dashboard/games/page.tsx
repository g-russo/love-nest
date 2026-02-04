'use client';

import { Card } from '@/components/ui';
import { Gamepad2, Construction } from 'lucide-react';

export default function GamesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Gamepad2 className="w-8 h-8 text-rose-500" />
                    Games
                </h1>
                <p className="text-gray-500">Play together and have fun!</p>
            </div>

            <Card className="p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-rose-50 p-6 rounded-full mb-6">
                    <Construction className="w-12 h-12 text-rose-500" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h2>
                <p className="text-gray-500 max-w-md">
                    We're working on some fun games for you and your partner to play together.
                    Check back later for relationship quizzes, truth or dare, and more! 🎮
                </p>
            </Card>
        </div>
    );
}
