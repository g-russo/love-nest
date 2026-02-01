'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Modal, EmptyState, LoadingSpinner } from '@/components/ui';
import { BookHeart, Plus, Trash2, Edit2, Calendar, User, Smile, Frown, Heart, Meh } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood?: 'happy' | 'love' | 'neutral' | 'sad';
    date: string;
    authorId: {
        _id: string;
        displayName: string;
        avatar?: string;
    };
}

const moodEmojis = {
    happy: { icon: Smile, label: 'Happy', color: 'text-yellow-500' },
    love: { icon: Heart, label: 'In Love', color: 'text-rose-500' },
    neutral: { icon: Meh, label: 'Neutral', color: 'text-gray-500' },
    sad: { icon: Frown, label: 'Sad', color: 'text-blue-500' },
};

export default function JournalPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const data: any = await api.getJournalEntries({ limit: 50 });
            setEntries(data.entries || []);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this journal entry?')) return;

        try {
            await api.deleteJournalEntry(id);
            setEntries(entries.filter(e => e._id !== id));
            setSelectedEntry(null);
            toast.success('Entry deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-gray-800">Our Journal 📖</h1>
                    <p className="text-gray-500">Write your love story together</p>
                </div>
                <Button onClick={() => {
                    setEditingEntry(null);
                    setModalOpen(true);
                }}>
                    <Plus className="w-5 h-5" />
                    New Entry
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-20">
                    <LoadingSpinner />
                </div>
            ) : entries.length === 0 ? (
                <EmptyState
                    icon="📝"
                    title="No entries yet"
                    description="Start writing your love story together!"
                    action={
                        <Button onClick={() => setModalOpen(true)}>
                            <Plus className="w-5 h-5" />
                            Write First Entry
                        </Button>
                    }
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entries.map(entry => {
                        const MoodIcon = entry.mood && moodEmojis[entry.mood] ? moodEmojis[entry.mood].icon : null;
                        return (
                            <Card
                                key={entry._id}
                                className="p-5 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => setSelectedEntry(entry)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                                            {entry.authorId.displayName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{entry.authorId.displayName}</p>
                                            <p className="text-xs text-gray-400">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                    {MoodIcon && (
                                        <span className={moodEmojis[entry.mood!].color}>
                                            <MoodIcon className="w-5 h-5" />
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-serif font-semibold text-gray-800 mb-2 line-clamp-2">{entry.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-3">{entry.content}</p>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Entry Modal (View) */}
            {selectedEntry && (
                <Modal
                    isOpen={!!selectedEntry}
                    onClose={() => setSelectedEntry(null)}
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                    {selectedEntry.authorId.displayName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{selectedEntry.authorId.displayName}</p>
                                    <p className="text-sm text-gray-500">{format(new Date(selectedEntry.date), 'MMMM d, yyyy')}</p>
                                </div>
                            </div>
                            {selectedEntry.mood && moodEmojis[selectedEntry.mood] && (
                                <div className={`flex items-center gap-1 ${moodEmojis[selectedEntry.mood].color}`}>
                                    {React.createElement(moodEmojis[selectedEntry.mood].icon, { className: 'w-5 h-5' })}
                                    <span className="text-sm">{moodEmojis[selectedEntry.mood].label}</span>
                                </div>
                            )}
                        </div>

                        <h2 className="font-serif text-2xl font-bold text-gray-800">{selectedEntry.title}</h2>
                        <div className="prose prose-rose max-w-none">
                            <p className="text-gray-600 whitespace-pre-wrap">{selectedEntry.content}</p>
                        </div>

                        {selectedEntry.authorId._id === user?._id && (
                            <div className="flex gap-3 pt-4 border-t border-rose-100">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setEditingEntry(selectedEntry);
                                        setSelectedEntry(null);
                                        setModalOpen(true);
                                    }}
                                    className="flex-1"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDelete(selectedEntry._id)}
                                    className="flex-1 text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Write/Edit Modal */}
            <JournalModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingEntry(null);
                }}
                onSuccess={() => {
                    setModalOpen(false);
                    setEditingEntry(null);
                    fetchEntries();
                }}
                entry={editingEntry}
            />
        </div>
    );
}

function JournalModal({ isOpen, onClose, onSuccess, entry }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entry: JournalEntry | null;
}) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        mood: '' as '' | 'happy' | 'love' | 'neutral' | 'sad',
        date: format(new Date(), 'yyyy-MM-dd'),
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (entry) {
            setFormData({
                title: entry.title,
                content: entry.content,
                mood: entry.mood || '',
                date: format(new Date(entry.date), 'yyyy-MM-dd'),
            });
        } else {
            setFormData({
                title: '',
                content: '',
                mood: '',
                date: format(new Date(), 'yyyy-MM-dd'),
            });
        }
    }, [entry]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = {
                title: formData.title,
                content: formData.content,
                mood: formData.mood || undefined,
                date: formData.date,
            };

            if (entry) {
                await api.updateJournalEntry(entry._id, data);
                toast.success('Entry updated!');
            } else {
                await api.createJournalEntry(data);
                toast.success('Entry added! 📖');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? 'Edit Entry' : 'New Journal Entry 📖'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="A special day together..."
                        required
                        className="input-romantic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your thoughts *</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write about your day, feelings, or anything on your mind..."
                        rows={8}
                        required
                        className="input-romantic resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                        <select
                            value={formData.mood}
                            onChange={(e) => setFormData({ ...formData, mood: e.target.value as any })}
                            className="input-romantic"
                        >
                            <option value="">Select mood...</option>
                            <option value="happy">😊 Happy</option>
                            <option value="love">💕 In Love</option>
                            <option value="neutral">😐 Neutral</option>
                            <option value="sad">😢 Sad</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="input-romantic"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} type="button" className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={submitting} className="flex-1">
                        {entry ? 'Update' : 'Save Entry'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
