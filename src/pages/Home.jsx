import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KEYWORDS } from '../data/keywords';
import RfpAPI from '../utils/samApi';

const SOURCES = [
    'University of Florida', 'Florida State University', 'Ohio State University',
    'University of Louisville', 'Penn State University', 'Mississippi State University',
    'University of Connecticut', 'Georgia Tech', 'University of Michigan',
    'University of Washington', 'Maricopa CC District', 'Michigan State University',
    'University of Texas System', 'NC State University', 'University of Minnesota',
];

export default function Home() {
    const [stats, setStats] = useState({ total: 0, active: 0, byCategory: [] });

    useEffect(() => {
        RfpAPI.getStats().then(d => {
            if (d.total > 0) setStats(d);
        }).catch(() => { });
    }, []);

    return (
        <>
            {/* HERO */}
            <section className="hero">
                <div className="hero-left fade-up">
                    <div className="hero-eyebrow">Higher Education Procurement</div>
                    <h1>Find Every<br /><em>Relevant</em><br />RFP. Fast.</h1>
                    <p className="hero-sub">
                        ITOD Scraper aggregates live procurement data from 15 top US universities and state portals — financial aid, student services, IT support, enrollment management, and more.
                    </p>
                    <div className="hero-cta">
                        <Link to="/search" className="btn btn-primary" style={{ fontSize: '15px', padding: '13px 28px' }}>
                            Browse Live RFPs →
                        </Link>
                        <Link to="/saved" className="btn btn-outline" style={{ fontSize: '15px', padding: '13px 28px' }}>
                            My Saved RFPs
                        </Link>
                    </div>
                </div>

                <div className="hero-right fade-up" style={{ animationDelay: '150ms' }}>
                    <div className="stats-panel">
                        <div className="stats-panel-title">// Live Database</div>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-num">{stats.active > 0 ? stats.active.toLocaleString() : '15+'}</div>
                                <div className="stat-label">Active RFPs</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-num">{stats.total > 0 ? stats.total.toLocaleString() : '50+'}</div>
                                <div className="stat-label">Total Indexed</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-num">15</div>
                                <div className="stat-label">Institutions</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-num">8</div>
                                <div className="stat-label">RFP Categories</div>
                            </div>
                        </div>

                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '1px' }}>
                            DATA SOURCES
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {SOURCES.slice(0, 6).map(s => (
                                <span key={s} className="badge badge-type" style={{ fontSize: '10px' }}>{s}</span>
                            ))}
                            <span className="badge badge-closed" style={{ fontSize: '10px' }}>+9 more</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features">
                <div className="features-inner">
                    <div className="section-label">How It Works</div>
                    <h2 className="features-heading">From university portals to your dashboard</h2>
                    <div className="features-grid">
                        {[
                            { icon: '🕷', title: 'Automated Scraping', desc: '15 university and state procurement portals are scraped daily. Every new bid is captured, classified, and stored in one searchable database.' },
                            { icon: '🤖', title: 'Auto Classification', desc: 'Each RFP is automatically tagged with a category code (EDU, CC, ITES, AI, SW…) and matched against 30+ higher-ed keywords.' },
                            { icon: '🔍', title: 'Powerful Search', desc: 'Search by keyword, filter by category, state, deadline window, or opportunity type. Full-text search across title, description, and agency.' },
                            { icon: '🔖', title: 'Save & Track', desc: 'Bookmark opportunities you\'re pursuing. Your saved RFPs are stored in your browser and always accessible from the Saved tab.' },
                            { icon: '⏰', title: 'Deadline Tracking', desc: 'Color-coded badges show urgent, upcoming, and open deadlines at a glance so you never miss a submission window.' },
                            { icon: '📄', title: 'Full Detail View', desc: 'Click any RFP to see the complete record — agency contact, budget text, NAICS code, matched keywords, and a direct link to the original posting.' },
                        ].map(f => (
                            <div key={f.title} className="feature-card">
                                <div className="feature-icon">{f.icon}</div>
                                <div className="feature-title">{f.title}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* KEYWORDS */}
            <section className="keywords-section">
                <div className="section-label">Coverage</div>
                <h2 style={{ fontSize: 'clamp(26px,3vw,38px)', marginBottom: '12px' }}>30+ Tracked Keywords</h2>
                <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '560px' }}>
                    Every search spans financial aid, enrollment, student lifecycle, IT support, and more — click any keyword to search now.
                </p>
                <div className="kw-cloud">
                    {KEYWORDS.map(kw => (
                        <Link key={kw} to={`/search?q=${encodeURIComponent(kw)}`} className="kw-pill">
                            {kw}
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-band">
                <h2>Start finding your next contract</h2>
                <p>Browse live RFPs from 15 US universities — updated daily, no API key required.</p>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/search" className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>
                        Browse RFPs →
                    </Link>
                    <Link to="/saved" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', fontSize: '15px', padding: '14px 32px' }}>
                        My Saved RFPs
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer>
                <div className="footer-logo">ITOD Scraper</div>
                <div>Data aggregated from 15 US university procurement portals</div>
                <div>Built for Higher Education Procurement</div>
            </footer>
        </>
    );
}
