import puppeteer from 'puppeteer';
import { normalize } from '../processors/normalizer.js';

// Florida MyFloridaMarketPlace Vendor Bid System
// https://www.myfloridamarketplace.com/bso/
export class FloridaScraper {
    constructor() {
        this.name = 'Florida VBS';
    }

    async run(keyword = 'university') {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            await page.goto(
                'https://www.myfloridamarketplace.com/bso/external/publicBidSearchResults.sdo',
                { waitUntil: 'networkidle2', timeout: 20000 }
            );

            // Fill in keyword search
            await page.evaluate((kw) => {
                const el = document.querySelector('input[name="keyword"], #keyword, input[type="text"]');
                if (el) el.value = kw;
            }, keyword);

            await page.click('input[type="submit"], button[type="submit"]').catch(() => { });
            await page.waitForSelector('table', { timeout: 15000 }).catch(() => { });

            const results = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('table tbody tr, table tr'));
                return rows.slice(1).map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    const titleCell = cells[0];
                    const link = titleCell?.querySelector('a');
                    return {
                        title: link?.innerText?.trim() || titleCell?.innerText?.trim(),
                        agency: cells[1]?.innerText?.trim(),
                        deadline: cells[2]?.innerText?.trim(),
                        sourceUrl: link?.href,
                    };
                }).filter(r => r.title);
            });

            await browser.close();
            console.log(`  [Florida VBS] Found ${results.length} for "${keyword}"`);

            return results.map(r => normalize({
                ...r,
                source: 'Florida VBS',
                sourceId: r.sourceUrl?.split('solicitation_number=')[1] || r.title,
                state: 'FL',
                country: 'USA',
                type: 'RFP',
            }));
        } catch (e) {
            if (browser) await browser.close().catch(() => { });
            console.error('  [Florida VBS] Error:', e.message);
            return [];
        }
    }

    async runAll() {
        return this.run('university');
    }
}
