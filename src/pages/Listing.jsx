import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import RfpCard from '../components/RfpCard';
import RfpAPI from '../utils/samApi';
import { KEYWORDS } from '../data/keywords';

const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'EDU', label: 'Student Services' },
    { value: 'CC', label: 'Call Center' },
    { value: 'ITES', label: 'IT Services' },
    { value: 'AI', label: 'AI / Automation' },
    { value: 'SW', label: 'Software / SaaS' },
    { value: 'MRB', label: 'Consulting' },
    { value: 'BANKING', label: 'Finance / Billing' },
    { value: 'STAFF', label: 'Staffing' },
];
const TYPES = ['RFP', 'RFQ', 'RFI', 'IFB', 'Sources Sought'];
const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const STATUS_COLORS = {
    running: '#f0a500',
    done: '#1a6b3a',
    error: '#c0392b',
    empty: '#7a7568',
};
const STATUS_ICON = { running: '⟳', done: '✓', error: '✗', empty: '—' };

export default function Listing() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dbError, setDbError] = useState('');

    // Filters
    const [sort, setSort] = useState('scrapedAt');
    const [type, setType] = useState('');
    const [category, setCategory] = useState('');
    const [state, setState] = useState('');
    const [deadline, setDeadline] = useState('');
    const [selectedKws, setSelectedKws] = useState([]);

    // Scrape state
    const [scraping, setScraping] = useState(false);
    const [scrapeProgress, setScrapeProgress] = useState([]);
    const [scrapeFinished, setScrapeFinished] = useState(false);
    const pollRef = useRef(null);

    // ─── Fetch results ───────────────────────────
    const fetchResults = useCallback(async (pg = 1) => {
        setLoading(true);
        setDbError('');
        const q = selectedKws.length ? selectedKws.join(' ') : query;
        try {
            const data = await RfpAPI.search(q, pg, {
                sort,
                ...(type && { type }),
                ...(category && { categoryCode: category }),
                ...(state && { state }),
                ...(deadline && { deadlineWithin: deadline }),
            });
            setResults(data.results || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setPage(pg);
        } catch (e) {
            setDbError(e.message);
            setResults([]);
        }
        setLoading(false);
    }, [query, selectedKws, sort, type, category, state, deadline]);

    // Poll scrape status
    const pollStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/scrape/status');
            const data = await res.json();
            setScrapeProgress(data.progress || []);
            if (!data.running) {
                setScraping(false);
                setScrapeFinished(true);
                clearInterval(pollRef.current);
                // Refresh results
                setTimeout(() => fetchResults(1), 800);
            }
        } catch { }
    }, [fetchResults]);

    useEffect(() => { fetchResults(1); }, []);

    useEffect(() => {
        return () => clearInterval(pollRef.current);
    }, []);

    // ─── Trigger scrape ──────────────────────────
    async function triggerScrape() {
        setScraping(true);
        setScrapeFinished(false);
        setScrapeProgress([]);
        try {
            const res = await fetch('/api/scrape', { method: 'POST' });
            const data = await res.json();
            if (data.error) { setScraping(false); setDbError(data.error); return; }
        } catch (e) { setScraping(false); return; }
        pollRef.current = setInterval(pollStatus, 1500);
    }

    function toggleKw(kw) {
        setSelectedKws(p => p.includes(kw) ? p.filter(k => k !== kw) : [...p, kw]);
    }

    function resetFilters() {
        setSort('scrapedAt'); setType(''); setCategory(''); setState(''); setDeadline(''); setSelectedKws([]);
    }

    const isDbNotConnected = dbError?.includes('not connected') || dbError?.includes('503');

    return (
        <div className="page-layout">
            {/* ═══ SIDEBAR ═══ */}
            <aside className="sidebar">
                {/* Scrape Panel */}
                <div className="sidebar-section scrape-panel">
                    <div className="sidebar-title">// Scraper</div>
                    <button
                        className={`btn btn-primary scrape-btn ${scraping ? 'scraping' : ''}`}
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={triggerScrape}
                        disabled={scraping}
                    >
                        {scraping ? (
                            <><span className="spin-icon">⟳</span> Scraping…</>
                        ) : (
                            '🔄 Scrape All Sources'
                        )}
                    </button>

                    {/* Progress */}
                    {scrapeProgress.length > 0 && (
                        <div className="scrape-progress" style={{ marginTop: '14px' }}>
                            {scrapeProgress.map(p => (
                                <div key={p.source} className="scrape-row">
                                    <span style={{ color: STATUS_COLORS[p.status] || '#888', fontSize: '13px', marginRight: '4px' }}>
                                        {STATUS_ICON[p.status] || '•'}
                                    </span>
                                    <span className="scrape-source">{p.source}</span>
                                    {p.count > 0 && <span className="scrape-count">+{p.saved}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                    {scrapeFinished && (
                        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--green)' }}>
                            ✅ Scrape complete — results updated
                        </div>
                    )}
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--muted)' }}>
                        <Link to="/sources" style={{ color: 'var(--accent)' }}>View / manage sources →</Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="sidebar-section">
                    <div className="sidebar-title">// Filters</div>
                    <div className="filter-group">
                        <div className="filter-label">Sort By</div>
                        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="scrapedAt">Newest Scraped</option>
                            <option value="postedDate">Posted Date</option>
                            <option value="deadline">Deadline Soon</option>
                            <option value="relevance">Relevance</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <div className="filter-label">Category</div>
                        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
                            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <div className="filter-label">Type</div>
                        <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
                            <option value="">All</option>
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
                        <select className="filter-select" value={deadline} onChange={e => setDeadline(e.target.value)}>
                            <option value="">Any</option>
                            <option value="7">7 days</option>
                            <option value="14">14 days</option>
                            <option value="30">30 days</option>
                            <option value="60">60 days</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fetchResults(1)}>Apply</button>
                        <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Reset</button>
                    </div>
                </div>

                {/* Keywords */}
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
            </aside>

            {/* ═══ MAIN ═══ */}
            <main className="main-content">
                {/* Search bar */}
                <form className="search-bar" onSubmit={e => { e.preventDefault(); fetchResults(1); }}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by keyword, agency, or title…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>

                {/* DB not connected */}
                {isDbNotConnected && (
                    <div className="db-error-bar">
                        <div>
                            <strong>⚠ Database not connected</strong>
                            <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                Set <code>MONGODB_URI</code> in <code>server/.env</code> and restart the server.
                            </div>
                        </div>
                    </div>
                )}

                {/* Live scrape progress bar */}
                {scraping && (
                    <div className="scrape-live-bar">
                        <div className="scrape-live-dots">
                            <span /><span /><span />
                        </div>
                        <span>
                            Scraping {scrapeProgress.length} of 15 sources…
                            <strong style={{ marginLeft: '8px' }}>
                                {scrapeProgress.filter(p => p.status === 'done').reduce((a, p) => a + (p.saved || 0), 0)} new records found
                            </strong>
                        </span>
                    </div>
                )}

                {/* Results header */}
                {!isDbNotConnected && (
                    <div className="results-header">
                        <div className="results-count">
                            {loading ? 'Loading…' : <><strong>{total.toLocaleString()}</strong> result{total !== 1 ? 's' : ''}</>}
                        </div>
                    </div>
                )}

                {/* Results / States */}
                {loading ? (
                    <div className="loading"><div className="spinner" />Loading…</div>
                ) : !isDbNotConnected && results.length === 0 && !dbError ? (
                    <div className="empty">
                        <div className="empty-icon">📭</div>
                        <h3>No results yet</h3>
                        <p>Run the scraper to populate data from university portals.</p>
                        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={triggerScrape} disabled={scraping}>
                            🔄 Scrape Now
                        </button>
                    </div>
                ) : (
                    results.map((rfp, i) => <RfpCard key={rfp._id || i} rfp={rfp} />)
                )}

                {/* Pagination */}
                {pages > 1 && !dbError && (
                    <div className="pagination">
                        {page > 1 && <button className="page-btn" onClick={() => fetchResults(page - 1)}>← Prev</button>}
                        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                            const p = i + 1;
                            return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => fetchResults(p)}>{p}</button>;
                        })}
                        {page < pages && <button className="page-btn" onClick={() => fetchResults(page + 1)}>Next →</button>}
                    </div>
                )}
            </main>
        </div>
    );
}
