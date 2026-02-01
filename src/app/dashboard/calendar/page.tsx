'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, EmptyState, LoadingSpinner } from '@/components/ui';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Bell, Trash2, Edit2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import toast from 'react-hot-toast';

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    isAllDay: boolean;
    eventType: 'date' | 'birthday' | 'anniversary' | 'custom';
}

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [currentMonth]);

    const fetchEvents = async () => {
        try {
            const data: any = await api.getEvents({
                month: currentMonth.getMonth() + 1,
                year: currentMonth.getFullYear(),
            });
            setEvents(data.events || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const getEventsForDay = (date: Date) => {
        return events.filter(event => isSameDay(new Date(event.date), date));
    };

    const eventTypeColors: Record<string, string> = {
        date: 'bg-rose-500',
        birthday: 'bg-purple-500',
        anniversary: 'bg-pink-500',
        custom: 'bg-violet-500',
    };

    const eventTypeEmojis: Record<string, string> = {
        date: '❤️',
        birthday: '🎂',
        anniversary: '💕',
        custom: '⭐',
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Delete this event?')) return;

        try {
            await api.deleteEvent(id);
            setEvents(events.filter(e => e._id !== id));
            toast.success('Event deleted');
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-gray-800">Calendar 📅</h1>
                    <p className="text-gray-500">Plan your dates and special moments</p>
                </div>
                <Button onClick={() => {
                    setEditingEvent(null);
                    setEventModalOpen(true);
                }}>
                    <Plus className="w-5 h-5" />
                    Add Event
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="lg:col-span-2 p-6">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h2 className="font-serif text-xl font-semibold text-gray-800">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before the 1st */}
                        {Array.from({ length: days[0].getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {days.map(day => {
                            const dayEvents = getEventsForDay(day);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`aspect-square p-1 rounded-lg transition-all relative ${isToday(day)
                                            ? 'bg-gradient-to-br from-rose-500 to-purple-500 text-white'
                                            : isSelected
                                                ? 'bg-rose-100 text-rose-600'
                                                : 'hover:bg-rose-50'
                                        }`}
                                >
                                    <span className={`text-sm ${isToday(day) ? 'font-bold' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            {dayEvents.slice(0, 3).map((event, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ${eventTypeColors[event.eventType] || 'bg-rose-500'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-rose-100">
                        {Object.entries(eventTypeEmojis).map(([type, emoji]) => (
                            <div key={type} className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{emoji}</span>
                                <span className="capitalize">{type}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Selected Day Events */}
                <Card className="p-6">
                    <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">
                        {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a day'}
                    </h3>

                    {selectedDate ? (
                        <>
                            {getEventsForDay(selectedDate).length > 0 ? (
                                <div className="space-y-3">
                                    {getEventsForDay(selectedDate).map(event => (
                                        <div
                                            key={event._id}
                                            className="p-4 bg-rose-50 rounded-xl"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span>{eventTypeEmojis[event.eventType]}</span>
                                                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingEvent(event);
                                                            setEventModalOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-rose-100 rounded-lg"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event._id)}
                                                        className="p-1.5 hover:bg-rose-100 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                            {event.time && (
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {event.time}
                                                </p>
                                            )}
                                            {event.location && (
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {event.location}
                                                </p>
                                            )}
                                            {event.description && (
                                                <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">No events on this day</p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingEvent(null);
                                            setEventModalOpen(true);
                                        }}
                                    >
                                        Add Event
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            Click on a day to view events
                        </p>
                    )}
                </Card>
            </div>

            {/* Event Modal */}
            <EventModal
                isOpen={eventModalOpen}
                onClose={() => {
                    setEventModalOpen(false);
                    setEditingEvent(null);
                }}
                onSuccess={() => {
                    setEventModalOpen(false);
                    setEditingEvent(null);
                    fetchEvents();
                }}
                event={editingEvent}
                defaultDate={selectedDate}
            />
        </div>
    );
}

function EventModal({ isOpen, onClose, onSuccess, event, defaultDate }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    event: Event | null;
    defaultDate: Date | null;
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        isAllDay: false,
        eventType: 'date' as 'date' | 'birthday' | 'anniversary' | 'custom',
        isRecurring: false,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description || '',
                date: format(new Date(event.date), 'yyyy-MM-dd'),
                time: event.time || '',
                location: event.location || '',
                isAllDay: event.isAllDay,
                eventType: event.eventType,
                isRecurring: false,
            });
        } else if (defaultDate) {
            setFormData(prev => ({
                ...prev,
                date: format(defaultDate, 'yyyy-MM-dd'),
            }));
        }
    }, [event, defaultDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (event) {
                await api.updateEvent(event._id, formData);
                toast.success('Event updated!');
            } else {
                await api.createEvent(formData);
                toast.success('Event created! 💕');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save event');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Edit Event' : 'Add Event 📅'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Date night, Birthday..."
                        required
                        className="input-romantic"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="input-romantic"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="input-romantic"
                            disabled={formData.isAllDay}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                        className="input-romantic"
                    >
                        <option value="date">❤️ Date</option>
                        <option value="birthday">🎂 Birthday</option>
                        <option value="anniversary">💕 Anniversary</option>
                        <option value="custom">⭐ Custom</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Restaurant, Park..."
                        className="input-romantic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add details..."
                        rows={3}
                        className="input-romantic resize-none"
                    />
                </div>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.isAllDay}
                        onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                        className="rounded border-rose-300 text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-sm text-gray-700">All day event</span>
                </label>

                <div className="bg-rose-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-500" />
                        You'll receive reminders 1 week, 3 days, 2 days, 1 day before, and on the day.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} type="button" className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={submitting} className="flex-1">
                        {event ? 'Update' : 'Create Event'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
