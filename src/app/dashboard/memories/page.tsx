'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, EmptyState, LoadingSpinner } from '@/components/ui';
import { Camera, Upload, X, Play, Trash2, Edit2, Plus, Image, Video } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Memory {
    _id: string;
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    caption: string;
    dateTaken: string;
    uploadedBy: {
        displayName: string;
        avatar?: string;
    };
}

export default function MemoriesPage() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [mediaErrors, setMediaErrors] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchMemories();
    }, []);

    useEffect(() => {
        fetchMemories(1, false);
    }, [filter]);

    const fetchMemories = async (page = 1, append = false) => {
        try {
            setLoading(!append);
            setLoadingMore(append);
            const data: any = await api.getMemories({ page, limit: 20, type: filter === 'all' ? undefined : filter });
            if (append) {
                setMemories(prev => [...prev, ...(data.memories || [])]);
            } else {
                setMemories(data.memories || []);
            }
            if (data.pagination) {
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching memories:', error);
            toast.error('Failed to load memories');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleMediaError = (memoryId: string) => {
        setMediaErrors(prev => new Set(prev).add(memoryId));
    };

    const handleLoadMore = () => {
        if (pagination.page < pagination.pages) {
            fetchMemories(pagination.page + 1, true);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this memory?')) return;

        try {
            await api.deleteMemory(id);
            setMemories(memories.filter(m => m._id !== id));
            setSelectedMemory(null);
            toast.success('Memory deleted');
        } catch (error) {
            toast.error('Failed to delete memory');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Camera className="w-8 h-8 text-rose-500" />
                        Memories
                    </h1>
                    <p className="text-gray-500">Your shared photo album & video gallery</p>
                </div>
                <Button onClick={() => setUploadModalOpen(true)}>
                    <Plus className="w-5 h-5" />
                    Add Memory
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['all', 'image', 'video'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                            ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-rose-50'
                            }`}
                    >
                        {f === 'all' ? 'All' : f === 'image' ? (
                            <span className="flex items-center gap-2"><Image className="w-4 h-4" /> Photos</span>
                        ) : (
                            <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Videos</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Gallery */}
            {loading ? (
                <div className="py-20">
                    <LoadingSpinner />
                </div>
            ) : memories.length === 0 ? (
                <EmptyState
                    icon={<Image className="w-12 h-12 text-gray-400" />}
                    title="No memories yet"
                    description="Start capturing your special moments together!"
                    action={
                        <Button onClick={() => setUploadModalOpen(true)}>
                            <Upload className="w-5 h-5" />
                            Upload First Memory
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {memories.map((memory, index) => (
                        <div
                            key={memory._id}
                            className="polaroid cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => setSelectedMemory(memory)}
                        >
                            {memory.type === 'image' ? (
                                <div className="relative w-full aspect-square bg-gray-100">
                                    {mediaErrors.has(memory._id) ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <Image className="w-8 h-8 mb-2" />
                                            <span className="text-xs">Failed to load</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={memory.url}
                                            alt={memory.caption || 'Memory'}
                                            className="w-full aspect-square object-cover"
                                            loading="lazy"
                                            onError={() => handleMediaError(memory._id)}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="relative w-full aspect-square bg-gray-900 vhs-effect">
                                    {mediaErrors.has(memory._id) ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <Video className="w-8 h-8 mb-2" />
                                            <span className="text-xs">Failed to load</span>
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                src={memory.url}
                                                className="w-full h-full object-cover"
                                                muted
                                                preload="metadata"
                                                onError={() => handleMediaError(memory._id)}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-rose-500 ml-1" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            <p className="mt-3 text-center text-sm text-gray-600 font-handwritten truncate px-2">
                                {memory.caption || format(new Date(memory.dateTaken), 'MMM d, yyyy')}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {!loading && memories.length > 0 && pagination.page < pagination.pages && (
                <div className="flex justify-center py-8">
                    <Button 
                        onClick={handleLoadMore} 
                        loading={loadingMore}
                        variant="secondary"
                    >
                        Load More Memories ({pagination.total - memories.length} remaining)
                    </Button>
                </div>
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onSuccess={() => {
                    setUploadModalOpen(false);
                    fetchMemories();
                }}
            />

            {/* View Modal */}
            {selectedMemory && (
                <ViewMemoryModal
                    memory={selectedMemory}
                    onClose={() => setSelectedMemory(null)}
                    onDelete={() => handleDelete(selectedMemory._id)}
                />
            )}
        </div>
    );
}

function UploadModal({ isOpen, onClose, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [dateTaken, setDateTaken] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreview(url);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caption', caption);
        if (dateTaken) formData.append('dateTaken', dateTaken);

        try {
            await api.uploadMemory(formData);
            toast.success('Memory uploaded! 💕');
            onSuccess();
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setCaption('');
        setDateTaken('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Memory" size="lg">
            <form onSubmit={handleUpload} className="space-y-4">
                {/* File Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${preview ? 'border-rose-400 bg-rose-50' : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {preview ? (
                        <div className="relative">
                            {file?.type.startsWith('video/') ? (
                                <video src={preview} className="max-h-64 mx-auto rounded-lg" controls />
                            ) : (
                                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resetForm();
                                }}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center gap-4 mb-4">
                                <Image className="w-10 h-10 text-rose-300" />
                                <Video className="w-10 h-10 text-purple-300" />
                            </div>
                            <p className="text-gray-600 font-medium">Click to upload a photo or video</p>
                            <p className="text-sm text-gray-400 mt-1">Images will be converted to WebP</p>
                        </>
                    )}
                </div>

                {/* Caption */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="input-romantic"
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                    <input
                        type="date"
                        value={dateTaken}
                        onChange={(e) => setDateTaken(e.target.value)}
                        className="input-romantic"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} type="button" className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={uploading} disabled={!file} className="flex-1">
                        Upload Memory
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function ViewMemoryModal({ memory, onClose, onDelete }: {
    memory: Memory;
    onClose: () => void;
    onDelete: () => void;
}) {
    const [mediaError, setMediaError] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Media */}
                <div className="bg-black rounded-t-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
                    {mediaError ? (
                        <div className="flex flex-col items-center justify-center text-white/60 p-12">
                            {memory.type === 'image' ? <Image className="w-16 h-16 mb-4" /> : <Video className="w-16 h-16 mb-4" />}
                            <p className="text-lg mb-2">Failed to load {memory.type}</p>
                            <p className="text-sm">The file may have been moved or deleted</p>
                        </div>
                    ) : (
                        <>
                            {memory.type === 'image' ? (
                                <img
                                    src={memory.url}
                                    alt={memory.caption || 'Memory'}
                                    className="w-full max-h-[70vh] object-contain"
                                    onError={() => setMediaError(true)}
                                />
                            ) : (
                                <div className="vhs-effect w-full">
                                    <video
                                        src={memory.url}
                                        controls
                                        autoPlay
                                        className="w-full max-h-[70vh]"
                                        onError={() => setMediaError(true)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Info */}
                <div className="bg-white rounded-b-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            {memory.caption && (
                                <p className="text-lg text-gray-800 mb-2">{memory.caption}</p>
                            )}
                            <p className="text-sm text-gray-500">
                                {format(new Date(memory.dateTaken), 'MMMM d, yyyy')} • Uploaded by {memory.uploadedBy.displayName}
                            </p>
                        </div>
                        <button
                            onClick={onDelete}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
