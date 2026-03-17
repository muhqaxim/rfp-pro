import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Saved } from '../utils/storage';

export default function Nav() {
    const loc = useLocation();
    const savedCount = Saved.count();
    const act = (p) => loc.pathname === p || loc.pathname.startsWith(p + '/') ? ' active' : '';

    return (
        <nav className="nav">
            <Link to="/" className="nav-logo">
                <img src="/itod.png" alt="iTOD" />
            </Link>
            <div className="nav-links">
                <Link to="/" className={`nav-link${act('/') === ' active' && loc.pathname === '/' ? ' active' : loc.pathname.startsWith('/rfp') ? '' : act('/')}`}>RFPs</Link>
                <Link to="/sources" className={`nav-link${act('/sources')}`}>Sources</Link>
                <Link to="/saved" className={`nav-link${act('/saved')}`}>
                    Saved {savedCount > 0 && <span className="nav-badge">{savedCount}</span>}
                </Link>
            </div>
        </nav>
    );
}
