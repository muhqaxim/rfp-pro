import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Saved } from '../utils/storage';
import { deadlineInfo, fmtDate } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

const CAT_COLORS = {
    EDU: 'badge-green',
    CC: 'badge-blue',
    ITES: 'badge-blue',
    AI: 'badge-yellow',
    SW: 'badge-blue',
    MRB: 'badge-gray',
    BANKING: 'badge-yellow',
    STAFF: 'badge-gray',
    EXTRA: 'badge-gray',
};

export default function RfpCard({ rfp }) {
    const showToast = useToast();
    const rfpId = rfp._id || rfp.id || rfp.internalId;
    const [saved, setSaved] = useState(Saved.isSaved(rfpId));
    const dl = deadlineInfo(rfp.deadline);

    function handleSave() {
        if (saved) { Saved.remove(rfpId); setSaved(false); showToast('Removed from saved'); }
        else { Saved.save({ ...rfp, id: rfpId }); setSaved(true); showToast('Saved'); }
    }

    async function copyLink() {
        await navigator.clipboard.writeText(rfp.sourceUrl || window.location.href).catch(() => { });
        showToast('Copied');
    }

    return (
        <div className="rfp-card fade-in">
            {/* Header row */}
            <div className="card-header">
                <div className="card-meta-top">
                    {rfp.internalId && (
                        <span className="badge badge-blue mono" style={{ fontWeight: 700 }}>{rfp.internalId}</span>
                    )}
                    {rfp.categoryCode && rfp.categoryCode !== 'EXTRA' && (
                        <span className={`badge ${CAT_COLORS[rfp.categoryCode] || 'badge-gray'}`}>
                            {rfp.category || rfp.categoryCode}
                        </span>
                    )}
                    <span className="badge badge-gray">{rfp.type || 'RFP'}</span>
                    {dl && (
                        <span className={`badge ${dl.urgent ? 'badge-red' : dl.soon ? 'badge-yellow' : 'badge-green'
                            }`}>
                            {dl.label}
                        </span>
                    )}
                    {rfp.source && (
                        <span className="badge badge-gray" style={{ fontSize: '10px' }}>{rfp.source}</span>
                    )}
                </div>
                <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave} title={saved ? 'Unsave' : 'Save'}>
                    {saved ? '★' : '☆'}
                </button>
            </div>

            {/* Title */}
            <div className="card-title">
                <Link to={`/rfp/${rfpId}`}>{rfp.title}</Link>
            </div>

            {/* Meta */}
            <div className="card-info">
                {rfp.agency && <span title="Agency">🏛 {rfp.agency}</span>}
                {(rfp.city || rfp.state) && <span>📍 {[rfp.city, rfp.state].filter(Boolean).join(', ')}</span>}
                {rfp.postedDate && <span>📅 {fmtDate(rfp.postedDate)}</span>}
                {rfp.deadline && <span>⏰ Due {fmtDate(rfp.deadline)}</span>}
                {rfp.budgetText && <span>💰 {rfp.budgetText}</span>}
                {rfp.naicsCode && <span className="mono" style={{ fontSize: '11px', color: 'var(--subtle)' }}>NAICS {rfp.naicsCode}</span>}
                {rfp.scrapedAt && <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>Scraped {fmtDate(rfp.scrapedAt)}</span>}
            </div>

            {/* Description */}
            {(rfp.summary || rfp.description) && (
                <div className="card-desc">{rfp.summary || rfp.description}</div>
            )}

            {/* Footer */}
            <div className="card-footer">
                <div className="card-kw">
                    {(rfp.matchedKeywords || []).slice(0, 4).map(k => (
                        <span key={k} className="badge badge-gray">{k}</span>
                    ))}
                </div>
                <div className="card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={copyLink}>🔗 Copy</button>
                    {rfp.sourceUrl && (
                        <a className="btn btn-ghost btn-sm" href={rfp.sourceUrl} target="_blank" rel="noopener noreferrer">
                            Original ↗
                        </a>
                    )}
                    <Link className="btn btn-primary btn-sm" to={`/rfp/${rfpId}`}>Details →</Link>
                </div>
            </div>
        </div>
    );
}
