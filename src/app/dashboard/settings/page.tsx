'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button } from '@/components/ui';
import { User, Heart, Cake, Calendar, Mail, Save, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, partner, refreshUser } = useAuth();

    const [profileData, setProfileData] = useState({
        displayName: '',
        nickname: '',
        birthday: '',
    });

    const [coupleData, setCoupleData] = useState({
        coupleName: '',
        anniversary: '',
        partner1Nickname: '',
        partner2Nickname: '',
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingCouple, setSavingCouple] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                displayName: user.displayName || '',
                nickname: user.nickname || '',
                birthday: user.birthday ? format(new Date(user.birthday), 'yyyy-MM-dd') : '',
            });
        }
        if (user?.coupleId) {
            setCoupleData({
                coupleName: user.coupleId.coupleName || '',
                anniversary: user.coupleId.anniversary ? format(new Date(user.coupleId.anniversary), 'yyyy-MM-dd') : '',
                partner1Nickname: user.coupleId.partner1Nickname || '',
                partner2Nickname: user.coupleId.partner2Nickname || '',
            });
        }
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);

        try {
            await api.updateProfile({
                displayName: profileData.displayName,
                nickname: profileData.nickname || undefined,
                birthday: profileData.birthday || undefined,
            });
            await refreshUser();
            toast.success('Profile updated! 💕');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSaveCouple = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingCouple(true);

        try {
            await api.updateCouple({
                coupleName: coupleData.coupleName || undefined,
                anniversary: coupleData.anniversary || undefined,
                partner1Nickname: coupleData.partner1Nickname || undefined,
                partner2Nickname: coupleData.partner2Nickname || undefined,
            });
            await refreshUser();
            toast.success('Couple settings updated! 💕');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update');
        } finally {
            setSavingCouple(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-gray-800">Settings ⚙️</h1>
                <p className="text-gray-500">Customize your Love Nest</p>
            </div>

            {/* Profile Settings */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl font-semibold text-gray-800">Your Profile</h2>
                        <p className="text-sm text-gray-500">Personal information</p>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600">{user?.email}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={profileData.displayName}
                            onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                            className="input-romantic"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Heart className="w-4 h-4 inline mr-1 text-rose-500" />
                            Nickname
                        </label>
                        <input
                            type="text"
                            value={profileData.nickname}
                            onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                            placeholder="What does your partner call you?"
                            className="input-romantic"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Cake className="w-4 h-4 inline mr-1 text-purple-500" />
                            Birthday
                        </label>
                        <input
                            type="date"
                            value={profileData.birthday}
                            onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                            className="input-romantic"
                        />
                    </div>

                    <Button type="submit" loading={savingProfile}>
                        <Save className="w-4 h-4" />
                        Save Profile
                    </Button>
                </form>
            </Card>

            {/* Couple Settings */}
            {partner && (
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-gray-800">Couple Settings</h2>
                            <p className="text-sm text-gray-500">Settings for you and {partner.displayName}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveCouple} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Couple Name</label>
                            <input
                                type="text"
                                value={coupleData.coupleName}
                                onChange={(e) => setCoupleData({ ...coupleData, coupleName: e.target.value })}
                                placeholder="e.g., The Lovebirds, Team Forever"
                                className="input-romantic"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1 text-rose-500" />
                                Anniversary
                            </label>
                            <input
                                type="date"
                                value={coupleData.anniversary}
                                onChange={(e) => setCoupleData({ ...coupleData, anniversary: e.target.value })}
                                className="input-romantic"
                            />
                            <p className="text-xs text-gray-400 mt-1">This will be added to your calendar with yearly reminders</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your pet name</label>
                                <input
                                    type="text"
                                    value={coupleData.partner1Nickname}
                                    onChange={(e) => setCoupleData({ ...coupleData, partner1Nickname: e.target.value })}
                                    placeholder="Babe, Honey..."
                                    className="input-romantic"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{partner.displayName}'s pet name</label>
                                <input
                                    type="text"
                                    value={coupleData.partner2Nickname}
                                    onChange={(e) => setCoupleData({ ...coupleData, partner2Nickname: e.target.value })}
                                    placeholder="Sweetheart, Love..."
                                    className="input-romantic"
                                />
                            </div>
                        </div>

                        <Button type="submit" loading={savingCouple}>
                            <Save className="w-4 h-4" />
                            Save Couple Settings
                        </Button>
                    </form>
                </Card>
            )}

            {/* Partner Info */}
            {partner && (
                <Card className="p-6 bg-gradient-to-r from-rose-50 to-purple-50">
                    <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">Your Partner 💕</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center text-white text-2xl font-semibold">
                            {partner.displayName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{partner.displayName}</p>
                            {partner.nickname && (
                                <p className="text-sm text-rose-600">"{partner.nickname}"</p>
                            )}
                            <p className="text-sm text-gray-500">{partner.email}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
