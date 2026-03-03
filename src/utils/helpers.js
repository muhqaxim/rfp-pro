import { KEYWORDS } from '../data/keywords';

export function findMatches(text) {
    const lower = text.toLowerCase();
    return KEYWORDS.filter(k => lower.includes(k.toLowerCase())).slice(0, 5);
}

export function deadlineInfo(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    if (isNaN(d.getTime())) return null;
    const diff = Math.ceil((d - now) / 86400000);
    const fmt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (diff < 0) return { cls: 'badge-closed', label: 'Closed', days: diff };
    if (diff <= 7) return { cls: 'badge-urgent', label: `${diff}d left`, days: diff, urgent: true };
    if (diff <= 21) return { cls: 'badge-soon', label: fmt, days: diff, soon: true };
    return { cls: 'badge-ok', label: fmt, days: diff };
}

export function fmtDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function copyToClipboard(url) {
    return navigator.clipboard.writeText(url);
}
