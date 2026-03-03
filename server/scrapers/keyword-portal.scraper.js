import axios from 'axios';
import * as cheerio from 'cheerio';
import { normalize } from '../processors/normalizer.js';
import { KEYWORDS } from '../processors/classifier.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function get(url, opts = {}) {
    return axios.get(url, {
        timeout: 20000,
        headers: { 'User-Agent': UA, ...opts.headers },
        ...opts,
    });
}

/**
 * Mature Solution: 
 * Scrape State-wide portals that aggregate university bids and allow KEYWORD search.
 */
export class KeywordStatePortalScraper {
    name = 'State Portals (Keyword Search)';

    // Top-tier keywords to search in each run
    topKeywords = KEYWORDS.slice(0, 20);

    async runAll() {
        const results = [];

        // 1. TEXAS ESBD (aggregates UT, TAMU, Tech, etc.)
        for (const kw of this.topKeywords) {
            try {
                // Texas ESBD has a simple keyword search
                const url = `https://www.txsmartbuy.com/esbd?keyword=${encodeURIComponent(kw)}`;
                const res = await get(url);
                const $ = cheerio.load(res.data);

                // ESBD results are often in a table or list
                $('table tr, .search-result-item').each((_, el) => {
                    const title = $(el).find('a').text().trim() || $(el).text().trim();
                    const href = $(el).find('a').attr('href') || '';
                    if (title.length < 15) return;

                    const fullUrl = href.startsWith('http') ? href : `https://www.txsmartbuy.com${href}`;
                    results.push(normalize({
                        source: 'Texas ESBD',
                        sourceId: href || title,
                        sourceUrl: fullUrl,
                        title,
                        agency: 'Texas State / University',
                        state: 'TX',
                        country: 'USA',
                        type: 'RFP'
                    }));
                });
            } catch (e) { }
        }

        // 2. NC eVP (aggregates UNC, NC State, etc.)
        for (const kw of this.topKeywords) {
            try {
                const url = `https://evp.nc.gov/solicitations/?keyword=${encodeURIComponent(kw)}`;
                const res = await get(url);
                const $ = cheerio.load(res.data);

                $('.view-content .views-row, .solicitation-item').each((_, el) => {
                    const title = $(el).find('a').text().trim() || $(el).find('h3').text().trim();
                    const href = $(el).find('a').attr('href') || '';
                    if (title.length < 15) return;

                    const fullUrl = href.startsWith('http') ? href : `https://evp.nc.gov${href}`;
                    results.push(normalize({
                        source: 'NC eVP',
                        sourceId: href || title,
                        sourceUrl: fullUrl,
                        title,
                        agency: 'NC State / University',
                        state: 'NC',
                        country: 'USA',
                        type: 'RFP'
                    }));
                });
            } catch (e) { }
        }

        // 3. Florida VBS 
        // Florida VBS usually needs a POST, so we'll skip the direct search for now 
        // and hope the direct university portals catch them.

        return results;
    }
}
