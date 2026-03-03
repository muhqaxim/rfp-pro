import React, { useState, useEffect } from 'react';

// Canonical scraper source list (matches server runner)
const DEFAULT_SOURCES = [
    { name: 'University of Florida', url: 'https://procurement.ufl.edu/vendors/solicitations/', state: 'FL' },
    { name: 'Florida State University', url: 'https://www.purchasing.fsu.edu/vendors/current-solicitations/', state: 'FL' },
    { name: 'Ohio State University', url: 'https://busfin.osu.edu/purchasing-contracts/bidding-opportunities', state: 'OH' },
    { name: 'University of Louisville', url: 'https://louisville.edu/purchasing/bids', state: 'KY' },
    { name: 'Penn State University', url: 'https://www.procurement.psu.edu/solicitations', state: 'PA' },
    { name: 'Mississippi State University', url: 'https://www.procurement.msstate.edu/procurement/bids/', state: 'MS' },
    { name: 'University of Connecticut', url: 'https://purchasing.procurement.uconn.edu/home-2/bid-opportunities-2020/', state: 'CT' },
    { name: 'Georgia Tech', url: 'https://procurement.gatech.edu/solicitations', state: 'GA' },
    { name: 'University of Michigan', url: 'https://procurement.umich.edu/suppliers/solicitations', state: 'MI' },
    { name: 'University of Washington', url: 'https://facilities.uw.edu/projects/business-opportunities/solicitations', state: 'WA' },
    { name: 'Maricopa CC District', url: 'https://www.maricopa.edu/about-us/governance/procurement', state: 'AZ' },
    { name: 'Michigan State University', url: 'https://www.ctlr.msu.edu/COBidding/Solicitation.aspx', state: 'MI' },
    { name: 'University of Texas System', url: 'https://utsystem.edu/offices/business-affairs/procurement/vendor-information/solicitations', state: 'TX' },
    { name: 'NC State University', url: 'https://purchasing.ncsu.edu/solicitations/', state: 'NC' },
    { name: 'University of Minnesota', url: 'https://policy.umn.edu/procurement/procurement-appendix1', state: 'MN' },
];

export default function Sources() {
    const [sources, setSources] = useState(DEFAULT_SOURCES);
    const [editing, setEditing] = useState(null); // index being edited
    const [editForm, setEditForm] = useState({ name: '', url: '', state: '' });
    const [stats, setStats] = useState({});

    useEffect(() => {
        // Fetch per-source counts from stats endpoint
        fetch('/api/rfps/stats')
            .then(r => r.json())
            .then(d => {
                const map = {};
                (d.bySource || []).forEach(s => { map[s._id] = s.count; });
                setStats(map);
            })
            .catch(() => { });
    }, []);

    function startEdit(i) {
        setEditing(i);
        setEditForm({ ...sources[i] });
    }

    function saveEdit() {
        const updated = [...sources];
        updated[editing] = editForm;
        setSources(updated);
        setEditing(null);
    }

    function addSource() {
        setSources(prev => [...prev, { name: 'New University', url: 'https://', state: 'US' }]);
        setEditing(sources.length);
        setEditForm({ name: 'New University', url: 'https://', state: 'US' });
    }

    return (
        <div className="page-inner" style={{ maxWidth: '960px' }}>
            <div className="page-top">
                <div>
                    <div className="page-eyebrow">// Data Sources</div>
                    <h1 className="page-title">University Portals</h1>
                    <p className="page-sub">{sources.length} institutions configured · click a row to edit · scraped data is stored in MongoDB</p>
                </div>
                <button className="btn btn-primary" onClick={addSource}>+ Add Source</button>
            </div>

            <div className="sources-table-wrap">
                <table className="sources-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Institution</th>
                            <th>State</th>
                            <th>Portal URL</th>
                            <th>Records</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map((s, i) => (
                            <tr key={i} className={editing === i ? 'editing-row' : ''}>
                                {editing === i ? (
                                    <>
                                        <td><span className="source-num">{i + 1}</span></td>
                                        <td>
                                            <input
                                                className="source-input"
                                                value={editForm.name}
                                                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                                placeholder="University Name"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="source-input"
                                                value={editForm.state}
                                                onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))}
                                                placeholder="ST"
                                                style={{ width: '56px' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="source-input"
                                                value={editForm.url}
                                                onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))}
                                                placeholder="https://..."
                                                style={{ width: '100%', minWidth: '280px' }}
                                            />
                                        </td>
                                        <td>—</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td><span className="source-num">{i + 1}</span></td>
                                        <td className="source-name-cell">{s.name}</td>
                                        <td><span className="badge badge-type">{s.state}</span></td>
                                        <td>
                                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="source-url-link">
                                                {s.url.replace('https://', '').split('/')[0]}
                                            </a>
                                        </td>
                                        <td>
                                            <span className="badge badge-blue">{stats[s.name] ?? '—'}</span>
                                        </td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" onClick={() => startEdit(i)}>Edit</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', padding: '16px 20px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--ink)' }}>Note:</strong> Edits here update the display only. To add a new scraper to the actual data pipeline, update <code>server/scrapers/universities.scraper.js</code> and <code>server/scrapers/runner.js</code>, then restart the server.
            </div>
        </div>
    );
}
