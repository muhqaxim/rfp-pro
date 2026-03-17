import {
    UnivFloridaScraper,
    OhioStateScraper,
    LouisvilleScraper,
    PennStateScraper,
    MSUScraper,
    UConnScraper,
    GaTechScraper,
    UMichiganScraper,
    UWashingtonScraper,
    MichiganStateScraper,
    UTSystemScraper,
    FSUScraper,
    NCStateScraper,
    UMinnesotaScraper,
    TexasAMScraper,
} from './universities.scraper.js';
import { KeywordStatePortalScraper } from './keyword-portal.scraper.js';
import { saveRFPs } from '../processors/deduplicator.js';
import { scrapeState, resetState, updateProgress, finishState } from './scrapeState.js';

export const SCRAPERS = [
    new KeywordStatePortalScraper(), // New primary keyword-driven source
    new UnivFloridaScraper(),
    new FSUScraper(),
    new OhioStateScraper(),
    new LouisvilleScraper(),
    new PennStateScraper(),
    new MSUScraper(),
    new UConnScraper(),
    new GaTechScraper(),
    new UMichiganScraper(),
    new UWashingtonScraper(),
    new MichiganStateScraper(),
    new UTSystemScraper(),
    new NCStateScraper(),
    new UMinnesotaScraper(),
    new TexasAMScraper(),
];

async function runScraper(scraper) {
    updateProgress(scraper.name, 'running', 0, 0);
    console.log(`\n🕷  [${scraper.name}] Running...`);
    try {
        const results = await scraper.runAll();
        if (results.length === 0) {
            updateProgress(scraper.name, 'empty', 0, 0);
            console.log(`   ⚠ No listings found`);
            return { name: scraper.name, fetched: 0, saved: 0, dupes: 0, errors: 0 };
        }
        const stats = await saveRFPs(results);
        updateProgress(scraper.name, 'done', results.length, stats.saved);
        console.log(`   ✅ Fetched: ${results.length}  Saved: ${stats.saved}  Dupes: ${stats.dupes}`);
        return { name: scraper.name, fetched: results.length, ...stats };
    } catch (e) {
        updateProgress(scraper.name, 'error', 0, 0);
        console.error(`   ❌ Failed: ${e.message}`);
        return { name: scraper.name, fetched: 0, saved: 0, dupes: 0, errors: 1 };
    }
}

export async function runAllScrapers() {
    if (scrapeState.running) {
        console.log('⚠ Scrape already in progress');
        return;
    }

    resetState();
    console.log('\n═══════════════════════════════════');
    console.log(` ITOD Scraper — Scraping ${SCRAPERS.length} sources`);
    console.log('═══════════════════════════════════\n');

    const summary = [];
    for (const s of SCRAPERS) {
        summary.push(await runScraper(s));
        // Smaller delay for the new keyword scraper as it has many internal sub-requests
        const delay = s.name === 'State Portals (Keyword Search)' ? 1000 : 2000;
        await new Promise(r => setTimeout(r, delay));
    }

    finishState();
    const total = summary.reduce((a, r) => ({ f: a.f + r.fetched, s: a.s + r.saved }), { f: 0, s: 0 });
    console.log(`\n✅ Done — Fetched: ${total.f}  New: ${total.s}\n`);
    return summary;
}
