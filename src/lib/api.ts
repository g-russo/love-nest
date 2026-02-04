const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Token storage helper
const TOKEN_KEY = 'lovenest_token';

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
};

interface RequestOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        // Add token to headers if available
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            credentials: 'include', // Include cookies for auth
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        // Store token if returned
        if (data.token) {
            setToken(data.token);
        }

        return data;
    }

    // File upload method
    async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
        return this.uploadFileWithMethod(endpoint, 'POST', formData);
    }

    async uploadFileWithMethod<T>(endpoint: string, method: string, formData: FormData): Promise<T> {
        const headers: Record<string, string> = {};
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: method,
            body: formData,
            credentials: 'include',
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        return data;
    }

    // Auth
    async register(data: { email: string; password: string; displayName: string; nickname?: string; birthday?: string }) {
        return this.request('/auth/register', { method: 'POST', body: data });
    }

    async login(data: { email: string; password: string }) {
        return this.request('/auth/login', { method: 'POST', body: data });
    }

    async logout() {
        const result = this.request('/auth/logout', { method: 'POST' });
        removeToken();
        return result;
    }

    async getMe() {
        return this.request('/auth/me');
    }

    async updateProfile(data: { displayName?: string; nickname?: string; birthday?: string; avatar?: string }) {
        return this.request('/auth/update', { method: 'PUT', body: data });
    }

    async sendInvite(email: string) {
        return this.request('/auth/invite', { method: 'POST', body: { email } });
    }

    async validateInvite(token: string) {
        return this.request(`/auth/invite/${token}`);
    }

    async acceptInvite(token: string, data: { email: string; password: string; displayName: string; nickname?: string; birthday?: string }) {
        return this.request(`/auth/accept-invite/${token}`, { method: 'POST', body: data });
    }

    async updateCouple(data: { coupleName?: string; anniversary?: string; partner1Nickname?: string; partner2Nickname?: string }) {
        return this.request('/auth/couple', { method: 'PUT', body: data });
    }

    // Memories
    async getMemories(params?: { page?: number; limit?: number; type?: string }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/memories${query ? `?${query}` : ''}`);
    }

    async getMemory(id: string) {
        return this.request(`/memories/${id}`);
    }

    async uploadMemory(formData: FormData) {
        return this.uploadFile('/memories', formData);
    }

    async updateMemory(id: string, data: { caption?: string; dateTaken?: string; tags?: string[] }) {
        return this.request(`/memories/${id}`, { method: 'PUT', body: data });
    }

    async deleteMemory(id: string) {
        return this.request(`/memories/${id}`, { method: 'DELETE' });
    }

    // Events
    async getEvents(params?: { month?: number; year?: number; eventType?: string }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/events${query ? `?${query}` : ''}`);
    }

    async getUpcomingEvents(limit = 5) {
        return this.request(`/events/upcoming?limit=${limit}`);
    }

    async getEvent(id: string) {
        return this.request(`/events/${id}`);
    }

    async createEvent(data: any) {
        return this.request('/events', { method: 'POST', body: data });
    }

    async updateEvent(id: string, data: any) {
        return this.request(`/events/${id}`, { method: 'PUT', body: data });
    }

    async deleteEvent(id: string) {
        return this.request(`/events/${id}`, { method: 'DELETE' });
    }

    // Wishlist
    async getWishlists() {
        return this.request('/wishlist');
    }

    async getMyWishlist() {
        return this.request('/wishlist/mine');
    }

    async getPartnerWishlist() {
        return this.request('/wishlist/partner');
    }

    async addWishlistItem(data: FormData | { title: string; description?: string; link?: string; imageUrl?: string; priority?: string }) {
        if (data instanceof FormData) {
            return this.uploadFile('/wishlist', data);
        }
        return this.request('/wishlist', { method: 'POST', body: data });
    }

    async updateWishlistItem(id: string, data: FormData | any) {
        if (data instanceof FormData) {
            // Note: PUT with generic uploadFile logic (which uses POST) needs valid method
            // Standard fetch doesn't support multipart on PUT easily universally but standard browsers do
            // Our uploadFile helper forces POST. We might need a separate helper or manual fetch here.
            // Let's create a custom PUT upload request here or modify uploadFile.
            return this.uploadFileWithMethod(`/wishlist/${id}`, 'PUT', data);
        }
        return this.request(`/wishlist/${id}`, { method: 'PUT', body: data });
    }

    async deleteWishlistItem(id: string) {
        return this.request(`/wishlist/${id}`, { method: 'DELETE' });
    }

    async fulfillWishlistItem(id: string) {
        return this.request(`/wishlist/${id}/fulfill`, { method: 'POST' });
    }

    async unfulfillWishlistItem(id: string) {
        return this.request(`/wishlist/${id}/unfulfill`, { method: 'POST' });
    }

    // Bucketlist
    async getBucketlist() {
        return this.request('/bucketlist');
    }

    async getPersonalBucketlist() {
        return this.request('/bucketlist/personal');
    }

    async getSharedBucketlist() {
        return this.request('/bucketlist/shared');
    }

    async addBucketlistItem(data: { title: string; description?: string; type: 'personal' | 'shared'; targetDate?: string }) {
        return this.request('/bucketlist', { method: 'POST', body: data });
    }

    async updateBucketlistItem(id: string, data: any) {
        return this.request(`/bucketlist/${id}`, { method: 'PUT', body: data });
    }

    async deleteBucketlistItem(id: string) {
        return this.request(`/bucketlist/${id}`, { method: 'DELETE' });
    }

    async completeBucketlistItem(id: string) {
        return this.request(`/bucketlist/${id}/complete`, { method: 'POST' });
    }

    async uncompleteBucketlistItem(id: string) {
        return this.request(`/bucketlist/${id}/uncomplete`, { method: 'POST' });
    }

    // Journal
    async getJournalEntries(params?: { page?: number; limit?: number; author?: string }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/journal${query ? `?${query}` : ''}`);
    }

    async getJournalEntry(id: string) {
        return this.request(`/journal/${id}`);
    }

    async createJournalEntry(data: { title: string; content: string; mood?: string; date?: string; attachments?: string[] }) {
        return this.request('/journal', { method: 'POST', body: data });
    }

    async updateJournalEntry(id: string, data: any) {
        return this.request(`/journal/${id}`, { method: 'PUT', body: data });
    }

    async deleteJournalEntry(id: string) {
        return this.request(`/journal/${id}`, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_URL);
export const clearAuthToken = removeToken;
export default api;
