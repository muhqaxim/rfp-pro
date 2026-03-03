export const Storage = {
    get(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    set(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
    },
    remove(key) { localStorage.removeItem(key); }
};

export const Saved = {
    getAll() { return Storage.get('saved_rfps') || []; },
    save(rfp) {
        const saved = this.getAll();
        if (!saved.find(r => r.id === rfp.id)) {
            saved.unshift({ ...rfp, savedAt: new Date().toISOString() });
            Storage.set('saved_rfps', saved);
            return true;
        }
        return false;
    },
    remove(id) {
        const saved = this.getAll().filter(r => r.id !== id);
        Storage.set('saved_rfps', saved);
    },
    isSaved(id) { return this.getAll().some(r => r.id === id); },
    count() { return this.getAll().length; }
};
