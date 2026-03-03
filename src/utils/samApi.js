// Clean API client — only calls the scraper-backed /api/rfps endpoint
const API = import.meta.env.VITE_API_URL || '';

export const RfpAPI = {
    /**
     * Search scraped RFPs from the database
     */
    async search(query = '', page = 1, filters = {}) {
        const params = new URLSearchParams({
            ...(query && { q: query }),
            page,
            limit: 20,
            ...filters,
        });
        const res = await fetch(`${API}/api/rfps?${params}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Request failed (${res.status})`);
        }
        return res.json(); // { results, total, page, pages }
    },

    /**
     * Get a single RFP by MongoDB _id
     */
    async getById(id) {
        const res = await fetch(`${API}/api/rfps/${id}`);
        if (!res.ok) throw new Error('RFP not found');
        return res.json();
    },

    /**
     * Get aggregate stats
     */
    async getStats() {
        const res = await fetch(`${API}/api/rfps/stats`);
        if (!res.ok) throw new Error('Stats unavailable');
        return res.json();
    },

    /**
     * Trigger a manual scrape run on the backend
     */
    async triggerScrape() {
        const res = await fetch(`${API}/api/scrape`, { method: 'POST' });
        return res.json();
    },
};

export default RfpAPI;
