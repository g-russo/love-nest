'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage, Button, Modal } from '@/components/ui';
import {
    Heart,
    Camera,
    Calendar,
    Gift,
    ListChecks,
    BookHeart,
    Settings,
    LogOut,
    Menu,
    X,
    Mail,
    UserPlus,
    Gamepad2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const navItems = [
    { href: '/dashboard', icon: Heart, label: 'Home' },
    { href: '/dashboard/memories', icon: Camera, label: 'Memories' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/dashboard/wishlist', icon: Gift, label: 'Wishlist' },
    { href: '/dashboard/bucketlist', icon: ListChecks, label: 'Bucket List' },
    { href: '/dashboard/journal', icon: BookHeart, label: 'Journal' },
    { href: '/dashboard/games', icon: Gamepad2, label: 'Games' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, partner, loading, logout, refreshUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingInvite(true);
        setInviteLink('');

        try {
            const response: any = await api.sendInvite(inviteEmail);

            if (response.emailSent) {
                toast.success('Invitation sent!');
                setInviteModalOpen(false);
                setInviteEmail('');
            } else {
                // Email failed but we have the link
                setInviteLink(response.inviteUrl);
                toast.success('Invite link created! Share it with your partner');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send invitation');
        } finally {
            setSendingInvite(false);
        }
    };

    const copyInviteLink = () => {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(inviteLink).then(() => {
                toast.success('Link copied! 📋');
            }).catch(() => {
                fallbackCopy();
            });
        } else {
            fallbackCopy();
        }
    };

    const fallbackCopy = () => {
        // Fallback for HTTP or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = inviteLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            toast.success('Link copied! 📋');
        } catch {
            toast.error('Please copy the link manually');
        }

        document.body.removeChild(textArea);
    };

    if (loading || !user) {
        return <LoadingPage />;
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-rose-100 fixed h-full">
                {/* Logo */}
                <div className="p-6 border-b border-rose-100">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                        <span className="font-serif text-xl font-bold text-gradient">Love Nest</span>
                    </Link>
                </div>

                {/* Partner Status */}
                <div className="p-4 border-b border-rose-100">
                    {partner ? (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                {partner.displayName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                    {partner.nickname || partner.displayName}
                                </p>
                                <p className="text-xs text-rose-500 flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> Your Partner
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setInviteModalOpen(true)}
                            className="w-full p-3 bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl text-left hover:from-rose-100 hover:to-purple-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-8 h-8 text-rose-400" />
                                <div>
                                    <p className="font-medium text-gray-800">Invite Partner</p>
                                    <p className="text-xs text-rose-500 text-left">Send a love invite</p>
                                </div>
                            </div>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Settings */}
                <div className="p-4 border-t border-rose-100 space-y-2">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-rose-100 z-40">
                <div className="flex items-center justify-between p-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                        <span className="font-serif text-lg font-bold text-gradient">Love Nest</span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-gray-600"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <nav className="p-4 border-t border-rose-100 bg-white">
                        <div className="space-y-1 mb-4">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                                            : 'text-gray-600 hover:bg-rose-50'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        {!partner && (
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setInviteModalOpen(true);
                                }}
                                className="w-full btn-primary mb-2"
                            >
                                Invite Partner
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-rose-600"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </nav>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Invite Modal */}
            <Modal
                isOpen={inviteModalOpen}
                onClose={() => {
                    setInviteModalOpen(false);
                    setInviteLink('');
                    setInviteEmail('');
                }}
                title="Invite Your Partner"
            >
                {inviteLink ? (
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Share this link with your partner to invite them to your Love Nest:
                        </p>
                        <div className="p-3 bg-rose-50 rounded-xl break-all text-sm text-gray-700 font-mono">
                            {inviteLink}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setInviteModalOpen(false);
                                    setInviteLink('');
                                    setInviteEmail('');
                                }}
                                className="flex-1"
                            >
                                Close
                            </Button>
                            <Button onClick={copyInviteLink} className="flex-1">
                                Copy Link 📋
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSendInvite} className="space-y-4">
                        <p className="text-gray-600">
                            Send a romantic invitation to your special someone. They'll receive a link to join your Love Nest.
                        </p>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                            <input
                                type="email"
                                placeholder="Partner's email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                                className="input-romantic pl-12"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setInviteModalOpen(false)}
                                type="button"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={sendingInvite} className="flex-1">
                                Send Invite
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
