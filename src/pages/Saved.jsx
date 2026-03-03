import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Saved } from '../utils/storage';
import { deadlineInfo, fmtDate, copyToClipboard } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

export default function SavedPage() {
    const showToast = useToast();
    const [, forceUpdate] = useState(0);
    const refresh = useCallback(() => forceUpdate(n => n + 1), []);

    const saved = Saved.getAll();

    function handleRemove(id) {
        Saved.remove(id);
        refresh();
        showToast('Removed from saved RFPs');
    }

    function handleClearAll() {
        if (!window.confirm('Remove all saved RFPs?')) return;
        localStorage.removeItem('saved_rfps');
        refresh();
        showToast('All saved RFPs cleared');
    }

    function handleCopy(rfp) {
        copyToClipboard(rfp.url).then(() => showToast('Link copied to clipboard'));
    }

    return (
        <div className="page-inner">
            <div className="page-top">
                <div>
                    <h1 className="page-title">Saved RFPs</h1>
                    <p className="page-sub" id="savedSub">
                        {saved.length
                            ? `${saved.length} bookmark${saved.length !== 1 ? 's' : ''} — click ★ to remove`
                            : 'Your bookmarked procurement opportunities'}
                    </p>
                </div>
                {saved.length > 0 && (
                    <button className="clear-btn" onClick={handleClearAll}>Clear All</button>
                )}
            </div>

            <div id="savedList">
                {saved.length === 0 ? (
                    <div className="empty">
                        <div className="empty-icon">🔖</div>
                        <h3>No saved RFPs yet</h3>
                        <p>Search for procurement opportunities and click the ☆ bookmark button to save them here.</p>
                        <Link to="/search" className="btn btn-primary">Search RFPs →</Link>
                    </div>
                ) : (
                    saved.map((rfp, i) => {
                        const dl = deadlineInfo(rfp.deadline);
                        const kwHtml = (rfp.keywords || []).slice(0, 3);
                        const savedDate = rfp.savedAt
                            ? new Date(rfp.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '';

                        return (
                            <div key={rfp.id} className="rfp-card fade-up" data-id={rfp.id} style={{ animationDelay: `${i * 40}ms` }}>
                                {savedDate && <div className="saved-meta">Saved on {savedDate}</div>}
                                <div className="card-header">
                                    <div className="card-meta-top">
                                        <span className="badge badge-type">{rfp.type || 'RFP'}</span>
                                        <span className={`badge ${dl.cls}`}>{dl.label}</span>
                                    </div>
                                    <button className="save-btn saved" onClick={() => handleRemove(rfp.id)} title="Remove bookmark">★</button>
                                </div>
                                <h3 className="card-title">
                                    <a href={rfp.url} target="_blank" rel="noopener noreferrer">{rfp.title}</a>
                                </h3>
                                <div className="card-info">
                                    <span>🏛 {rfp.agency}</span>
                                    {rfp.state && <span>📍 {rfp.state}</span>}
                                    <span>📅 Posted {fmtDate(rfp.posted)}</span>
                                </div>
                                <p className="card-desc">{rfp.description || rfp.summary || 'Click View Details to see the full RFP.'}</p>
                                <div className="card-footer">
                                    <div className="card-kw">
                                        {kwHtml.map(k => (
                                            <span key={k} className="badge badge-blue" style={{ fontSize: '10px' }}>{k}</span>
                                        ))}
                                    </div>
                                    <div className="card-actions">
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(rfp)}>Copy Link</button>
                                        <a href={rfp.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">View RFP →</a>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
