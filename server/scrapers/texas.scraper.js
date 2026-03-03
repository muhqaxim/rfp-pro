import axios from 'axios';
import * as cheerio from 'cheerio';
import { normalize } from '../processors/normalizer.js';

// Texas Electronic State Business Daily
// https://www.esbd.cpa.texas.gov/
export class TexasScraper {
    constructor() {
        this.name = 'Texas ESBD';
        this.baseUrl = 'https://www.esbd.cpa.texas.gov';
    }

    async run(keyword = 'university') {
        try {
            // ESBD search form — POST or GET vary; using GET with query string
            const searchUrl = `${this.baseUrl}/advsrch.cfm?keyword=${encodeURIComponent(keyword)}&category=&agency=&status=Open`;
            const res = await axios.get(searchUrl, {
                timeout: 15000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });

            const $ = cheerio.load(res.data);
            const results = [];

            // Parse results table
            $('table.resultsTable tr, table tr').each((i, row) => {
                if (i === 0) return; // skip header row
                const cols = $(row).find('td');
                if (cols.length < 3) return;

                const titleCell = $(cols[0]);
                const link = titleCell.find('a');
                const href = link.attr('href') || '';
                const title = link.text().trim() || titleCell.text().trim();
                if (!title) return;

                const agency = $(cols[1]).text().trim();
                const deadline = $(cols[2]).text().trim();
                const posted = $(cols[3])?.text()?.trim() || '';

                results.push(normalize({
                    source: 'Texas ESBD',
                    sourceId: href.split('id=')[1] || href,
                    sourceUrl: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                    title,
                    agency,
                    postedDate: posted,
                    deadline,
                    state: 'TX',
                    country: 'USA',
                    type: 'RFP',
                }));
            });

            console.log(`  [Texas ESBD] Found ${results.length} listings for "${keyword}"`);
            return results;
        } catch (e) {
            console.error('  [Texas ESBD] Error:', e.message);
            return [];
        }
    }

    async runAll() {
        const keywords = ['university', 'college', 'student services', 'financial aid', 'IT support'];
        const all = [];
        for (const kw of keywords) {
            const rows = await this.run(kw);
            all.push(...rows);
            await new Promise(r => setTimeout(r, 2000));
        }
        const seen = new Set();
        return all.filter(r => {
            const key = r.sourceId || r.title;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}
