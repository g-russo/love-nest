'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Modal, EmptyState, LoadingSpinner } from '@/components/ui';
import { Gift, Plus, ExternalLink, Trash2, Edit2, Check, Heart } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface WishlistItem {
    _id: string;
    title: string;
    description?: string;
    link?: string;
    imageUrl?: string;
    priority: 'low' | 'medium' | 'high';
    isFulfilled: boolean;
    fulfilledBy?: string;
    userId: {
        _id: string;
        displayName: string;
    };
}

export default function WishlistPage() {
    const { user, partner } = useAuth();
    const [myItems, setMyItems] = useState<WishlistItem[]>([]);
    const [partnerItems, setPartnerItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
    const [activeTab, setActiveTab] = useState<'mine' | 'partner'>('mine');

    useEffect(() => {
        fetchWishlists();
    }, []);

    const fetchWishlists = async () => {
        try {
            const [myData, partnerData]: any[] = await Promise.all([
                api.getMyWishlist(),
                partner ? api.getPartnerWishlist() : Promise.resolve({ items: [] }),
            ]);
            setMyItems(myData.items || []);
            setPartnerItems(partnerData.items || []);
        } catch (error) {
            console.error('Error fetching wishlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this item from your wishlist?')) return;

        try {
            await api.deleteWishlistItem(id);
            setMyItems(myItems.filter(item => item._id !== id));
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleFulfill = async (id: string) => {
        try {
            await api.fulfillWishlistItem(id);
            setPartnerItems(partnerItems.map(item =>
                item._id === id ? { ...item, isFulfilled: true, fulfilledBy: user?._id } : item
            ));
            toast.success('Marked as fulfilled! 🎁');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-600',
        medium: 'bg-yellow-100 text-yellow-700',
        high: 'bg-rose-100 text-rose-600',
    };

    const renderItems = (items: WishlistItem[], isOwn: boolean) => (
        <div className="grid md:grid-cols-2 gap-4">
            {items.map(item => (
                <Card key={item._id} className={`p-4 ${item.isFulfilled ? 'opacity-60' : ''}`}>
                    <div className="flex gap-4">
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-20 h-20 object-cover rounded-xl"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className={`font-semibold text-gray-800 ${item.isFulfilled ? 'line-through' : ''}`}>
                                    {item.title}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[item.priority]}`}>
                                    {item.priority}
                                </span>
                            </div>
                            {item.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            )}
                            {item.link && (
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-2"
                                >
                                    <ExternalLink className="w-3 h-3" /> View Link
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-rose-100">
                        {isOwn ? (
                            <>
                                <button
                                    onClick={() => {
                                        setEditingItem(item);
                                        setModalOpen(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-gray-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                            </>
                        ) : !item.isFulfilled ? (
                            <Button onClick={() => handleFulfill(item._id)} className="w-full" size="sm">
                                <Gift className="w-4 h-4" /> I'll get this!
                            </Button>
                        ) : (
                            <div className="w-full text-center py-2 text-green-600 flex items-center justify-center gap-1">
                                <Check className="w-4 h-4" /> Fulfilled
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-gray-800">Wishlist 🎁</h1>
                    <p className="text-gray-500">Share what would make you happy</p>
                </div>
                <Button onClick={() => {
                    setEditingItem(null);
                    setModalOpen(true);
                }}>
                    <Plus className="w-5 h-5" />
                    Add Wish
                </Button>
            </div>

            {/* Tabs */}
            {partner && (
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'mine'
                                ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-rose-50'
                            }`}
                    >
                        My Wishlist
                    </button>
                    <button
                        onClick={() => setActiveTab('partner')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'partner'
                                ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-rose-50'
                            }`}
                    >
                        {partner.nickname || partner.displayName}'s Wishlist
                    </button>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="py-20">
                    <LoadingSpinner />
                </div>
            ) : activeTab === 'mine' ? (
                myItems.length > 0 ? (
                    renderItems(myItems, true)
                ) : (
                    <EmptyState
                        icon="🎁"
                        title="Your wishlist is empty"
                        description="Add items you'd love to receive!"
                        action={
                            <Button onClick={() => setModalOpen(true)}>
                                <Plus className="w-5 h-5" />
                                Add First Wish
                            </Button>
                        }
                    />
                )
            ) : partnerItems.length > 0 ? (
                renderItems(partnerItems, false)
            ) : (
                <EmptyState
                    icon="💝"
                    title={`${partner?.displayName}'s wishlist is empty`}
                    description="Check back later for gift ideas!"
                />
            )}

            {/* Modal */}
            <WishlistModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                }}
                onSuccess={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                    fetchWishlists();
                }}
                item={editingItem}
            />
        </div>
    );
}

function WishlistModal({ isOpen, onClose, onSuccess, item }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: WishlistItem | null;
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        imageUrl: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title,
                description: item.description || '',
                link: item.link || '',
                imageUrl: item.imageUrl || '',
                priority: item.priority,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                link: '',
                imageUrl: '',
                priority: 'medium',
            });
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (item) {
                await api.updateWishlistItem(item._id, formData);
                toast.success('Item updated!');
            } else {
                await api.addWishlistItem(formData);
                toast.success('Added to wishlist! 🎁');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Wish' : 'Add to Wishlist 🎁'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What do you want? *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="A cozy blanket, cute earrings..."
                        required
                        className="input-romantic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Size, color preferences..."
                        rows={2}
                        className="input-romantic resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                        type="url"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="https://..."
                        className="input-romantic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="input-romantic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="input-romantic"
                    >
                        <option value="low">Low - Nice to have</option>
                        <option value="medium">Medium - Would love it</option>
                        <option value="high">High - Really want this!</option>
                    </select>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} type="button" className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={submitting} className="flex-1">
                        {item ? 'Update' : 'Add to Wishlist'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
