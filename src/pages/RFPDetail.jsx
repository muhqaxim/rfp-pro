import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Saved } from '../utils/storage';
import { deadlineInfo, fmtDate } from '../utils/helpers';
import { useToast } from '../hooks/useToast';

export default function RFPDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const showToast = useToast();
    const [rfp, setRfp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/rfps/${id}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setRfp(data);
                setSaved(Saved.isSaved(data._id || data.id));
            } catch {
                // fallback to saved list
                const s = Saved.getAll().find(r => (r._id || r.id) === id);
                if (s) { setRfp(s); setSaved(true); }
                else setError('This RFP could not be found. It may have been removed or expired.');
            }
            setLoading(false);
        }
        load();
    }, [id]);

    function toggleSave() {
        if (!rfp) return;
        const rfpId = rfp._id || rfp.id;
        if (saved) { Saved.remove(rfpId); setSaved(false); showToast('Removed'); }
        else { Saved.save({ ...rfp, id: rfpId }); setSaved(true); showToast('Saved'); }
    }

    if (loading) return <div className="page-inner"><div className="loading"><div className="spinner" />Loading…</div></div>;
    if (error) return (
        <div className="page-inner">
            <div className="empty">
                <div className="empty-icon">📭</div>
                <h3>{error}</h3>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>← Back to Listings</Link>
            </div>
        </div>
    );
    if (!rfp) return null;

    const dl = deadlineInfo(rfp.deadline);

    const metaFields = [
        { label: 'Internal ID', value: rfp.internalId },
        { label: 'Agency', value: rfp.agency },
        { label: 'Source', value: rfp.source },
        { label: 'Type', value: rfp.type },
        { label: 'Category', value: rfp.category },
        { label: 'State', value: rfp.state },
        { label: 'Location', value: [rfp.city, rfp.state, rfp.country].filter(Boolean).join(', ') },
        { label: 'Posted Date', value: rfp.postedDate ? fmtDate(rfp.postedDate) : null },
        { label: 'Deadline', value: rfp.deadline ? fmtDate(rfp.deadline) : null, highlight: dl?.urgent },
        { label: 'Budget', value: rfp.budgetText },
        { label: 'Contract Term', value: rfp.contractTerm },
        { label: 'NAICS Code', value: rfp.naicsCode ? `${rfp.naicsCode}${rfp.naicsDesc ? ` — ${rfp.naicsDesc}` : ''}` : null },
        { label: 'Contact', value: rfp.contactEmail },
        { label: 'Scraped At', value: rfp.scrapedAt ? fmtDate(rfp.scrapedAt) : null },
    ].filter(f => f.value);

    return (
        <div className="page-inner">
            <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Back
            </button>

            {/* Title + badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {rfp.internalId && <span className="badge badge-blue mono" style={{ fontWeight: 700, fontSize: '12px' }}>{rfp.internalId}</span>}
                        {rfp.categoryCode && rfp.categoryCode !== 'EXTRA' && <span className="badge badge-blue">{rfp.category}</span>}
                        <span className="badge badge-gray">{rfp.type || 'RFP'}</span>
                        {dl && <span className={`badge ${dl.urgent ? 'badge-red' : dl.soon ? 'badge-yellow' : 'badge-green'}`}>{dl.label}</span>}
                        {rfp.source && <span className="badge badge-gray" style={{ fontSize: '10px' }}>{rfp.source}</span>}
                    </div>
                    <h1 style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 700, lineHeight: 1.3, color: 'var(--ink)' }}>
                        {rfp.title}
                    </h1>
                </div>
                <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={toggleSave} style={{ width: '38px', height: '38px', fontSize: '18px', flexShrink: 0 }}>
                    {saved ? '★' : '☆'}
                </button>
            </div>

            {/* Meta grid */}
            <div className="detail-meta-grid">
                {metaFields.map(f => (
                    <div key={f.label} className="detail-meta-item">
                        <div className="detail-meta-label">{f.label}</div>
                        <div className="detail-meta-value" style={f.highlight ? { color: 'var(--red)' } : {}}>{f.value}</div>
                    </div>
                ))}
            </div>

            {/* Description */}
            {(rfp.description || rfp.summary) && (
                <div className="detail-section">
                    <div className="detail-section-title">Scope of Work / Description</div>
                    <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--ink2)', whiteSpace: 'pre-wrap' }}>
                        {rfp.description || rfp.summary}
                    </p>
                </div>
            )}

            {/* Keywords */}
            {rfp.matchedKeywords?.length > 0 && (
                <div className="detail-section">
                    <div className="detail-section-title">Matched Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '8px' }}>
                        {rfp.matchedKeywords.map(k => (
                            <Link key={k} to={`/?q=${encodeURIComponent(k)}`} className="badge badge-blue" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                                {k}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
                {rfp.sourceUrl && (
                    <a href={rfp.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        View Original Procurement Posting ↗
                    </a>
                )}
                <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(rfp.sourceUrl || window.location.href).then(() => showToast('Copied'))}>
                    🔗 Copy Link
                </button>
                <button className={`btn btn-ghost`} onClick={toggleSave}>
                    {saved ? '★ Saved' : '☆ Save'}
                </button>
            </div>
        </div>
    );
}
