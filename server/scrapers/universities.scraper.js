import axios from 'axios';
import * as cheerio from 'cheerio';
import { normalize } from '../processors/normalizer.js';
import { scrapeWithPuppeteer } from './puppeteer-utils.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function get(url, opts = {}) {
    return axios.get(url, {
        timeout: 30000,
        headers: {
            'User-Agent': UA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            ...opts.headers
        },
        ...opts,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERAL JAGGAER SCRAPER (Uses Puppeteer for JS)
// ─────────────────────────────────────────────────────────────────────────────
class JaggaerScraper {
    constructor(name, url, state) {
        this.name = name;
        this.url = url;
        this.state = state;
    }
    async runAll() {
        try {
            // Jaggaer portals are JS intensive, use Puppeteer
            const html = await scrapeWithPuppeteer(this.url, 'a.btn-link-header, .eventName a, table tr td a');
            const $ = cheerio.load(html);
            const results = [];

            $('a.btn-link-header, .eventName a, table tr td a, .solicitation-title a, .view-content a').each((_, el) => {
                const title = $(el).text().trim();
                const href = $(el).attr('href') || '';
                if (title.length < 10 || href.includes('javascript') || href === '#') return;

                const fullUrl = href.startsWith('http') ? href : `${new URL(this.url).origin}${href}`;

                results.push(normalize({
                    source: this.name,
                    sourceId: href.split('EventId=')[1] || title,
                    sourceUrl: fullUrl,
                    title,
                    agency: this.name,
                    state: this.state,
                    country: 'USA',
                    type: 'RFP'
                }));
            });

            return results;
        } catch (e) {
            console.error(`  [${this.name}] ${e.message}`);
            // Fallback to axios if puppeteer fails
            try {
                const res = await get(this.url);
                const $ = cheerio.load(res.data);
                const results = [];
                $('a').each((_, el) => {
                    const title = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (title.length > 20 && (href.includes('bid') || href.includes('solicit'))) {
                        results.push(normalize({ source: this.name, sourceId: href, sourceUrl: href, title, agency: this.name, state: this.state, country: 'USA', type: 'RFP' }));
                    }
                });
                return results;
            } catch { return []; }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STATE-WIDE PORTAL SCRAPERS (axios preferred for speed if HTML is stable)
// ─────────────────────────────────────────────────────────────────────────────
class StatePortalScraper {
    constructor(name, url, state, selectors) {
        this.name = name;
        this.url = url;
        this.state = state;
        this.selectors = selectors;
    }
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];

            $(this.selectors.row || 'a').each((_, el) => {
                const link = $(el).is('a') ? $(el) : $(el).find(this.selectors.link || 'a').first();
                const title = link.text().trim() || $(el).find(this.selectors.title).text().trim();
                const href = link.attr('href') || '';
                if (title.length < 10) return;

                const fullUrl = href.startsWith('http') ? href : `${new URL(this.url).origin}${href}`;

                results.push(normalize({
                    source: this.name, sourceId: href || title, sourceUrl: fullUrl,
                    title, agency: this.name, state: this.state, country: 'USA', type: 'RFP'
                }));
            });
            return results;
        } catch (e) {
            return [];
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIFIC IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export class UnivFloridaScraper extends JaggaerScraper {
    constructor() { super('University of Florida', 'https://bids.sciquest.com/apps/Router/PublicEvent?CustomerOrg=Florida', 'FL'); }
}

export class FSUScraper extends JaggaerScraper {
    constructor() { super('Florida State University', 'https://bids.sciquest.com/apps/Router/PublicEvent?CustomerOrg=FSU', 'FL'); }
}

export class UMichiganScraper extends JaggaerScraper {
    constructor() { super('University of Michigan', 'https://procurement.umich.edu/suppliers/electronic-bidding', 'MI'); }
}

export class OhioStateScraper {
    name = 'Ohio State University';
    url = 'https://procurement.osu.edu/bid-opportunities';
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];
            $('table tbody tr, .views-row').each((_, row) => {
                const link = $(row).find('a').first();
                const title = link.text().trim();
                const href = link.attr('href') || '';
                if (title.length < 8) return;
                const fullUrl = href.startsWith('http') ? href : `https://procurement.osu.edu${href}`;
                results.push(normalize({
                    source: this.name, sourceId: href, sourceUrl: fullUrl,
                    title, agency: this.name, state: 'OH', country: 'USA', type: 'RFP'
                }));
            });
            return results;
        } catch (e) { return []; }
    }
}

export class MSUScraper {
    name = 'Mississippi State University';
    url = 'https://www.procurement.msstate.edu/procurement/bids/index.php';
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];
            $('.content-area a, table a').each((_, el) => {
                const href = $(el).attr('href') || '';
                const title = $(el).text().trim();
                if (title.length < 10) return;
                if (!href.includes('.pdf') && !href.includes('bid')) return;
                const fullUrl = href.startsWith('http') ? href : `https://www.procurement.msstate.edu/procurement/bids/${href}`;
                results.push(normalize({ source: this.name, sourceId: href, sourceUrl: fullUrl, title, agency: this.name, state: 'MS', country: 'USA', type: 'RFP' }));
            });
            return results;
        } catch (e) { return []; }
    }
}

