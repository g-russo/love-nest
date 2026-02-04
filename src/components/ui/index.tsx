'use client';

import { ReactNode, useState, useEffect } from 'react';

interface FloatingHeartsProps {
    count?: number;
}

const heartEmojis = ['💕', '💗', '💖', '💘', '💝', '❤️', '🩷', '💜', '🤍', '💓'];

export function FloatingHearts({ count = 25 }: FloatingHeartsProps) {
    const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number; size: number; emoji: string; duration: number }>>([]);

    useEffect(() => {
        // Generate random values only on client to avoid hydration mismatch
        const generatedHearts = Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 20,
            size: 0.8 + Math.random() * 2.2, // Sizes from 0.8rem to 3rem
            emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
            duration: 12 + Math.random() * 10, // Duration from 12s to 22s
        }));
        setHearts(generatedHearts);
    }, [count]);

    if (hearts.length === 0) return null;

    return (
        <div className="floating-hearts">
            {hearts.map((heart) => (
                <span
                    key={heart.id}
                    className="heart"
                    style={{
                        left: `${heart.left}%`,
                        animationDelay: `${heart.delay}s`,
                        fontSize: `${heart.size}rem`,
                        animationDuration: `${heart.duration}s`,
                    }}
                >
                    {heart.emoji}
                </span>
            ))}
        </div>
    );
}


interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', hover = true, onClick }: CardProps) {
    return (
        <div
            className={`card p-6 ${hover ? 'hover:shadow-lg' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit';
    className?: string;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
}: ButtonProps) {
    const baseStyles = 'font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5',
        secondary: 'bg-white text-rose-600 border-2 border-rose-200 hover:border-rose-400 shadow-md hover:shadow-lg',
        ghost: 'bg-transparent text-rose-600 hover:bg-rose-50',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading && <span className="spinner w-4 h-4" />}
            {children}
        </button>
    );
}

interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    name?: string;
    className?: string;
}

export function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required,
    name,
    className = '',
}: InputProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`input-romantic ${error ? 'border-red-400' : ''}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

interface TextareaProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    required?: boolean;
    name?: string;
    className?: string;
}

export function Textarea({
    label,
    placeholder,
    value,
    onChange,
    rows = 4,
    required,
    name,
    className = '',
}: TextareaProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                required={required}
                className="input-romantic resize-none"
            />
        </div>
    );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-auto`}>
                {title && (
                    <div className="px-6 py-4 border-b border-rose-100">
                        <h2 className="text-xl font-serif font-semibold text-gray-800">{title}</h2>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`spinner ${sizes[size]}`} />
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-4">💕</div>
                <LoadingSpinner />
                <p className="mt-4 text-rose-600 font-medium">Loading...</p>
            </div>
        </div>
    );
}

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4 flex items-center justify-center">
                {typeof icon === 'string' ? icon : <div className="text-rose-400">{icon}</div>}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
            {description && <p className="text-gray-500 mb-6 max-w-md">{description}</p>}
            {action}
        </div>
    );
}
