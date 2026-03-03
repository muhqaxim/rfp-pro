import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import RfpAPI from '../utils/samApi';
import RfpCard from '../components/RfpCard';
import { KEYWORDS } from '../data/keywords';

const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'EDU', label: '🎓 Student Services' },
    { value: 'CC', label: '📞 Call Center' },
    { value: 'ITES', label: '💻 IT Services' },
    { value: 'AI', label: '🤖 AI / Automation' },
    { value: 'SW', label: '🖥 Software / SaaS' },
    { value: 'MRB', label: '📋 Consulting' },
    { value: 'BANKING', label: '💰 Finance / Billing' },
    { value: 'STAFF', label: '👥 Staffing' },
];

const STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
    'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
    'VA', 'WA', 'WV', 'WI', 'WY',
];

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [scrapeMsg, setScrapeMsg] = useState('');
    const [selectedKws, setSelectedKws] = useState([]);

    const [sortBy, setSortBy] = useState('postedDate');
    const [type, setType] = useState('');
    const [categoryCode, setCategoryCode] = useState('');
    const [state, setState] = useState('');
    const [deadlineWithin, setDeadlineWithin] = useState('');

    const doSearch = useCallback(async (pg = 1) => {
        setLoading(true);
        setError('');
        const q = selectedKws.length > 0 ? selectedKws.join(' OR ') : query;
        try {
            const data = await RfpAPI.search(q, pg, {
                sort: sortBy,
                ...(type && { type }),
                ...(categoryCode && { categoryCode }),
                ...(state && { state }),
                ...(deadlineWithin && { deadlineWithin }),
            });
            setResults(data.results || []);
            setTotal(data.total || 0);
            setTotalPages(data.pages || 1);
            setPage(pg);
        } catch (e) {
            setError(e.message);
            setResults([]);
        }
        setLoading(false);
    }, [query, selectedKws, sortBy, type, categoryCode, state, deadlineWithin]);

    useEffect(() => { doSearch(1); }, []);

    function toggleKw(kw) {
        setSelectedKws(prev => prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]);
    }

    async function handleScrapeNow() {
        setScrapeMsg('🔄 Scraping started — this may take a few minutes…');
        try {
            const data = await RfpAPI.triggerScrape();
            setScrapeMsg(data.message || '✅ Scrape started!');
        } catch {
            setScrapeMsg('⚠ Could not trigger scrape. Is the server running?');
        }
        setTimeout(() => setScrapeMsg(''), 8000);
    }

    const isDbError = error?.includes('DB_NOT_CONNECTED') || error?.includes('Database not connected') || error?.includes('503');

    return (
        <div className="page-layout">
            {/* ──── SIDEBAR ──── */}
            <aside className="sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-title">// Filters</div>
                    <div className="filter-group">
                        <div className="filter-label">Sort By</div>
                        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="postedDate">Most Recent</option>
                            <option value="deadline">Deadline Soon</option>
                            <option value="relevance">Relevance</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <div className="filter-label">Category</div>
                        <select className="filter-select" value={categoryCode} onChange={e => setCategoryCode(e.target.value)}>
                            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <div className="filter-label">Opportunity Type</div>
                        <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="RFP">RFP</option>
                            <option value="RFQ">RFQ</option>
                            <option value="RFI">RFI</option>
                            <option value="IFB">IFB</option>
                            <option value="Sources Sought">Sources Sought</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <div className="filter-label">State</div>
                        <select className="filter-select" value={state} onChange={e => setState(e.target.value)}>
                            <option value="">All States</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <div className="filter-label">Deadline Within</div>
                        <select className="filter-select" value={deadlineWithin} onChange={e => setDeadlineWithin(e.target.value)}>
                            <option value="">Any</option>
                            <option value="7">7 days</option>
                            <option value="14">14 days</option>
                            <option value="30">30 days</option>
                            <option value="60">60 days</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => doSearch(1)}>
                        Apply Filters
                    </button>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={() => {
                        setSortBy('postedDate'); setType(''); setCategoryCode(''); setState(''); setDeadlineWithin(''); setSelectedKws([]);
                    }}>
                        Reset
                    </button>
                </div>

                {/* Quick Keywords */}
                <div className="sidebar-section">
                    <div className="sidebar-title">// Keywords</div>
                    <div className="kw-list">
                        {KEYWORDS.map(kw => (
                            <label key={kw} className={`kw-item ${selectedKws.includes(kw) ? 'active' : ''}`}>
                                <input type="checkbox" checked={selectedKws.includes(kw)} onChange={() => toggleKw(kw)} />
                                {kw}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Refresh scraper */}
                <div className="sidebar-section">
                    <div className="sidebar-title">// Data</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '10px' }}>
                        15 university portals scraped daily
                    </div>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }} onClick={handleScrapeNow}>
                        🔄 Refresh Now
                    </button>
                    {scrapeMsg && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                            {scrapeMsg}
                        </div>
                    )}
                </div>
            </aside>

            {/* ──── MAIN ──── */}
            <main className="main-content">
                {/* Search bar */}
                <form className="search-bar" onSubmit={e => { e.preventDefault(); doSearch(1); }}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by keyword, agency, or title…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>

                {/* DB not connected state — actionable message */}
                {isDbError && (
                    <div className="db-error-bar">
                        <div>
                            <strong>⚠ Database not connected</strong>
                            <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.85 }}>
                                Set <code>MONGODB_URI</code> in <code>server/.env</code>, restart the server, then trigger the first scrape.
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={handleScrapeNow}>🔄 Try Scrape</button>
                    </div>
                )}

                {/* Generic error */}
                {error && !isDbError && (
                    <div className="db-error-bar" style={{ background: 'rgba(192,57,43,0.06)', borderColor: 'rgba(192,57,43,0.25)', color: 'var(--red)' }}>
                        {error}
                    </div>
                )}

                {/* Results header */}
                {!error && (
                    <div className="results-header">
                        <div className="results-count">
                            {loading ? 'Searching…' : <><strong>{total.toLocaleString()}</strong> result{total !== 1 ? 's' : ''}</>}
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="loading"><div className="spinner" />Searching procurement database…</div>
                ) : !error && results.length === 0 ? (
                    <div className="empty">
                        <div className="empty-icon">📭</div>
                        <h3>No results found</h3>
                        <p>Try different keywords or remove filters. If the database is empty, run a scrape first.</p>
                        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleScrapeNow}>
                            🔄 Run First Scrape
                        </button>
                    </div>
                ) : (
                    results.map((rfp, i) => <RfpCard key={rfp._id || i} rfp={rfp} />)
                )}

                {/* Pagination */}
                {totalPages > 1 && !error && (
                    <div className="pagination">
                        {page > 1 && <button className="page-btn" onClick={() => doSearch(page - 1)}>← Prev</button>}
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const p = i + 1;
                            return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => doSearch(p)}>{p}</button>;
                        })}
                        {page < totalPages && <button className="page-btn" onClick={() => doSearch(page + 1)}>Next →</button>}
                    </div>
                )}
            </main>
        </div>
    );
}