export class GaTechScraper extends JaggaerScraper {
    constructor() { super('Georgia Tech', 'https://procurement.gatech.edu/departmental-resources/active-itbs-and-rfps', 'GA'); }
}

export class NCStateScraper extends StatePortalScraper {
    constructor() {
        super('NC State University', 'https://evp.nc.gov/solicitations/', 'NC', {
            row: '.solicitation-item, tr, .views-row',
            link: 'a',
            title: 'h3'
        });
    }
}

export class TexasAMScraper extends JaggaerScraper {
    constructor() { super('Texas A&M University', 'https://purchasing.tamu.edu/suppliers/bid-opportunities/index.html', 'TX'); }
}

export class UWashingtonScraper {
    name = 'University of Washington';
    url = 'https://university-of-washington.public-portal.us.workdayspend.com/';
    async runAll() {
        try {
            // Workday portals are JS intensive, use Puppeteer
            const html = await scrapeWithPuppeteer(this.url, 'a');
            const $ = cheerio.load(html);
            const results = [];
            $('a').each((_, el) => {
                const title = $(el).text().trim();
                const href = $(el).attr('href') || '';
                if (title.length < 10 || !href.includes('solicitation')) return;
                const fullUrl = href.startsWith('http') ? href : `${this.url}${href}`;
                results.push(normalize({ source: this.name, sourceId: href, sourceUrl: fullUrl, title, agency: this.name, state: 'WA', country: 'USA', type: 'RFP' }));
            });
            return results;
        } catch (e) { return []; }
    }
}

export class UMinnesotaScraper extends JaggaerScraper {
    constructor() { super('University of Minnesota', 'https://purchasing.umn.edu/suppliers', 'MN'); }
}

export class UTSystemScraper {
    name = 'University of Texas System';
    url = 'https://www.utsystem.edu/offices/procurement/bid-opportunities';
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];
            $('a[href*="solicit"], a[href*="bid"]').each((_, el) => {
                const title = $(el).text().trim();
                const href = $(el).attr('href') || '';
                if (title.length < 10) return;
                const fullUrl = href.startsWith('http') ? href : `https://www.utsystem.edu${href}`;
                results.push(normalize({ source: this.name, sourceId: href, sourceUrl: fullUrl, title, agency: this.name, state: 'TX', country: 'USA', type: 'RFP' }));
            });
            return results;
        } catch (e) { return []; }
    }
}

export class LouisvilleScraper {
    name = 'University of Louisville';
    url = 'https://louisville.edu/procurement/bids';
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];
            $('.field-item a, tr a').each((_, el) => {
                const title = $(el).text().trim();
                const href = $(el).attr('href') || '';
                if (title.length < 10) return;
                const fullUrl = href.startsWith('http') ? href : `https://louisville.edu${href}`;
                results.push(normalize({ source: this.name, sourceId: href, sourceUrl: fullUrl, title, agency: this.name, state: 'KY', country: 'USA', type: 'RFP' }));
            });
            return results;
        } catch (e) { return []; }
    }
}

export class PennStateScraper {
    name = 'Penn State University';
    url = 'https://purchasing.psu.edu/bid-opportunities';
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];
            $('article a, .content a').each((_, el) => {
                const title = $(el).text().trim();
                const href = $(el).attr('href') || '';
                if (title.length < 10) return;
                const fullUrl = href.startsWith('http') ? href : `https://purchasing.psu.edu${href}`;
                results.push(normalize({ source: this.name, sourceId: href, sourceUrl: fullUrl, title, agency: this.name, state: 'PA', country: 'USA', type: 'RFP' }));
            });
            return results;
        } catch (e) { return []; }
    }
}

export class UConnScraper {
    name = 'University of Connecticut';
    url = 'https://purchasing.uconn.edu/bid-opportunities/';
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];
            $('.entry-content a, tr a').each((_, el) => {
                const title = $(el).text().trim();
                const href = $(el).attr('href') || '';
                if (title.length < 10) return;
                const fullUrl = href.startsWith('http') ? href : `https://purchasing.uconn.edu${href}`;
                results.push(normalize({ source: this.name, sourceId: href, sourceUrl: fullUrl, title, agency: this.name, state: 'CT', country: 'USA', type: 'RFP' }));
            });
            return results;
        } catch (e) { return []; }
    }
}

export class MichiganStateScraper {
    name = 'Michigan State University';
    url = 'https://usd.msu.edu/procurement/bids-forecasts/index.html';
    async runAll() {
        try {
            const res = await get(this.url);
            const $ = cheerio.load(res.data);
            const results = [];
            $('a').each((_, el) => {
                const title = $(el).text().trim();
                const href = $(el).attr('href') || '';
                if (title.length < 10 || !href.includes('bid')) return;
                const fullUrl = href.startsWith('http') ? href : `https://usd.msu.edu${href}`;
                results.push(normalize({ source: this.name, sourceId: href, sourceUrl: fullUrl, title, agency: this.name, state: 'MI', country: 'USA', type: 'RFP' }));
            });
            return results;
        } catch (e) { return []; }
    }
}
