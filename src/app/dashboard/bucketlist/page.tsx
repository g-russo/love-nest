'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Modal, EmptyState, LoadingSpinner } from '@/components/ui';
import { ListChecks, Plus, Check, Trash2, Edit2, Star, Users, User } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface BucketlistItem {
    _id: string;
    title: string;
    description?: string;
    type: 'personal' | 'shared';
    isCompleted: boolean;
    completedAt?: string;
    targetDate?: string;
    createdBy: {
        _id: string;
        displayName: string;
    };
}

export default function BucketlistPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<BucketlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BucketlistItem | null>(null);
    const [filter, setFilter] = useState<'all' | 'personal' | 'shared'>('all');
    const [stats, setStats] = useState({ total: 0, completed: 0, progress: 0 });

    useEffect(() => {
        fetchBucketlist();
    }, []);

    const fetchBucketlist = async () => {
        try {
            const data: any = await api.getBucketlist();
            setItems(data.items || []);
            setStats(data.stats || { total: 0, completed: 0, progress: 0 });
        } catch (error) {
            console.error('Error fetching bucketlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        filter === 'all' || item.type === filter
    );

    const handleToggleComplete = async (id: string, isCompleted: boolean) => {
        try {
            if (isCompleted) {
                await api.uncompleteBucketlistItem(id);
            } else {
                await api.completeBucketlistItem(id);
            }
            fetchBucketlist();
            toast.success(isCompleted ? 'Unmarked' : 'Completed! 🎉');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this from your bucket list?')) return;

        try {
            await api.deleteBucketlistItem(id);
            fetchBucketlist();
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-gray-800">Bucket List ✨</h1>
                    <p className="text-gray-500">Dreams to achieve together</p>
                </div>
                <Button onClick={() => {
                    setEditingItem(null);
                    setModalOpen(true);
                }}>
                    <Plus className="w-5 h-5" />
                    Add Dream
                </Button>
            </div>

            {/* Progress Card */}
            <Card className="p-6 bg-gradient-to-r from-rose-50 to-purple-50">
                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-rose-100"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-rose-500"
                                strokeDasharray={`${stats.progress * 2.26} 226`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-800">{stats.progress}%</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-serif text-xl font-semibold text-gray-800">
                            {stats.completed} of {stats.total} dreams achieved!
                        </h3>
                        <p className="text-gray-500">Keep dreaming and achieving together 💕</p>
                    </div>
                </div>
            </Card>

            {/* Filters */}
            <div className="flex gap-2">
                {[
                    { value: 'all', label: 'All', icon: Star },
                    { value: 'personal', label: 'Personal', icon: User },
                    { value: 'shared', label: 'Shared', icon: Users },
                ].map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === value
                                ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-rose-50'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20">
                    <LoadingSpinner />
                </div>
            ) : filteredItems.length === 0 ? (
                <EmptyState
                    icon="🌟"
                    title="No dreams yet"
                    description="Add your first bucket list item and start dreaming together!"
                    action={
                        <Button onClick={() => setModalOpen(true)}>
                            <Plus className="w-5 h-5" />
                            Add First Dream
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {filteredItems.map(item => (
                        <Card key={item._id} className={`p-4 ${item.isCompleted ? 'bg-green-50' : ''}`}>
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => handleToggleComplete(item._id, item.isCompleted)}
                                    className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${item.isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-rose-300 hover:border-rose-500'
                                        }`}
                                >
                                    {item.isCompleted && <Check className="w-4 h-4" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-semibold text-gray-800 ${item.isCompleted ? 'line-through' : ''}`}>
                                            {item.title}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'shared' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {item.type === 'shared' ? '💕 Shared' : 'Personal'}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                        <span>Added by {item.createdBy.displayName}</span>
                                        {item.targetDate && (
                                            <span>Target: {format(new Date(item.targetDate), 'MMM d, yyyy')}</span>
                                        )}
                                        {item.completedAt && (
                                            <span className="text-green-600">✓ {format(new Date(item.completedAt), 'MMM d, yyyy')}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setModalOpen(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-rose-50 rounded-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            <BucketlistModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                }}
                onSuccess={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                    fetchBucketlist();
                }}
                item={editingItem}
            />
        </div>
    );
}

function BucketlistModal({ isOpen, onClose, onSuccess, item }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: BucketlistItem | null;
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'shared' as 'personal' | 'shared',
        targetDate: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title,
                description: item.description || '',
                type: item.type,
                targetDate: item.targetDate ? format(new Date(item.targetDate), 'yyyy-MM-dd') : '',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                type: 'shared',
                targetDate: '',
            });
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (item) {
                await api.updateBucketlistItem(item._id, formData);
                toast.success('Updated!');
            } else {
                await api.addBucketlistItem(formData);
                toast.success('Dream added! ✨');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Dream' : 'Add to Bucket List ✨'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What's your dream? *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Visit Paris, Learn to cook together..."
                        required
                        className="input-romantic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="More details about this dream..."
                        rows={3}
                        className="input-romantic resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="input-romantic"
                    >
                        <option value="shared">💕 Shared - Do together</option>
                        <option value="personal">Personal - Just for me</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (optional)</label>
                    <input
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        className="input-romantic"
                    />
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} type="button" className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={submitting} className="flex-1">
                        {item ? 'Update' : 'Add Dream'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
